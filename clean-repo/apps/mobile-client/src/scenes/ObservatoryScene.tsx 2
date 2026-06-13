'use client';

// ─────────────────────────────────────────────────────────────────────────────
// OBSERVATORY SCENE
// Full analytics deep-dive. Real data from /analytics/overview.
// Charts, platform breakdown, best time to post, top posts.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import { Container, Stack, Row, Card, Heading, Text, Chip } from '@marketer-pro/ui';
import { colors, fonts, fontSizes, fontWeights, letterSpacings, space, radii } from '@marketer-pro/ui';
import { api } from '../lib/api';

type Period = '7d' | '30d' | '90d' | '365d';

interface PlatformMetric {
  platform:       string;
  impressions:    number;
  engagements:    number;
  clicks:         number;
  followers:      number;
  followerDelta:  number;
  engagementRate: number;
  color:          string;
}

interface TimePoint {
  date:        string;
  impressions: number;
  engagements: number;
  clicks:      number;
}

interface AnalyticsData {
  period:                 Period;
  totalImpressions:       number;
  totalEngagements:       number;
  totalClicks:            number;
  overallEngagementRate:  number;
  followerGrowth:         number;
  platformMetrics:        PlatformMetric[];
  timeSeries:             TimePoint[];
  bestTime:               string;
  bestPlatform:           string;
  topPosts:               Array<{ id: string; content: string; impressions: number; engagements: number; platform: string }>;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(10,14,28,0.97)', border: `1px solid ${colors.classified.border}`, backdropFilter: 'blur(10px)' }}>
      <Text variant="faint" size="2xs" weight="bold" uppercase style={{ letterSpacing: letterSpacings.widest, marginBottom: 6 }}>{label}</Text>
      {payload.map((e: any) => (
        <Row key={e.name} gap={8} align="center" style={{ marginBottom: 3 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: e.color }} aria-hidden />
          <Text variant="tertiary" size="xs">{e.name}:</Text>
          <Text variant="primary" size="xs" weight="bold">{fmt(e.value)}</Text>
        </Row>
      ))}
    </div>
  );
}

export default function ObservatoryScene() {
  const navigate   = useNavigate();
  const [period, setPeriod]   = useState<Period>('30d');
  const [data, setData]       = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<AnalyticsData>(`/analytics/overview?period=${period}`);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: colors.void[900], display: 'flex', flexDirection: 'column', paddingTop: 'var(--sat,0px)' }}>

      {/* Header */}
      <Row gap={12} align="center" style={{ padding: `${space[4]} ${space[5]} ${space[3]}` }}>
        <button onClick={() => navigate(-1)} aria-label="Back"
          style={{ color: colors.text.tertiary, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <Heading level={2} gold>Observatory</Heading>
          <Text variant="faint" size="xs" style={{ marginTop: 2 }}>Analytics Command Center</Text>
        </div>
        {/* Period selector */}
        <div style={{ display: 'flex', gap: 2, padding: 3, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: `1px solid ${colors.border.subtle}` }}>
          {(['7d','30d','90d','365d'] as Period[]).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{ padding: '4px 8px', borderRadius: 7, fontFamily: fonts.display, fontSize: fontSizes['2xs'], fontWeight: fontWeights.bold, letterSpacing: letterSpacings.wider, cursor: 'pointer', background: period === p ? colors.classified.faint : 'transparent', color: period === p ? colors.classified.DEFAULT : colors.text.faint, border: 'none', transition: 'all 0.2s' }}>
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </Row>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: `0 ${space[5]} ${space[5]}`, WebkitOverflowScrolling: 'touch' }}>
        {loading ? (
          <Stack gap={12}>
            {[80,80,200,200].map((h,i) => <Card key={i} loading style={{ height: h }} />)}
          </Stack>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text variant="error" size="base">{error}</Text>
            <button onClick={load} style={{ marginTop: 12, color: colors.classified.DEFAULT, background: 'none', border: 'none', cursor: 'pointer', fontFamily: fonts.display, fontSize: fontSizes.xs, fontWeight: fontWeights.bold, letterSpacing: letterSpacings.wider, textTransform: 'uppercase' }}>
              Retry
            </button>
          </div>
        ) : data && (
          <Stack gap={20}>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Impressions', value: fmt(data.totalImpressions),          delta: null, color: colors.classified.DEFAULT },
                { label: 'Engagements', value: fmt(data.totalEngagements),          delta: null, color: '#E4405F' },
                { label: 'Clicks',      value: fmt(data.totalClicks),               delta: null, color: '#3B82F6' },
                { label: 'Eng. Rate',   value: `${data.overallEngagementRate}%`,    delta: null, color: colors.reactor.DEFAULT },
              ].map((k) => (
                <motion.div key={k.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <Card accent={k.color} padding="14px" style={{ borderRadius: radii.xl }}>
                    <Text variant="faint" size="2xs" weight="bold" uppercase style={{ letterSpacing: letterSpacings.widest, marginBottom: 6 }}>{k.label}</Text>
                    <Text variant="primary" size="2xl" weight="extrabold" style={{ fontFamily: fonts.display, lineHeight: 1 }}>{k.value}</Text>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Best time */}
            {data.bestTime && (
              <Card accent={colors.classified.DEFAULT} padding="14px" style={{ borderRadius: radii.xl }}>
                <Row gap={14} align="center">
                  <span style={{ fontSize: 28 }} aria-hidden>⏰</span>
                  <div>
                    <Text variant="faint" size="2xs" weight="bold" uppercase style={{ letterSpacing: letterSpacings.widest, marginBottom: 3 }}>Best Time to Post</Text>
                    <Text variant="gold" size="2xl" weight="extrabold" style={{ fontFamily: fonts.display }}>{data.bestTime}</Text>
                    <Text variant="faint" size="xs" style={{ marginTop: 3 }}>Based on your audience engagement</Text>
                  </div>
                </Row>
              </Card>
            )}

            {/* Trend chart */}
            <div>
              <Text variant="faint" size="2xs" weight="bold" uppercase style={{ letterSpacing: letterSpacings.widest, marginBottom: 10, display: 'block' }}>Engagement Trend</Text>
              <div
                role="img"
                aria-label={`Engagement trend over ${period}`}
                style={{ padding: '14px 8px', borderRadius: radii['2xl'], background: colors.void[800], border: `1px solid ${colors.classified.border}`, height: 180 }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.timeSeries} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={colors.classified.DEFAULT} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={colors.classified.DEFAULT} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={colors.reactor.DEFAULT} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={colors.reactor.DEFAULT} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.22)', fontSize: 9 }} tickFormatter={(v) => v.slice(5)} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.22)', fontSize: 9 }} />
                    <Tooltip content={<ChartTip />} />
                    <Area type="monotone" dataKey="engagements" name="Engagements" stroke={colors.classified.DEFAULT} strokeWidth={2} fill="url(#g1)" />
                    <Area type="monotone" dataKey="impressions" name="Impressions"  stroke={colors.reactor.DEFAULT}    strokeWidth={1.5} fill="url(#g2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Platform breakdown */}
            {data.platformMetrics.map((m, i) => (
              <motion.div key={m.platform} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Card accent={m.color} padding="14px" style={{ borderRadius: radii.xl }}>
                  <Row justify="space-between" align="center" style={{ marginBottom: 10 }}>
                    <Row gap={8} align="center">
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: m.color }} aria-hidden />
                      <Text variant="primary" size="base" weight="bold" style={{ fontFamily: fonts.display, textTransform: 'capitalize' }}>{m.platform}</Text>
                    </Row>
                    <Text size="sm" weight="bold" style={{ color: m.color }}>{m.engagementRate}% eng.</Text>
                  </Row>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 10 }}>
                    {[
                      { label: 'Impressions', val: fmt(m.impressions) },
                      { label: 'Engagements', val: fmt(m.engagements) },
                      { label: 'Followers',   val: fmt(m.followers) },
                    ].map(({ label, val }) => (
                      <div key={label}>
                        <Text variant="primary" size="xl" weight="extrabold" style={{ fontFamily: fonts.display, lineHeight: 1 }}>{val}</Text>
                        <Text variant="faint" size="2xs" weight="bold" uppercase style={{ letterSpacing: letterSpacings.widest, marginTop: 3 }}>{label}</Text>
                      </div>
                    ))}
                  </div>
                  <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, m.engagementRate * 10)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      style={{ height: '100%', borderRadius: 2, background: m.color, opacity: 0.75 }} />
                  </div>
                </Card>
              </motion.div>
            ))}

            {/* Top posts */}
            {data.topPosts.length > 0 && (
              <div>
                <Text variant="faint" size="2xs" weight="bold" uppercase style={{ letterSpacing: letterSpacings.widest, marginBottom: 10, display: 'block' }}>Top Performing</Text>
                <Stack gap={8}>
                  {data.topPosts.slice(0,3).map((post, i) => (
                    <Card key={post.id} padding="14px" style={{ borderRadius: radii.xl }}>
                      <Row gap={12} align="flex-start">
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: colors.classified.ghost, border: `1px solid ${colors.classified.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Text variant="gold" size="sm" weight="bold">{i + 1}</Text>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text variant="secondary" size="sm" style={{ lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 6 }}>
                            {post.content}
                          </Text>
                          <Row gap={14}>
                            <Text variant="faint" size="xs" mono>{fmt(post.impressions)} impr.</Text>
                            <Text size="xs" mono style={{ color: colors.reactor.DEFAULT }}>{fmt(post.engagements)} eng.</Text>
                          </Row>
                        </div>
                      </Row>
                    </Card>
                  ))}
                </Stack>
              </div>
            )}
          </Stack>
        )}
      </div>
    </div>
  );
}
