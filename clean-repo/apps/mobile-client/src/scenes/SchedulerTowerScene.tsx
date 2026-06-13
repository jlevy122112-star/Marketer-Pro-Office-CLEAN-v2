'use client';

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULER TOWER SCENE
// Content calendar with real scheduled posts from /calendar.
// Bottom sheet on day tap. Drag-to-reschedule via /calendar/drag.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ChevronLeft, ChevronRight, Plus, X,
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth,
         eachDayOfInterval, isSameDay, isToday, addDays } from 'date-fns';
import { Container, Stack, Row, Card, Heading, Text, Badge, Button, Modal } from '@marketer-pro/ui';
import { colors, fonts, fontSizes, fontWeights, letterSpacings, space, radii } from '@marketer-pro/ui';
import { ACTIVE_PLATFORMS } from '@marketer-pro/cinematic-engine';
import { api } from '../lib/api';

interface ScheduledPost {
  id:           string;
  platform:     string;
  content:      string;
  scheduledFor: string;
  status:       'scheduled' | 'published' | 'failed' | 'draft';
}

const PLATFORM_COLORS: Record<string, string> = {
  facebook: '#1877F2', instagram: '#E4405F', twitter: '#000000',
  linkedin: '#0A66C2', tiktok: '#FF0050',
};

export default function SchedulerTowerScene() {
  const navigate = useNavigate();
  const [current, setCurrent]     = useState(new Date());
  const [selected, setSelected]   = useState(new Date());
  const [posts, setPosts]         = useState<ScheduledPost[]>([]);
  const [loading, setLoading]     = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  const days = eachDayOfInterval({ start: startOfMonth(current), end: endOfMonth(current) });
  const weekOffset = (startOfMonth(current).getDay() + 6) % 7;
  const postsFor   = (d: Date) => posts.filter((p) => isSameDay(new Date(p.scheduledFor), d));
  const selectedPosts = postsFor(selected);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const start = format(startOfMonth(current), "yyyy-MM-dd'T'00:00:00'Z'");
      const end   = format(endOfMonth(current),   "yyyy-MM-dd'T'23:59:59'Z'");
      const data  = await api.get<ScheduledPost[]>(`/calendar?start=${start}&end=${end}`);
      setPosts(data ?? []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [current]);

  useEffect(() => { load(); }, [load]);

  const handleDrag = useCallback(async (postId: string, newDate: Date) => {
    const newScheduledFor = newDate.toISOString();
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, scheduledFor: newScheduledFor } : p));
    try {
      await api.post('/calendar/drag', { postId, newScheduledFor });
    } catch {
      load(); // revert on failure
    }
  }, [load]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: colors.void[900], display: 'flex', flexDirection: 'column', paddingTop: 'var(--sat,0px)' }}>

      {/* Header */}
      <Row gap={12} align="center" style={{ padding: `${space[4]} ${space[5]} ${space[3]}` }}>
        <button onClick={() => navigate(-1)} aria-label="Back"
          style={{ color: colors.text.tertiary, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <ArrowLeft size={20} />
        </button>
        <Heading level={2} gold style={{ flex: 1 }}>Scheduler Tower</Heading>
        <button
          aria-label="Schedule new post"
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: radii.lg, background: `linear-gradient(135deg,${colors.classified.DEFAULT},${colors.classified.dark})`, border: 'none', color: '#060912', fontFamily: fonts.display, fontWeight: fontWeights.bold, fontSize: fontSizes.xs, letterSpacing: letterSpacings.wider, textTransform: 'uppercase', cursor: 'pointer' }}
        >
          <Plus size={13} /> Schedule
        </button>
      </Row>

      {/* Month navigation */}
      <Row justify="space-between" align="center" style={{ padding: `0 ${space[5]}`, marginBottom: space[3] }}>
        <button onClick={() => setCurrent(subMonths(current, 1))} aria-label="Previous month"
          style={{ padding: 6, color: colors.text.tertiary, background: 'none', border: 'none', cursor: 'pointer' }}>
          <ChevronLeft size={20} />
        </button>
        <Text variant="primary" size="xl" weight="bold" style={{ fontFamily: fonts.display }}>
          {format(current, 'MMMM yyyy')}
        </Text>
        <button onClick={() => setCurrent(addMonths(current, 1))} aria-label="Next month"
          style={{ padding: 6, color: colors.text.tertiary, background: 'none', border: 'none', cursor: 'pointer' }}>
          <ChevronRight size={20} />
        </button>
      </Row>

      {/* Calendar grid */}
      <div style={{ padding: `0 ${space[4]}`, flex: 1, overflowY: 'auto' }}>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 4 }}>
          {['M','T','W','T','F','S','S'].map((d, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '4px 0', fontFamily: fonts.display, fontSize: fontSizes['2xs'], fontWeight: fontWeights.bold, letterSpacing: letterSpacings.wider, color: colors.text.faint, textTransform: 'uppercase' }}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
          {Array(weekOffset).fill(null).map((_, i) => <div key={`e${i}`} />)}
          {days.map((day) => {
            const dayPosts = postsFor(day);
            const sel = isSameDay(day, selected);
            const tod = isToday(day);
            return (
              <button
                key={day.toISOString()}
                onClick={() => { setSelected(day); if (dayPosts.length > 0) setSheetOpen(true); }}
                aria-label={`${format(day, 'MMMM d')}${dayPosts.length > 0 ? `, ${dayPosts.length} posts` : ''}`}
                style={{
                  display:       'flex',
                  flexDirection: 'column',
                  alignItems:    'center',
                  padding:       '6px 2px',
                  borderRadius:  10,
                  background:    sel ? colors.classified.faint : 'transparent',
                  border:        `1px solid ${sel ? colors.classified.border : 'transparent'}`,
                  cursor:        'pointer',
                  transition:    'all 0.15s',
                }}
              >
                <span style={{
                  fontFamily:  fonts.display,
                  fontSize:    fontSizes.base,
                  fontWeight:  tod ? fontWeights.extrabold : fontWeights.normal,
                  color:       sel ? colors.classified.DEFAULT : tod ? '#fff' : colors.text.secondary,
                  lineHeight:  1,
                }}>
                  {format(day, 'd')}
                </span>
                <div style={{ display: 'flex', gap: 2, marginTop: 3, alignItems: 'center' }}>
                  {dayPosts.slice(0,3).map((p) => (
                    <div key={p.id} style={{ width: 5, height: 5, borderRadius: '50%', background: PLATFORM_COLORS[p.platform] ?? colors.classified.DEFAULT }} aria-hidden />
                  ))}
                  {dayPosts.length > 3 && (
                    <span style={{ fontFamily: fonts.mono, fontSize: '7px', color: colors.text.faint }}>+{dayPosts.length - 3}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected day inline (when no posts) */}
        {selectedPosts.length === 0 && (
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            <Text variant="faint" size="xs" weight="bold" uppercase style={{ letterSpacing: letterSpacings.widest }}>
              {format(selected, 'EEEE, MMM d')} — No posts
            </Text>
          </div>
        )}
      </div>

      {/* Bottom sheet for day posts */}
      <Modal
        open={sheetOpen && selectedPosts.length > 0}
        onClose={() => setSheetOpen(false)}
        title={format(selected, 'EEEE, MMM d')}
        accentBar
      >
        <Stack gap={8}>
          {selectedPosts.map((post) => {
            const color = PLATFORM_COLORS[post.platform] ?? colors.classified.DEFAULT;
            return (
              <Card key={post.id} accent={color} padding="12px 14px" style={{ borderRadius: radii.xl }}>
                <Row gap={10} align="center">
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} aria-hidden />
                  <Text variant="faint" size="xs" style={{ minWidth: 56 }}>
                    {format(new Date(post.scheduledFor), 'h:mm a')}
                  </Text>
                  <Text variant="secondary" size="sm" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {post.content}
                  </Text>
                  <Badge variant={post.status === 'published' ? 'teal' : post.status === 'failed' ? 'error' : 'gold'}>
                    {post.status}
                  </Badge>
                </Row>
              </Card>
            );
          })}
        </Stack>
      </Modal>
    </div>
  );
}
