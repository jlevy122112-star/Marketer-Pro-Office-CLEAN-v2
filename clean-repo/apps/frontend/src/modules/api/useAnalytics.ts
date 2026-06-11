'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { getPlatformColor } from '@/lib/utils';

export type Period = '7d' | '30d' | '90d' | '365d';

export interface PlatformMetric {
  platform: string;
  impressions: number;
  engagements: number;
  clicks: number;
  followers: number;
  followerDelta: number;
  engagementRate: number;
  color: string;
}

export interface TimePoint {
  date: string;
  impressions: number;
  engagements: number;
  clicks: number;
}

export interface AnalyticsData {
  period: Period;
  totalImpressions: number;
  totalReach: number;
  totalEngagements: number;
  totalClicks: number;
  overallEngagementRate: number;
  followerGrowth: number;
  followerGrowthPct: number;
  platformMetrics: PlatformMetric[];
  timeSeries: TimePoint[];
}

function buildMock(period: Period): AnalyticsData {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
  const m = days / 7;

  const platforms = ['instagram','facebook','linkedin','twitter','tiktok'];
  const platformMetrics: PlatformMetric[] = platforms.map((p) => ({
    platform: p,
    impressions:     Math.round((8000  + Math.random() * 12000) * m),
    engagements:     Math.round((400   + Math.random() * 900)   * m),
    clicks:          Math.round((150   + Math.random() * 400)   * m),
    followers:       Math.round(1500   + Math.random() * 5000),
    followerDelta:   Math.round((20    + Math.random() * 200)   * m),
    engagementRate:  parseFloat((3 + Math.random() * 6).toFixed(1)),
    color: getPlatformColor(p),
  }));

  const pts = Math.min(days, 30);
  const timeSeries: TimePoint[] = Array.from({ length: pts }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (pts - 1 - i));
    return {
      date:        d.toISOString().slice(0, 10),
      impressions: Math.round(600  + Math.sin(i * 0.4) * 300 + Math.random() * 200),
      engagements: Math.round(35   + Math.sin(i * 0.4) * 15  + Math.random() * 10),
      clicks:      Math.round(20   + Math.sin(i * 0.4) * 10  + Math.random() * 8),
    };
  });

  const totalImpressions  = platformMetrics.reduce((a, p) => a + p.impressions, 0);
  const totalEngagements  = platformMetrics.reduce((a, p) => a + p.engagements, 0);

  return {
    period,
    totalImpressions,
    totalReach:             Math.round(totalImpressions * 0.78),
    totalEngagements,
    totalClicks:            platformMetrics.reduce((a, p) => a + p.clicks, 0),
    overallEngagementRate:  parseFloat((totalEngagements / totalImpressions * 100).toFixed(1)),
    followerGrowth:         platformMetrics.reduce((a, p) => a + p.followerDelta, 0),
    followerGrowthPct:      2.8,
    platformMetrics,
    timeSeries,
  };
}

export function useAnalytics() {
  const [period, setPeriod]   = useState<Period>('30d');
  const [data, setData]       = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // swap with: const d = await api.get<AnalyticsData>(`/analytics/overview?period=${period}`);
      await new Promise((r) => setTimeout(r, 500));
      setData(buildMock(period));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, period, setPeriod, refetch: fetch };
}
