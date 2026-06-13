'use client';

// ─────────────────────────────────────────────────────────────────────────────
// PROGRESSION CONTEXT
// Exposes the reward engine state globally so any component
// can read XP / level / streak without prop-drilling.
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext, useContext, type ReactNode,
} from 'react';
import { useOfficeEvolution } from '@marketer-pro/reward-engine';
import { useAuth } from './AuthContext';
import type { OfficeState, EventType } from '@marketer-pro/reward-engine';

interface ProgressionCtx {
  state:       OfficeState | null;
  loading:     boolean;
  recordEvent: (eventType: EventType, metadata?: Record<string, unknown>) => Promise<void>;
}

const Ctx = createContext<ProgressionCtx | null>(null);

export function ProgressionProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();

  const engine = useOfficeEvolution({
    getToken:          async () => session?.access_token ?? null,
    recordLoginOnMount:true,
  });

  return (
    <Ctx.Provider value={{
      state:       engine.state,
      loading:     engine.loading,
      recordEvent: engine.recordEvent,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useProgressionContext(): ProgressionCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProgressionContext must be inside ProgressionProvider');
  return ctx;
}    setIsLoading(true);
    try {
      const [progRes, officeRes, achRes] = await Promise.all([
        fetch('/api/progression', { credentials: 'include' }),
        fetch('/api/progression/office', { credentials: 'include' }),
        fetch('/api/progression/achievements', { credentials: 'include' }),
      ]);
      if (progRes.ok) setProgression(await progRes.json());
      if (officeRes.ok) setOfficeState(await officeRes.json());
      if (achRes.ok) {
        const data = await achRes.json();
        setAchievements(data.achievements);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchProgression();
  }, [isAuthenticated]);

  const awardXp = async (amount: number, reason: string) => {
    const res = await fetch('/api/progression/xp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ amount, reason }),
    });
    if (res.ok) {
      const data = await res.json();
      setProgression(data.progression);
      setOfficeState(data.officeState);
    }
  };

  const openLootbox = async (): Promise<LootboxReward[]> => {
    const res = await fetch('/api/rewards/lootbox/open', {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to open lootbox');
    const data = await res.json();
    return data.rewards;
  };

  return (
    <ProgressionContext.Provider
      value={{
        progression,
        officeState,
        achievements,
        isLoading,
        awardXp,
        openLootbox,
        refreshProgression: fetchProgression,
      }}
    >
      {children}
    </ProgressionContext.Provider>
  );
};

export const useProgression = (): ProgressionContextValue => {
  const ctx = useContext(ProgressionContext);
  if (!ctx) throw new Error('useProgression must be used within ProgressionProvider');
  return ctx;
};
