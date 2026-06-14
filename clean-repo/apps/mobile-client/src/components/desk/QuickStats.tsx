// FILE PATH: src/components/desk/QuickStats.tsx
import { motion } from 'framer-motion';
import { TrendingUp, Zap, Calendar, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCachedFetch, CACHE_TTL } from '../../lib/cache';
import { api } from '../../lib/api';
import { formatNumber } from '../../lib/utils';
import { NextStepBanner } from '../common/NextStepBanner';
import { useNavigate } from 'react-router-dom';

interface StatsData {
  generationsThisWeek:    number;
  generationsBenchmark:   number;
  engagementRate:         number;
  engagementBenchmark:    number;
  scheduledPosts:         number;
  reachThisMonth:         number;
}

export function QuickStats() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const { data, loading } = useCachedFetch<StatsData>(
    `stats:${user?.id}`,
    () => api.get<StatsData>('/stats/quick'),
    CACHE_TTL.PROGRESSION,
  );

  // Zero state — user has no data yet
  if (!loading && data && data.generationsThisWeek === 0) {
    return (
      <NextStepBanner
        icon="⚡"
        title="Your stats will appear here"
        body="Generate your first piece of content to see your performance dashboard."
        cta="Generate content now"
        onAction={() => document.getElementById('generator-prompt')?.focus()}
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
