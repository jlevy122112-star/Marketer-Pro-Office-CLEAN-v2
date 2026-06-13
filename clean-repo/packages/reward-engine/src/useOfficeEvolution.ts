// ─────────────────────────────────────────────────────────────────────────────
// REWARD ENGINE — useOfficeEvolution
// The main hook. Fetches real state from the backend, records events,
// handles level-up detection, achievement unlocking, and streak tracking.
// No mock data. All numbers come from the live API.
// ─────────────────────────────────────────────────────────────────────────────

import {
  useState, useEffect, useCallback, useRef,
} from 'react';
import type {
  OfficeState,
  EventType,
  Achievement,
  Department,
  RewardEngineCallbacks,
} from './types';
import {
  DEPARTMENTS,
  ACHIEVEMENT_DEFINITIONS,
  STREAK_MILESTONES,
  getXPProgress,
  getLevelFromXP,
} from './config';

const API_BASE = (() => {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL)
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL)
    return (import.meta as any).env.VITE_API_BASE_URL;
  return '';
})();

interface ProgressionAPIResponse {
  xp:              number;
  level:           number;
  streak:          {
    currentStreak:  number;
    longestStreak:  number;
    lastActiveDate: string | null;
  };
  achievements:    Array<{ key: string; unlockedAt: string }>;
  totalPosts:      number;
  totalGenerations:number;
}

async function fetchProgression(getToken: () => Promise<string | null>): Promise<ProgressionAPIResponse> {
  const token = await getToken();
  const res = await fetch(`${API_BASE}/progression`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Progression fetch failed: ${res.status}`);
  const json = await res.json();
  return json.data;
}

async function postEvent(
  eventType: EventType,
  metadata: Record<string, unknown> | undefined,
  getToken: () => Promise<string | null>,
): Promise<ProgressionAPIResponse> {
  const token = await getToken();
  const res = await fetch(`${API_BASE}/progression/event`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ eventType, metadata }),
  });
  if (!res.ok) throw new Error(`Event POST failed: ${res.status}`);
  const json = await res.json();
  return json.data;
}

function buildOfficeState(data: ProgressionAPIResponse): OfficeState {
  const { xp } = data;
  const { level, xpInLevel, xpToNextLevel, percentToNext } = getXPProgress(xp);

  const unlockedAchievementKeys = new Set(data.achievements.map((a) => a.key));
  const achievements: Achievement[] = ACHIEVEMENT_DEFINITIONS.map((def) => {
    const unlocked = unlockedAchievementKeys.has(def.key);
    const match    = data.achievements.find((a) => a.key === def.key);
    return { ...def, unlocked, unlockedAt: match?.unlockedAt };
  });

  const departments: Department[] = DEPARTMENTS.map((dept) => ({
    ...dept,
    unlocked: level >= dept.requiredLevel,
  }));

  const today    = new Date().toISOString().slice(0, 10);
  const lastDate = data.streak.lastActiveDate;
  const streakActive = lastDate === today ||
    (!!lastDate && new Date(today).getTime() - new Date(lastDate).getTime() <= 86400000);

  return {
    userId:         '',
    xp,
    level,
    xpInLevel,
    xpToNextLevel,
    percentToNext,
    departments,
    achievements,
    streak: {
      currentStreak:  data.streak.currentStreak,
      longestStreak:  data.streak.longestStreak,
      lastActiveDate: data.streak.lastActiveDate,
      streakActive,
    },
    totalPosts:       data.totalPosts,
    totalGenerations: data.totalGenerations,
  };
}

interface UseOfficeEvolutionOptions extends RewardEngineCallbacks {
  /** Required — how to get the current auth token */
  getToken: () => Promise<string | null>;
  /** Whether to automatically record a daily_login event on mount */
  recordLoginOnMount?: boolean;
}

export function useOfficeEvolution({
  getToken,
  recordLoginOnMount = true,
  onLevelUp,
  onAchievement,
  onStreakMilestone,
}: UseOfficeEvolutionOptions) {
  const [state, setState]   = useState<OfficeState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);
  const prevLevelRef        = useRef<number | null>(null);
  const prevAchievementsRef = useRef<Set<string>>(new Set());
  const prevStreakRef        = useRef<number>(0);

  // ── Fetch initial state ──────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data     = await fetchProgression(getToken);
      const newState = buildOfficeState(data);
      setState(newState);
      prevLevelRef.current = newState.level;
      prevAchievementsRef.current = new Set(
        newState.achievements.filter((a) => a.unlocked).map((a) => a.id),
      );
      prevStreakRef.current = newState.streak.currentStreak;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load progression');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { load(); }, [load]);

  // ── Auto-record daily login on mount ────────────────────────────────────
  useEffect(() => {
    if (!recordLoginOnMount || loading || error) return;
    recordEvent('daily_login').catch(() => {
      // Silently fail — login recording should never block the UI
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // ── Detect level-up and new achievements after any state update ──────────
  function detectProgressionMilestones(newState: OfficeState) {
    // Level-up
    const prevLevel = prevLevelRef.current;
    if (prevLevel !== null && newState.level > prevLevel) {
      const newDepts = newState.departments.filter(
        (d) => d.unlocked && d.requiredLevel === newState.level,
      );
      onLevelUp?.(newState.level, newDepts);
    }
    prevLevelRef.current = newState.level;

    // New achievements
    const prevKeys = prevAchievementsRef.current;
    newState.achievements
      .filter((a) => a.unlocked && !prevKeys.has(a.id))
      .forEach((a) => {
        onAchievement?.(a);
        prevKeys.add(a.id);
      });
    prevAchievementsRef.current = prevKeys;

    // Streak milestones
    const currentStreak = newState.streak.currentStreak;
    const prevStreak    = prevStreakRef.current;
    STREAK_MILESTONES.forEach((milestone) => {
      if (currentStreak >= milestone && prevStreak < milestone) {
        onStreakMilestone?.(milestone);
      }
    });
    prevStreakRef.current = currentStreak;
  }

  // ── Record an event and update local state optimistically ─────────────────
  const recordEvent = useCallback(async (
    eventType: EventType,
    metadata?: Record<string, unknown>,
  ): Promise<void> => {
    try {
      const data     = await postEvent(eventType, metadata, getToken);
      const newState = buildOfficeState(data);
      setState(newState);
      detectProgressionMilestones(newState);
    } catch (e) {
      // Non-blocking — XP recording failure should never break the user's flow
      console.warn('[RewardEngine] Event recording failed:', e);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken]);

  // ── Convenience wrappers called from feature code ─────────────────────────
  const recordContentGenerated    = useCallback(() => recordEvent('content_generated'), [recordEvent]);
  const recordPostPublished       = useCallback(() => recordEvent('post_published'), [recordEvent]);
  const recordPostScheduled       = useCallback(() => recordEvent('post_scheduled'), [recordEvent]);
  const recordCampaignCreated     = useCallback(() => recordEvent('campaign_created'), [recordEvent]);
  const recordBrandCreated        = useCallback(() => recordEvent('brand_created'), [recordEvent]);
  const recordPlatformConnected   = useCallback((platformId: string) => recordEvent('platform_connected', { platformId }), [recordEvent]);
  const recordArtifactSaved       = useCallback(() => recordEvent('artifact_saved'), [recordEvent]);
  const recordProfileCompleted    = useCallback(() => recordEvent('profile_completed'), [recordEvent]);

  return {
    state,
    loading,
    error,
    refetch: load,
    recordEvent,
    recordContentGenerated,
    recordPostPublished,
    recordPostScheduled,
    recordCampaignCreated,
    recordBrandCreated,
    recordPlatformConnected,
    recordArtifactSaved,
    recordProfileCompleted,
  };
}
