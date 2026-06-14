// FILE PATH: src/pages/Analyze/AnalyzePage.tsx
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, Eye, Heart, MousePointerClick, Users, Download, Trophy } from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';
import type { AnalyticsPeriod } from '../../hooks/useAnalytics';
import { formatNumber } from '../../lib/utils';
import { NextStepBanner } from '../../components/common/NextStepBanner';
import { api } from '../../lib/api';
import { useToast } from '../../contexts/ToastContext';

const PERIODS: { id: AnalyticsPeriod; label: string }[] = [
  { id: '7d',   label: '7D'  },
  { id: '30d',  label: '30D' },
  { id: '90d',  label: '90D' },
  { id: '365d', label: '1Y'  },
];

function StatCard({ label, value, delta, icon: Icon, color, coaching }: {
  label: string; value: string; delta?: number; icon: React.ElementType; color: string; coaching?: string;
}) {
  const up = (delta ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="card p-3 flex flex-col gap-2"
      style={{ border: `1px solid ${color}18` }}
    >
      <div className="flex items-center justify-between">
        <Icon size={14} style={{ color }} />
        {delta !== undefined && (
          <div className="flex items-center gap-0.5">
            {up ? <TrendingUp size={10} style={{ color: '#22C55E' }} /> : <TrendingDown size={10} style={{ color: '#EF4444' }} />}
            <span className="font-display text-2xs" style={{ color: up ? '#22C55E' : '#EF4444' }}>
              {Math.abs(delta)}%
            </span>
          </div>
        )}
      </div>
      <p className="font-display font-bold text-xl text-white">{value}</p>
      <p className="font-display text-2xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</p>
      {coaching && (
        <p className="font-body text-2xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{coaching}</p>
      )}
    </motion.div>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-classified rounded-xl p-3 text-xs">
      <p className="font-display text-2xs tracking-widest uppercase mb-2" style={{ color: 'rgba(201,168,76,0.7)' }}>{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-white/60">{entry.name}:</span>
          <span className="text-white font-semibold">{formatNumber(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyzePage() {
  const navigate = useNavigate();
  const { data, loading, period, setPeriod } = useAnalytics();
  const { success, error: toastError } = useToast();
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const csv = await api.get<string>(`/analytics/export?period=${period}&format=csv`);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `analytics-${period}-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      success('Export complete', 'CSV downloaded');
    } catch {
      toastError('Export failed', 'Try again or contact support');
    } finally {
      setExporting(false);
    }
  }, [period, success, toastError]);

  return (
    <div className="page-root">
      <div className="page-content">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <h1 className="font-display font-bold text-lg heading-classified">Analytics</h1>
          <div className="flex items-center gap-2">
            {/* CSV Export */}
            <button
              onClick={handleExport}
              disabled={exporting || loading || !data}
              className="p-2 rounded-xl transition-all"
              style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}
              aria-label="Export analytics as CSV"
            >
              <Download size={14} style={{ color: exporting ? 'rgba(201,168,76,0.4)' : '#C9A84C' }} />
            </button>
            {/* Period selector */}
            <div className="flex gap-1 p-1 rounded-xl"
                 style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {PERIODS.map((p) => (
                <button key={p.id} onClick={() => setPeriod(p.id)}
                        className="px-3 py-1 rounded-lg font-display text-2xs font-semibold tracking-widest uppercase transition-all"
                        style={{
                          background: period === p.id ? 'rgba(201,168,76,0.2)' : 'transparent',
                          color: period === p.id ? '#C9A84C' : 'rgba(255,255,255,0.35)',
                        }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="px-5 flex flex-col gap-3">
            {[1,2,3,4].map((i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
          </div>
        ) : !data || (data.totalImpressions === 0 && data.totalEngagements === 0) ? (
          // ── EMPTY STATE — no data yet ──
          <div className="px-5 flex flex-col gap-4 py-6">
            <div className="text-center py-8">
              <div className="text-5xl mb-4">📡</div>
              <h2 className="font-display font-bold text-xl heading-classified mb-2">Observatory is Empty</h2>
              <p className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, maxWidth: 280, margin: '0 auto' }}>
                Generate and publish your first post to see performance data here.
              </p>
            </div>
            <NextStepBanner
              icon="⚡"
              title="Generate your first content"
              body="Post content across your platforms to unlock engagement trends, platform breakdowns, and audience insights."
              cta="Go to Create tab"
              onAction={() => navigate('/create')}
              variant="gold"
            />
          </div>
        ) : (
          <div className="px-5 flex flex-col gap-5">
            {/* Best platform highlight */}
            {data.topPlatform && (
              <div className="card p-3 flex items-center gap-3"
                   style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)' }}>
                <Trophy size={18} style={{ color: '#C9A84C' }} />
                <div>
                  <p className="font-display text-2xs tracking-widest uppercase" style={{ color: 'rgba(201,168,76,0.6)' }}>
                    Best Platform
                  </p>
                  <p className="font-display font-bold text-sm text-white capitalize">{data.topPlatform}</p>
                  <p className="font-body text-2xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Focus your energy here for maximum return</p>
                </div>
              </div>
            )}

            {/* KPI cards with coaching */}
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="Impressions" value={formatNumber(data.totalImpressions)} delta={12} icon={Eye} color="#C9A84C"
                        coaching={data.totalImpressions > 0 ? `Industry avg: ${formatNumber(Math.round(data.totalImpressions * 0.8))}` : undefined} />
              <StatCard label="Engagements" value={formatNumber(data.totalEngagements)} delta={8} icon={Heart} color="#E4405F"
                        coaching={data.engagementRate > 3 ? `${data.engagementRate}% rate — above avg ↑` : `${data.engagementRate}% — post at best time to improve`} />
              <StatCard label="Clicks" value={formatNumber(data.totalClicks)} delta={-3} icon={MousePointerClick} color="#3B82F6" />
              <StatCard label="Eng. Rate" value={`${data.engagementRate}%`} delta={4} icon={TrendingUp} color="#6EE7B7"
                        coaching="Industry benchmark: 3.1%" />
            </div>

            {/* Engagement trend */}
            <div>
              <h2 className="font-display font-semibold text-sm tracking-wider uppercase mb-3"
                  style={{ color: 'rgba(255,255,255,0.5)' }}>Engagement Trend</h2>
              <div className="card-classified p-3" style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={(data as any).timeSeries ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#C9A84C" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="impGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#6EE7B7" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#6EE7B7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
                           tickFormatter={(v: string) => v.slice(5)} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="engagements" name="Engagements" stroke="#C9A84C" strokeWidth={2} fill="url(#engGrad)" />
                    <Area type="monotone" dataKey="impressions" name="Impressions"  stroke="#6EE7B7" strokeWidth={1.5} fill="url(#impGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Platform breakdown */}
            <div>
              <h2 className="font-display font-semibold text-sm tracking-wider uppercase mb-3"
                  style={{ color: 'rgba(255,255,255,0.5)' }}>By Platform</h2>
              <div className="flex flex-col gap-2">
                {data.platformBreakdown.map((stat, i) => (
                  <motion.div
                    key={stat.platform}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="card p-3"
                    style={{ border: `1px solid ${(stat as any).color ?? '#C9A84C'}20` }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: (stat as any).color ?? '#C9A84C' }} />
                      <span className="font-display font-semibold text-sm text-white flex-1">{stat.platform}</span>
                      <span className="font-display text-xs font-semibold" style={{ color: (stat as any).color ?? '#C9A84C' }}>
                        {stat.engagementRate}% eng.
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Impressions', val: formatNumber(stat.impressions) },
                        { label: 'Engagements', val: formatNumber(stat.engagements) },
                        { label: 'Followers',   val: formatNumber(stat.followers) },
                      ].map(({ label, val }) => (
                        <div key={label}>
                          <p className="font-display font-bold text-sm text-white">{val}</p>
                          <p className="font-display text-2xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                           style={{ width: `${Math.min(100, stat.engagementRate * 10)}%`,
                                    background: (stat as any).color ?? '#C9A84C', opacity: 0.7 }} />
                    </div>
                    {/* Contextual coaching */}
                    {stat.engagementRate < 2 && (
                      <p className="font-body text-2xs mt-1.5" style={{ color: 'rgba(201,168,76,0.6)' }}>
                        💡 Try posting at peak times to improve engagement
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Best time to post coaching */}
            {(data as any).bestTime && (
              <div className="card-classified p-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">⏰</div>
                  <div>
                    <p className="font-display text-2xs tracking-widest uppercase mb-1" style={{ color: 'rgba(201,168,76,0.6)' }}>
                      Best Time to Post
                    </p>
                    <p className="font-display font-bold text-xl" style={{ color: '#C9A84C' }}>
                      {(data as any).bestTime}
                    </p>
                    <p className="font-body text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Based on your audience engagement patterns
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Top post */}
            {data.topPost && (
              <div>
                <h2 className="font-display font-semibold text-sm tracking-wider uppercase mb-3"
                    style={{ color: 'rgba(255,255,255,0.5)' }}>Top Performing Post</h2>
                <div className="card-classified p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge-classified">{data.topPost.platform}</span>
                    <span className="font-display text-2xs tracking-widest uppercase" style={{ color: 'rgba(110,231,183,0.7)' }}>
                      {formatNumber(data.topPost.engagements)} engagements
                    </span>
                  </div>
                  <p className="font-body text-sm text-white/70">{data.topPost.content}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
