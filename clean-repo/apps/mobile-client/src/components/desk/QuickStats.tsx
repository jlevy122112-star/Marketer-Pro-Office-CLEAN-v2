// FILE PATH: src/components/desk/QuickStats.tsx
// FIX: was hardcoded { value: '12', value: '4.2%', ... } for ALL users.
// Now calls /stats/quick and shows real numbers.
// New users see zeros with helpful sub-labels — not fake data.
import { motion } from 'framer-motion';
import { TrendingUp, Zap, Calendar, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCachedFetch, CACHE_TTL } from '../../lib/cache';
import { api } from '../../lib/api';
import { formatNumber } from '../../lib/utils';

interface QuickStatsData {
  generationsThisWeek: number;
  engagementRate:      number;
  scheduledPosts:      number;
  reachThisMonth:      number;
}

const ZERO: QuickStatsData = {
  generationsThisWeek: 0,
  engagementRate:      0,
  scheduledPosts:      0,
  reachThisMonth:      0,
};

export function QuickStats() {
  const { session } = useAuth();

  const { data, loading } = useCachedFetch<QuickStatsData>(
    `quick-stats:${session?.user?.id ?? 'anon'}`,
    async () => {
      try {
        return await api.get<QuickStatsData>('/stats/quick');
      } catch {
        // Backend not yet deployed — show zeros, not fake data
        return ZERO;
      }
    },
    CACHE_TTL.PROGRESSION,
  );

  const stats = data ?? ZERO;

  const items = [
    {
      label: 'This Week',
      value: stats.generationsThisWeek === 0 ? '—' : String(stats.generationsThisWeek),
      sub:   stats.generationsThisWeek === 0 ? 'Generate first content' : 'posts created',
      icon:  Zap,
      color: '#C9A84C',
    },
    {
      label: 'Engagement',
      value: stats.engagementRate === 0 ? '—' : `${stats.engagementRate}%`,
      sub:   stats.engagementRate === 0 ? 'Connect platforms first' : 'avg rate',
      icon:  TrendingUp,
      color: '#6EE7B7',
    },
    {
      label: 'Scheduled',
      value: String(stats.scheduledPosts),
      sub:   stats.scheduledPosts === 0 ? 'Nothing scheduled yet' : 'upcoming posts',
      icon:  Calendar,
      color: '#3B82F6',
    },
    {
      label: 'Reach',
      value: stats.reachThisMonth === 0 ? '—' : formatNumber(stats.reachThisMonth),
      sub:   stats.reachThisMonth === 0 ? 'Publish to see reach' : 'this month',
      icon:  Users,
      color: '#E4405F',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="card p-3"
            style={{ border: `1px solid ${stat.color}18` }}
          >
            <div className="flex items-start justify-between mb-2">
              <Icon size={14} style={{ color: stat.color }} />
              <span className="font-display text-2xs tracking-widest uppercase"
                    style={{ color: 'rgba(255,255,255,0.3)' }}>
                {stat.label}
              </span>
            </div>
            <p className="font-display font-bold text-xl text-white">{stat.value}</p>
            <p className="font-body text-2xs mt-0.5"
               style={{ color: stat.value === '—' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.35)' }}>
              {stat.sub}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
    }        onAction={() => document.getElementById('generator-prompt')?.focus()}
        variant="gold"
      />
    );
  }

  // Skeleton while loading
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {[1,2,3,4].map((i) => (
          <div key={i} className="skeleton h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: 'This Week',
      value: data ? String(data.generationsThisWeek) : '—',
      sub: data && data.generationsThisWeek > data.generationsBenchmark
        ? '↑ Above avg new users'
        : 'posts created',
      icon: Zap,
      color: '#C9A84C',
      good: data ? data.generationsThisWeek >= data.generationsBenchmark : false,
    },
    {
      label: 'Engagement',
      value: data ? `${data.engagementRate}%` : '—',
      sub: data ? (data.engagementRate >= data.engagementBenchmark ? `↑ Above ${data.engagementBenchmark}% avg` : `Avg: ${data.engagementBenchmark}%`) : 'avg rate',
      icon: TrendingUp,
      color: '#6EE7B7',
      good: data ? data.engagementRate >= data.engagementBenchmark : false,
    },
    {
      label: 'Scheduled',
      value: data ? String(data.scheduledPosts) : '—',
      sub: data?.scheduledPosts === 0 ? 'Schedule your first post →' : 'upcoming posts',
      icon: Calendar,
      color: '#3B82F6',
      good: (data?.scheduledPosts ?? 0) > 0,
    },
    {
      label: 'Reach',
      value: data ? formatNumber(data.reachThisMonth) : '—',
      sub: 'this month',
      icon: Users,
      color: '#E4405F',
      good: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="card p-3"
            style={{ border: `1px solid ${stat.color}18` }}
          >
            <div className="flex items-start justify-between mb-2">
              <Icon size={14} style={{ color: stat.color }} />
              <span className="font-display text-2xs tracking-widest uppercase"
                    style={{ color: 'rgba(255,255,255,0.3)' }}>
                {stat.label}
              </span>
            </div>
            <p className="font-display font-bold text-xl text-white">{stat.value}</p>
            <p className="font-body text-2xs mt-0.5"
               style={{ color: stat.good ? 'rgba(110,231,183,0.7)' : 'rgba(255,255,255,0.35)' }}>
              {stat.sub}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
