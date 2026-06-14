// FILE PATH: src/pages/Plan/PlanPage.tsx
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format, addDays, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isToday, addMonths, subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar, LayoutList, Grid3X3, X } from 'lucide-react';
import { ACTIVE_PLATFORMS } from '../../lib/constants';
import { useCachedFetch, CACHE_TTL } from '../../lib/cache';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { NextStepBanner } from '../../components/common/NextStepBanner';
import { useNavigate } from 'react-router-dom';

type CalView = 'month' | 'list';

interface ScheduledPost {
  id:           string;
  platform:     string;
  title:        string;
  date:         string;   // ISO
  time:         string;
  status:       'scheduled' | 'published' | 'failed' | 'draft';
}

function statusDotStyle(status: ScheduledPost['status'], color: string): React.CSSProperties {
  // Different visual weight per status
  if (status === 'published') return { background: color, opacity: 1 };
  if (status === 'scheduled') return { background: 'transparent', border: `2px solid ${color}`, opacity: 1 };
  if (status === 'failed')    return { background: '#EF4444', opacity: 1 };
  return { background: color, opacity: 0.4 };
}

export default function PlanPage() {
  const navigate          = useNavigate();
  const { user }          = useAuth();
  const [view, setView]   = useState<CalView>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [sheetOpen, setSheetOpen]     = useState(false);

  const monthKey = format(currentDate, 'yyyy-MM');
  const { data: posts, loading } = useCachedFetch<ScheduledPost[]>(
    `calendar:${user?.id}:${monthKey}`,
    () => api.get<ScheduledPost[]>(`/calendar?month=${monthKey}`),
    CACHE_TTL.CALENDAR,
  );

  const allPosts      = posts ?? [];
  const monthDays     = eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });
  const firstDayOffset = (startOfMonth(currentDate).getDay() + 6) % 7;
  const weekDays       = ['M','T','W','T','F','S','S'];

  const postsForDay   = (day: Date) => allPosts.filter((p) => isSameDay(new Date(p.date), day));
  const selectedPosts = postsForDay(selectedDay);

  // Month summary
  const published  = allPosts.filter((p) => p.status === 'published').length;
  const scheduled  = allPosts.filter((p) => p.status === 'scheduled').length;
  const failed     = allPosts.filter((p) => p.status === 'failed').length;

  // Recommended frequency: 3–5 posts/week = 12–22/month
  const weekCount   = Math.ceil(monthDays.length / 7);
  const recommended = weekCount * 4; // target 4/week
  const onTrack     = allPosts.length >= Math.floor(recommended * 0.6);

  return (
    <div className="page-root">
      <div className="page-content">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <h1 className="font-display font-bold text-lg heading-classified">Content Plan</h1>
          <button
            className="btn-classified py-1.5 px-3 text-xs"
            onClick={() => navigate('/create')}
            aria-label="Schedule new post"
          >
            <Plus size={14} />
            Schedule
          </button>
        </div>

        {/* View tabs */}
        <div className="flex gap-2 px-5 mb-3">
          {([
            { id: 'month', label: 'Month', icon: Grid3X3 },
            { id: 'list',  label: 'List',  icon: LayoutList },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-display font-semibold tracking-wider uppercase transition-all border"
              style={{
                background: view === id ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.04)',
                borderColor: view === id ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.08)',
                color: view === id ? '#C9A84C' : 'rgba(255,255,255,0.4)',
              }}
            >
              <Icon size={12} />{label}
            </button>
          ))}
        </div>

        {/* Month summary bar */}
        {!loading && (
          <div className="flex items-center gap-3 px-5 mb-3 py-2 rounded-xl mx-5"
               style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="font-body text-2xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {format(currentDate, 'MMM')}:
            </span>
            <span className="font-display text-2xs tracking-wider" style={{ color: '#6EE7B7' }}>
              {published} published
            </span>
            <span className="font-display text-2xs tracking-wider" style={{ color: '#C9A84C' }}>
              {scheduled} scheduled
            </span>
            {failed > 0 && (
              <span className="font-display text-2xs tracking-wider" style={{ color: '#EF4444' }}>
                {failed} failed
              </span>
            )}
          </div>
        )}

        {/* Posting frequency recommendation */}
        {!loading && allPosts.length > 0 && (
          <div className="mx-5 mb-3 px-3 py-2 rounded-xl flex items-center gap-2"
               style={{
                 background: onTrack ? 'rgba(110,231,183,0.06)' : 'rgba(201,168,76,0.06)',
                 border: `1px solid ${onTrack ? 'rgba(110,231,183,0.2)' : 'rgba(201,168,76,0.2)'}`,
               }}>
            <span style={{ fontSize: 12 }}>{onTrack ? '✅' : '📅'}</span>
            <p className="font-body text-2xs" style={{ color: onTrack ? 'rgba(110,231,183,0.8)' : 'rgba(201,168,76,0.8)' }}>
              {onTrack
                ? `You're on track · Target: ${recommended} posts/month`
                : `Recommended: 3–5 posts/week · ${Math.max(0, recommended - allPosts.length)} more this month`}
            </p>
          </div>
        )}

        {/* Month nav */}
        <div className="flex items-center justify-between px-5 mb-3">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1 text-white/40">
            <ChevronLeft size={20} />
          </button>
          <h2 className="font-display font-semibold text-base text-white">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1 text-white/40">
            <ChevronRight size={20} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {view === 'month' && (
            <motion.div key="month" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="px-4">
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {weekDays.map((d, i) => (
                  <div key={i} className="text-center py-1 font-display text-2xs tracking-widest uppercase"
                       style={{ color: 'rgba(255,255,255,0.25)' }}>{d}</div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-0.5">
                {Array(firstDayOffset).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
                {monthDays.map((day) => {
                  const dayPosts = postsForDay(day);
                  const isSelected = isSameDay(day, selectedDay);
                  const today     = isToday(day);
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => { setSelectedDay(day); if (dayPosts.length > 0) setSheetOpen(true); }}
                      className="flex flex-col items-center py-1.5 rounded-lg transition-all"
                      style={{ background: isSelected ? 'rgba(201,168,76,0.12)' : 'transparent' }}
                    >
                      <span className="font-display text-sm font-semibold"
                            style={{ color: isSelected ? '#C9A84C' : today ? '#fff' : 'rgba(255,255,255,0.6)',
                                     fontWeight: today ? 800 : 500 }}>
                        {format(day, 'd')}
                      </span>
                      {/* Status-differentiated dots */}
                      <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center" style={{ maxWidth: 28 }}>
                        {dayPosts.slice(0, 3).map((post) => {
                          const platform = ACTIVE_PLATFORMS.find((p) => p.id === post.platform);
                          const color    = platform?.color ?? '#C9A84C';
                          return (
                            <div key={post.id}
                                 className="w-1.5 h-1.5 rounded-full"
                                 style={statusDotStyle(post.status, color)} />
                          );
                        })}
                        {dayPosts.length > 3 && (
                          <span className="font-mono text-2xs" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 7 }}>
                            +{dayPosts.length - 3}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Dot legend */}
              <div className="flex items-center gap-4 px-1 mt-4 mb-2">
                {[
                  { label: 'Published', style: { background: '#6EE7B7' } as React.CSSProperties },
                  { label: 'Scheduled', style: { background: 'transparent', border: '2px solid #C9A84C' } as React.CSSProperties },
                  { label: 'Failed',    style: { background: '#EF4444' } as React.CSSProperties },
                  { label: 'Draft',     style: { background: '#C9A84C', opacity: 0.4 } as React.CSSProperties },
                ].map(({ label, style }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={style} />
                    <span className="font-body text-2xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'list' && (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="px-5 flex flex-col gap-2">
              {allPosts.length === 0 ? (
                <NextStepBanner
                  icon="📅"
                  title="No posts scheduled"
                  body="Create content and schedule it to fill your calendar."
                  cta="Generate content"
                  onAction={() => navigate('/create')}
                  variant="gold"
                />
              ) : (
                allPosts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((post) => {
                  const platform = ACTIVE_PLATFORMS.find((p) => p.id === post.platform);
                  return (
                    <div key={post.id} className="card p-3 flex items-center gap-3"
                         style={{ border: `1px solid ${platform?.color ?? '#C9A84C'}15` }}>
                      <div className="w-2 h-2 rounded-full flex-shrink-0"
                           style={statusDotStyle(post.status, platform?.color ?? '#C9A84C')} />
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm text-white truncate">{post.title}</p>
                        <p className="font-body text-2xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          {format(new Date(post.date), 'MMM d')} · {post.time} · {platform?.name ?? post.platform}
                        </p>
                      </div>
                      <span className={`badge-${post.status === 'published' ? 'reactor' : 'classified'} text-2xs`}>
                        {post.status}
                      </span>
                    </div>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Day sheet */}
        <AnimatePresence>
          {sheetOpen && selectedPosts.length > 0 && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.6)' }}
                          onClick={() => setSheetOpen(false)} />
              <motion.div
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                className="fixed left-0 right-0 bottom-0 z-50 glass-classified rounded-t-3xl"
                style={{ paddingBottom: 'var(--sab)' }}
              >
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
                </div>
                <div className="px-5 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-display font-bold text-base tracking-wider uppercase heading-classified">
                      {format(selectedDay, 'EEEE, MMM d')}
                    </p>
                    <button onClick={() => setSheetOpen(false)} style={{ color: 'rgba(255,255,255,0.4)' }}>
                      <X size={20} />
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {selectedPosts.map((post) => {
                      const platform = ACTIVE_PLATFORMS.find((p) => p.id === post.platform);
                      return (
                        <div key={post.id} className="card p-3 flex items-center gap-3"
                             style={{ border: `1px solid ${platform?.color ?? '#C9A84C'}20` }}>
                          <div className="w-2 h-2 rounded-full flex-shrink-0"
                               style={statusDotStyle(post.status, platform?.color ?? '#C9A84C')} />
                          <div className="flex-1">
                            <p className="font-body text-sm text-white">{post.title}</p>
                            <p className="font-body text-2xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                              {post.time} · {platform?.name ?? post.platform}
                            </p>
                          </div>
                          <span className={`badge-${post.status === 'published' ? 'reactor' : 'classified'} text-2xs`}>
                            {post.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
