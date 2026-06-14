// FILE PATH: src/pages/Plan/PlanPage.tsx
// FIX: removed MOCK_POSTS array entirely.
// Now uses useScheduledPosts (real Supabase data).
// FIX: Schedule button now navigates to /create instead of doing nothing.
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format, addDays, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameDay, isToday, addMonths, subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, LayoutList, Grid3X3, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ACTIVE_PLATFORMS } from '../../lib/constants';
import { useScheduledPosts } from '../../hooks/useScheduledPosts';
import type { ScheduledPost } from '../../types';

type CalView = 'month' | 'list';

function statusColor(status: ScheduledPost['status']): string {
  switch (status) {
    case 'published':  return '#6EE7B7';
    case 'scheduled':  return '#C9A84C';
    case 'failed':     return '#EF4444';
    case 'publishing': return '#3B82F6';
    default:           return 'rgba(255,255,255,0.3)';
  }
}

function statusDot(status: ScheduledPost['status'], platformColor: string): React.CSSProperties {
  if (status === 'published')  return { background: platformColor };
  if (status === 'scheduled')  return { background: 'transparent', border: `2px solid ${platformColor}` };
  if (status === 'failed')     return { background: '#EF4444' };
  if (status === 'publishing') return { background: '#3B82F6' };
  return { background: platformColor, opacity: 0.4 };
}

export default function PlanPage() {
  const navigate = useNavigate();
  const { posts, loading, deletePost } = useScheduledPosts();

  const [view, setView]               = useState<CalView>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [daySheetOpen, setDaySheetOpen] = useState(false);

  const monthDays       = eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });
  const firstDayOffset  = (startOfMonth(currentDate).getDay() + 6) % 7;
  const weekDays        = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  function postsForDay(day: Date): ScheduledPost[] {
    return posts.filter((p) => isSameDay(new Date(p.scheduledFor), day));
  }

  const selectedDayPosts = postsForDay(selectedDay);

  // Month summary counts
  const published = posts.filter((p) => p.status === 'published').length;
  const scheduled = posts.filter((p) => p.status === 'scheduled').length;
  const failed    = posts.filter((p) => p.status === 'failed').length;

  return (
    <div className="page-root">
      <div className="page-content">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <h1 className="font-display font-bold text-lg heading-classified">Content Plan</h1>
          {/* FIX: Schedule button now navigates instead of doing nothing */}
          <button
            onClick={() => navigate('/create')}
            className="btn-classified py-1.5 px-3 text-xs"
          >
            <Plus size={14} />
            Schedule
          </button>
        </div>

        {/* View switcher */}
        <div className="flex gap-2 px-5 mb-3">
          {([
            { id: 'month' as const, label: 'Month', icon: Grid3X3 },
            { id: 'list'  as const, label: 'List',  icon: LayoutList },
          ]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-display font-semibold tracking-wider uppercase transition-all border"
              style={{
                background: view === id ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.04)',
                borderColor: view === id ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.08)',
                color: view === id ? '#C9A84C' : 'rgba(255,255,255,0.4)',
              }}
            >
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>

        {/* Month summary bar — only when there are posts */}
        {!loading && posts.length > 0 && (
          <div className="mx-5 mb-3 px-3 py-2 rounded-xl flex items-center gap-4"
               style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="font-body text-2xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {format(currentDate, 'MMM')}:
            </span>
            <span className="font-display text-2xs font-semibold" style={{ color: '#6EE7B7' }}>
              {published} published
            </span>
            <span className="font-display text-2xs font-semibold" style={{ color: '#C9A84C' }}>
              {scheduled} scheduled
            </span>
            {failed > 0 && (
              <span className="font-display text-2xs font-semibold" style={{ color: '#EF4444' }}>
                {failed} failed
              </span>
            )}
          </div>
        )}

        {/* Month nav */}
        <div className="flex items-center justify-between px-5 mb-3">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  className="p-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <ChevronLeft size={20} />
          </button>
          <h2 className="font-display font-semibold text-base text-white">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                  className="p-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <ChevronRight size={20} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {view === 'month' && (
            <motion.div
              key="month" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="px-4"
            >
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {weekDays.map((d, i) => (
                  <div key={i} className="text-center py-1 font-display text-2xs tracking-widest uppercase"
                       style={{ color: 'rgba(255,255,255,0.25)' }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-0.5">
                {Array(firstDayOffset).fill(null).map((_, i) => <div key={`e${i}`} />)}
                {monthDays.map((day) => {
                  const dayPosts   = postsForDay(day);
                  const isSelected = isSameDay(day, selectedDay);
                  const today      = isToday(day);
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => {
                        setSelectedDay(day);
                        if (dayPosts.length > 0) setDaySheetOpen(true);
                      }}
                      className="flex flex-col items-center py-1.5 rounded-lg transition-all"
                      style={{ background: isSelected ? 'rgba(201,168,76,0.12)' : 'transparent' }}
                    >
                      <span className="font-display text-sm font-semibold"
                            style={{ color: isSelected ? '#C9A84C' : today ? '#fff' : 'rgba(255,255,255,0.55)' }}>
                        {format(day, 'd')}
                      </span>
                      {/* Status-differentiated dots from real data */}
                      <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center" style={{ maxWidth: 28 }}>
                        {dayPosts.slice(0, 3).map((post) => {
                          const platform = ACTIVE_PLATFORMS.find((p) => p.id === post.platform);
                          return (
                            <div
                              key={post.id}
                              className="w-1.5 h-1.5 rounded-full"
                              style={statusDot(post.status, platform?.color ?? '#C9A84C')}
                            />
                          );
                        })}
                        {dayPosts.length > 3 && (
                          <span className="font-mono" style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)' }}>
                            +{dayPosts.length - 3}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Dot legend */}
              <div className="flex items-center gap-4 px-1 mt-4">
                {[
                  { label: 'Published', style: { background: '#6EE7B7' } as React.CSSProperties },
                  { label: 'Scheduled', style: { background: 'transparent', border: '2px solid #C9A84C', width: 8, height: 8 } as React.CSSProperties },
                  { label: 'Failed',    style: { background: '#EF4444' } as React.CSSProperties },
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
            <motion.div
              key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="px-5 flex flex-col gap-2"
            >
              {loading ? (
                <div className="flex flex-col gap-2">
                  {[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}
                </div>
              ) : posts.length === 0 ? (
                <div className="flex flex-col items-center py-10 gap-3">
                  <div className="text-4xl">📅</div>
                  <p className="font-display font-bold text-base heading-classified">No posts yet</p>
                  <p className="font-body text-sm text-center" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    Generate content and schedule it to fill your calendar.
                  </p>
                  <button onClick={() => navigate('/create')} className="btn-classified py-2 px-4 text-xs">
                    <Plus size={12} /> Create Content
                  </button>
                </div>
              ) : (
                posts
                  .slice()
                  .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
                  .map((post) => {
                    const platform = ACTIVE_PLATFORMS.find((p) => p.id === post.platform);
                    return (
                      <div
                        key={post.id}
                        className="card p-3 flex items-center gap-3"
                        style={{ border: `1px solid ${platform?.color ?? '#C9A84C'}15` }}
                      >
                        <div className="w-2 h-2 rounded-full flex-shrink-0"
                             style={statusDot(post.status, platform?.color ?? '#C9A84C')} />
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-sm text-white truncate">
                            {post.content.slice(0, 60)}{post.content.length > 60 ? '…' : ''}
                          </p>
                          <p className="font-body text-2xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            {format(new Date(post.scheduledFor), 'MMM d · h:mm a')} · {platform?.name ?? post.platform}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-display text-2xs tracking-widest uppercase px-2 py-0.5 rounded-md"
                                style={{ background: `${statusColor(post.status)}15`, color: statusColor(post.status) }}>
                            {post.status}
                          </span>
                          {(post.status === 'scheduled' || post.status === 'draft') && (
                            <button
                              onClick={() => deletePost(post.id)}
                              className="p-1 rounded-lg transition-all"
                              style={{ color: 'rgba(255,255,255,0.25)' }}
                              aria-label="Delete post"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Day detail sheet */}
        <AnimatePresence>
          {daySheetOpen && selectedDayPosts.length > 0 && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                style={{ background: 'rgba(0,0,0,0.6)' }}
                onClick={() => setDaySheetOpen(false)}
              />
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
                    <p className="font-display font-bold text-base heading-classified">
                      {format(selectedDay, 'EEEE, MMM d')}
                    </p>
                    <button onClick={() => setDaySheetOpen(false)}
                            style={{ color: 'rgba(255,255,255,0.4)' }}>
                      <X size={20} />
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {selectedDayPosts.map((post) => {
                      const platform = ACTIVE_PLATFORMS.find((p) => p.id === post.platform);
                      return (
                        <div key={post.id} className="card p-3 flex items-center gap-3"
                             style={{ border: `1px solid ${platform?.color ?? '#C9A84C'}20` }}>
                          <div className="w-2 h-2 rounded-full flex-shrink-0"
                               style={statusDot(post.status, platform?.color ?? '#C9A84C')} />
                          <div className="flex-1 min-w-0">
                            <p className="font-body text-sm text-white truncate">
                              {post.content.slice(0, 60)}{post.content.length > 60 ? '…' : ''}
                            </p>
                            <p className="font-body text-2xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                              {new Date(post.scheduledFor).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                              {' · '}{platform?.name ?? post.platform}
                            </p>
                          </div>
                          <span className="font-display text-2xs tracking-widest uppercase px-2 py-0.5 rounded-md"
                                style={{ background: `${statusColor(post.status)}15`, color: statusColor(post.status) }}>
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
}  const { user }          = useAuth();
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
