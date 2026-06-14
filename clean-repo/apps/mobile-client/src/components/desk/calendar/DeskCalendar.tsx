// FILE PATH: src/components/desk/calendar/DeskCalendar.tsx
// FIX: removed Math.random() entirely. Now uses useScheduledPosts (real Supabase).
// Dots are derived from actual data — stable across re-renders.
import { useState } from 'react';
import { motion } from 'framer-motion';
import { addDays, format, startOfWeek, isSameDay } from 'date-fns';
import { ACTIVE_PLATFORMS } from '../../../lib/constants';
import { useScheduledPosts } from '../../../hooks/useScheduledPosts';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

interface DeskCalendarProps {
  compact?: boolean;
}

export function DeskCalendar({ compact = false }: DeskCalendarProps) {
  const navigate   = useNavigate();
  const today      = new Date();
  const [selectedDay, setSelectedDay] = useState(today);
  const { posts, loading } = useScheduledPosts();

  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays  = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Derive dots from REAL post data — no random
  function postsForDay(day: Date) {
    return posts.filter((p) => isSameDay(new Date(p.scheduledFor), day));
  }

  const selectedPosts = postsForDay(selectedDay);

  if (loading) {
    return (
      <div className="card-classified p-4">
        <div className="flex gap-1 mb-4">
          {weekDays.map((_, i) => (
            <div key={i} className="flex-1 skeleton h-14 rounded-xl" />
          ))}
        </div>
        <div className="skeleton h-8 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="card-classified p-4">
      {/* Week strip */}
      <div className="flex gap-1 mb-4">
        {weekDays.map((day) => {
          const isToday    = isSameDay(day, today);
          const isSelected = isSameDay(day, selectedDay);
          const dayPosts   = postsForDay(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDay(day)}
              className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all"
              style={{
                background: isSelected ? 'rgba(201,168,76,0.15)' : 'transparent',
                border: `1px solid ${isSelected ? 'rgba(201,168,76,0.35)' : 'transparent'}`,
              }}
            >
              <span className="font-display text-2xs tracking-widest uppercase"
                    style={{ color: isSelected ? '#C9A84C' : 'rgba(255,255,255,0.35)' }}>
                {format(day, 'EEE').slice(0, 1)}
              </span>
              <span className="font-display font-bold text-sm"
                    style={{ color: isSelected ? '#C9A84C' : isToday ? '#fff' : 'rgba(255,255,255,0.4)' }}>
                {format(day, 'd')}
              </span>
              {/* Real dots from real data */}
              <div className="flex gap-0.5">
                {dayPosts.slice(0, 3).map((post) => {
                  const platform = ACTIVE_PLATFORMS.find((p) => p.id === post.platform);
                  return (
                    <div
                      key={post.id}
                      className="w-1 h-1 rounded-full"
                      style={{ background: platform?.color ?? '#C9A84C' }}
                    />
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>

      {/* Posts for selected day */}
      <div className="flex flex-col gap-2">
        <p className="font-display text-2xs tracking-widest uppercase mb-1"
           style={{ color: 'rgba(255,255,255,0.3)' }}>
          {format(selectedDay, 'EEEE, MMM d')}
        </p>

        {selectedPosts.length === 0 ? (
          /* Empty state — clean and intentional, not broken-looking */
          <div className="flex flex-col items-center py-4 gap-2">
            <p className="font-display text-2xs tracking-widest uppercase"
               style={{ color: 'rgba(255,255,255,0.2)' }}>
              No posts scheduled
            </p>
            <button
              onClick={() => navigate('/create')}
              className="flex items-center gap-1 font-display text-2xs tracking-widest uppercase"
              style={{ color: 'rgba(201,168,76,0.6)' }}
            >
              <Plus size={10} /> Create content
            </button>
          </div>
        ) : (
          (compact ? selectedPosts.slice(0, 2) : selectedPosts).map((post, i) => {
            const platform = ACTIVE_PLATFORMS.find((p) => p.id === post.platform);
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 py-2 px-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0"
                     style={{ background: platform?.color ?? '#C9A84C' }} />
                <span className="font-display text-2xs tracking-wider uppercase"
                      style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {post.scheduledFor
                    ? new Date(post.scheduledFor).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                    : '—'}
                </span>
                <span className="font-body text-xs text-white/60 flex-1 truncate">
                  {post.content.slice(0, 50)}{post.content.length > 50 ? '…' : ''}
                </span>
                <span className="font-display text-2xs tracking-widest uppercase"
                      style={{ color: platform?.color, opacity: 0.7 }}>
                  {platform?.name}
                </span>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
