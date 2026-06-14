// FILE PATH: src/hooks/useAnalytics.ts
// FIX: replaced buildMockData() with real API call.
// Mock data is now ONLY used as a zero-state skeleton when the API
// returns empty (new user with no connected platforms yet).
// Once live API keys are added this returns real platform data.
import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { useCachedFetch, CACHE_TTL } from '../lib/cache';
import { useAuth } from '../contexts/AuthContext';

export type AnalyticsPeriod = '7d' | '30d' | '90d' | '365d';

export interface PlatformStat {
  platform:       string;
  impressions:    number;
  engagements:    number;
  clicks:         number;
  followers:      number;
  engagementRate: number;
  color:          string;
}

export interface TimeSeriesPoint {
  date:        string;
  impressions: number;
  engagements: number;
  clicks:      number;
}

export interface AnalyticsData {
  period:            AnalyticsPeriod;
  totalImpressions:  number;
  totalEngagements:  number;
  totalClicks:       number;
  engagementRate:    number;
  followerGrowth:    number;
  followerGrowthPct: number;
  platformStats:     PlatformStat[];
  timeSeries:        TimeSeriesPoint[];
  topPost:           { platform: string; content: string; engagements: number } | null;
}

// Zero-state for new users with no connected platforms.
// Returns all zeros — shows empty states rather than fake numbers.
function buildZeroState(period: AnalyticsPeriod): AnalyticsData {
  return {
    period,
    totalImpressions:  0,
    totalEngagements:  0,
    totalClicks:       0,
    engagementRate:    0,
    followerGrowth:    0,
    followerGrowthPct: 0,
    platformStats:     [],
    timeSeries:        [],
    topPost:           null,
  };
}

export function useAnalytics(brandId?: string) {
  const { session } = useAuth();
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d');

  // Build cache key per user + period so different periods don't collide
  const cacheKey = `analytics:${session?.user?.id ?? 'anon'}:${period}${brandId ? `:${brandId}` : ''}`;

  const { data, loading, error, refetch } = useCachedFetch<AnalyticsData>(
    cacheKey,
    async () => {
      // ── LIVE API CALL ─────────────────────────────────────────
      // Requires: VITE_API_BASE_URL set in .env
      // Requires: backend /analytics/overview endpoint running
      // Requires: social platform API keys connected by user in Settings
      //
      // When API keys are not yet connected, backend returns zero data
      // and buildZeroState() below handles the empty display.
      try {
        const params = new URLSearchParams({ period });
        if (brandId) params.set('brandId', brandId);
        return await api.get<AnalyticsData>(`/analytics/overview?${params.toString()}`);
      } catch (err) {
        // If backend is not yet deployed, return zero state rather than crashing.
        // Remove this catch block once backend is live.
        console.warn('[useAnalytics] API unavailable, showing zero state:', err);
        return buildZeroState(period);
      }
    },
    CACHE_TTL.ANALYTICS,
  );

  // When period changes, refetch
  useEffect(() => { refetch(); }, [period]);

  return {
    data:       data ?? buildZeroState(period),
    loading,
    error,
    period,
    setPeriod,
    refetch,
  };
}
