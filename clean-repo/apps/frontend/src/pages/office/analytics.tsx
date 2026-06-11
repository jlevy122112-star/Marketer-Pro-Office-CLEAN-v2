// The Plan, Analytics, and Settings pages have no pull-to-refresh.
// On mobile, users expect swipe-down-to-refresh on any content list.

function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);

  const handlers = {
    onTouchStart: (e: React.TouchEvent) => { startY.current = e.touches[0].clientY; },
    onTouchMove: (e: React.TouchEvent) => {
      const deltaY = e.touches[0].clientY - startY.current;
      if (deltaY > 80 && !refreshing) {
        setRefreshing(true);
        onRefresh().finally(() => setRefreshing(false));
      }
    },
  };

  return { refreshing, handlers };
}


'use client';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { useAnalytics, type Period } from '@/modules/api/useAnalytics';
import { formatNumber } from '@/lib/utils';

const PERIODS: { id: Period; label: string }[] = [
  { id: '7d', label: '7D' }, { id: '30d', label: '30D' },
  { id: '90d', label: '90D' }, { id: '365d', label: '1Y' },
];

function Tip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(10,14,28,0.96)', border: '1px solid rgba(201,168,76,0.2)' }}>
      <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.6)', marginBottom: 6 }}>{label}</p>
      {payload.map((e: any) => (
        <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: e.color }} />
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{e.name}:</span>
          <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 12, fontWeight: 700, color: '#fff' }}>{formatNumber(e.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { data, loading, period, setPeriod } = useAnalytics();

  return (
    <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 80 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px 10px' }}>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, background: 'linear-gradient(135deg,#C9A84C,#E8C54E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Analytics</h1>
        <div style={{ display: 'flex', gap: 2, padding: 3, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {PERIODS.map((p) => (
            <button key={p.id} onClick={() => setPeriod(p.id)} style={{ padding: '5px 10px', borderRadius: 7, fontFamily: "'Syne',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', cursor: 'pointer', background: period === p.id ? 'rgba(201,168,76,0.18)' : 'transparent', color: period === p.id ? '#C9A84C' : 'rgba(255,255,255,0.35)', border: 'none' }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[80,80,180,180].map((h, i) => (
            <div key={i} style={{ height: h, borderRadius: 16, background: 'linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.07) 50%,rgba(255,255,255,0.04) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.8s linear infinite' }} />
          ))}
        </div>
      ) : data && (
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Impressions', value: formatNumber(data.totalImpressions),   delta: 12,  color: '#C9A84C' },
              { label: 'Engagements', value: formatNumber(data.totalEngagements),   delta: 8,   color: '#E4405F' },
              { label: 'Clicks',      value: formatNumber(data.totalClicks),        delta: -3,  color: '#3B82F6' },
              { label: 'Eng. Rate',   value: `${data.overallEngagementRate}%`,      delta: 4,   color: '#6EE7B7' },
            ].map((k) => (
              <motion.div key={k.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                style={{ padding: 14, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: `1px solid ${k.color}18` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>{k.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    {k.delta >= 0 ? <TrendingUp size={10} style={{ color: '#22C55E' }} /> : <TrendingDown size={10} style={{ color: '#EF4444' }} />}
                    <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700, color: k.delta >= 0 ? '#22C55E' : '#EF4444' }}>{Math.abs(k.delta)}%</span>
                  </div>
                </div>
                <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: '#fff' }}>{k.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Trend chart */}
          <div>
            <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>Engagement Trend</p>
            <div style={{ padding: '14px 8px', borderRadius: 18, background: 'rgba(13,17,32,0.7)', border: '1px solid rgba(201,168,76,0.14)', height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.timeSeries} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#C9A84C" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6EE7B7" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6EE7B7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.22)', fontSize: 9 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.22)', fontSize: 9 }} />
                  <Tooltip content={<Tip />} />
                  <Area type="monotone" dataKey="engagements" name="Engagements" stroke="#C9A84C" strokeWidth={2} fill="url(#g1)" />
                  <Area type="monotone" dataKey="impressions" name="Impressions" stroke="#6EE7B7" strokeWidth={1.5} fill="url(#g2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Platform bars */}
          <div>
            <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>By Platform</p>
            <div style={{ padding: '14px 8px', borderRadius: 18, background: 'rgba(13,17,32,0.7)', border: '1px solid rgba(201,168,76,0.14)', height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.platformMetrics} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="platform" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.22)', fontSize: 9 }} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="engagements" name="Engagements" radius={[4,4,0,0]}>
                    {data.platformMetrics.map((e, i) => <Cell key={i} fill={e.color} opacity={0.85} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Platform list */}
          <div>
            <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>Platform Breakdown</p>
            {data.platformMetrics.map((m, i) => (
              <motion.div key={m.platform} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                style={{ padding: 14, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: `1px solid ${m.color}18`, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: m.color }} />
                    <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: '#fff', textTransform: 'capitalize' }}>{m.platform}</span>
                  </div>
                  <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, color: m.color }}>{m.engagementRate}% eng.</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 10 }}>
                  {[
                    { label: 'Impressions', val: formatNumber(m.impressions) },
                    { label: 'Engagements', val: formatNumber(m.engagements) },
                    { label: 'Followers',   val: formatNumber(m.followers)   },
                  ].map(({ label, val }) => (
                    <div key={label}>
                      <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, color: '#fff' }}>{val}</p>
                      <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 8, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginTop: 2 }}>{label}</p>
                    </div>
                  ))}
                </div>
                <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, m.engagementRate * 10)}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ height: '100%', borderRadius: 2, background: m.color, opacity: 0.7 }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
