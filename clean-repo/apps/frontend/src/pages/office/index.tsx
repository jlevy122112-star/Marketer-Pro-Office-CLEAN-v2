'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, LayoutGrid, StickyNote } from 'lucide-react';
import { useAuth } from '@/modules/auth/useAuth';
import { getXPProgress, ACTIVE_PLATFORMS, COMING_SOON_PLATFORMS } from '@/lib/constants';
import type { BrandTone } from '@/lib/types';

type View = 'create' | 'departments' | 'board';

const CONTENT_TYPES = ['post','image_ad','video_ad','carousel','story','reel'] as const;
const DEPARTMENTS = [
  { key: 'brand_identity_chamber', label: 'Brand Strategy',   icon: '🏛️', level: 1 },
  { key: 'audience_arena',         label: 'Audience Intel',   icon: '🎯', level: 1 },
  { key: 'content_forge',          label: 'Content Forge',    icon: '⚡', level: 1 },
  { key: 'tone_lab',               label: 'Tone Lab',         icon: '🎨', level: 2 },
  { key: 'artifact_vault',         label: 'Artifact Vault',   icon: '🗄️', level: 2 },
  { key: 'scheduler_tower',        label: 'Scheduler Tower',  icon: '🗓️', level: 2 },
  { key: 'analytics_observatory',  label: 'Observatory',      icon: '📊', level: 3 },
  { key: 'ppc_command_center',     label: 'PPC Command',      icon: '💰', level: 4 },
  { key: 'multiverse_gate',        label: 'Multiverse Gate',  icon: '🌐', level: 5 },
];

export default function OfficePage() {
  const { user } = useAuth();
  const [view, setView]         = useState<View>('create');
  const [prompt, setPrompt]     = useState('');
  const [platforms, setPlatforms] = useState<string[]>(['instagram','facebook']);
  const [contentType, setContentType] = useState<typeof CONTENT_TYPES[number]>('post');
  const [loading, setLoading]   = useState(false);

  const xp = user ? getXPProgress(user.xp) : null;
  const level = user?.level ?? 1;

  function togglePlatform(id: string) {
    setPlatforms((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  }

  async function handleGenerate() {
    if (!prompt.trim() || platforms.length === 0 || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/content/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: 'default', prompt: prompt.trim(), contentType, platforms, includeHashtags: true }),
      });
      if (!res.ok) throw new Error('Generation failed');
      // result handled by cinematic engine in full implementation
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const chip = (active: boolean, color?: string): React.CSSProperties => ({
    padding: '7px 12px', borderRadius: 10, fontSize: 11,
    fontFamily: "'Syne',sans-serif", fontWeight: 700, letterSpacing: '0.1em',
    textTransform: 'uppercase', cursor: 'pointer',
    border: `1px solid ${active ? (color ? `${color}60` : 'rgba(201,168,76,0.45)') : 'rgba(255,255,255,0.08)'}`,
    background: active ? (color ? `${color}18` : 'rgba(201,168,76,0.12)') : 'transparent',
    color: active ? (color ?? '#C9A84C') : 'rgba(255,255,255,0.38)',
    transition: 'all 0.2s',
  });

  return (
    <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' as const, paddingBottom: 80 }}>
      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px 10px' }}>
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, background: 'linear-gradient(135deg,#C9A84C,#E8C54E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {view === 'create' ? 'Digital Office' : view === 'departments' ? 'Departments' : 'Strategy Board'}
          </h1>
          {user && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>CMO · Level {level}</p>}
        </div>
        {xp && (
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.55)' }}>LVL {xp.level}</p>
            <div style={{ width: 72, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)', marginTop: 4 }}>
              <div style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg,#C9A84C,#E8C54E)', width: `${xp.percent}%`, transition: 'width 0.8s ease' }} />
            </div>
          </div>
        )}
      </div>

      {/* view switcher */}
      <div style={{ display: 'flex', gap: 8, padding: '0 20px', marginBottom: 20 }}>
        {([
          { id: 'create' as const,      label: 'Create',      Icon: Zap },
          { id: 'departments' as const, label: 'Departments', Icon: LayoutGrid },
          { id: 'board' as const,       label: 'Board',       Icon: StickyNote },
        ]).map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setView(id)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, fontFamily: "'Syne',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', background: view === id ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${view === id ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.08)'}`, color: view === id ? '#C9A84C' : 'rgba(255,255,255,0.4)', transition: 'all 0.2s' }}>
            <Icon size={12} />{label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {view === 'create' && (
          <motion.div key="create" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'This Week',  value: '12',   sub: 'posts created', color: '#C9A84C' },
                { label: 'Engagement',value: '4.2%',  sub: 'avg rate',      color: '#6EE7B7' },
                { label: 'Scheduled', value: '8',     sub: 'upcoming',      color: '#3B82F6' },
                { label: 'Reach',     value: '2.4K',  sub: 'this month',    color: '#E4405F' },
              ].map((s) => (
                <div key={s.label} style={{ padding: 14, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: `1px solid ${s.color}18` }}>
                  <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>{s.label}</p>
                  <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: '#fff' }}>{s.value}</p>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{s.sub}</p>
                </div>
              ))}
            </div>

            {/* generator */}
            <div style={{ padding: 18, borderRadius: 20, background: 'rgba(13,17,32,0.85)', border: '1px solid rgba(201,168,76,0.18)', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.65)', marginBottom: 8 }}>
                  What are we creating today?
                </label>
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe your campaign, product, event or idea…" rows={3}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: 'none', resize: 'none', lineHeight: 1.6, boxSizing: 'border-box' }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.45)'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.65)', marginBottom: 8 }}>Platforms</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {ACTIVE_PLATFORMS.map((p) => (
                    <button key={p.id} onClick={() => togglePlatform(p.id)} style={chip(platforms.includes(p.id), p.color)}>{p.name}</button>
                  ))}
                  {COMING_SOON_PLATFORMS.map((p) => (
                    <div key={p.id} style={{ padding: '7px 12px', borderRadius: 10, fontSize: 11, fontFamily: "'Syne',sans-serif", fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'transparent', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.15)', cursor: 'not-allowed' }}>{p.name} · Soon</div>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.65)', marginBottom: 8 }}>Content Type</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {CONTENT_TYPES.map((ct) => (
                    <button key={ct} onClick={() => setContentType(ct)} style={chip(contentType === ct)}>{ct}</button>
                  ))}
                </div>
              </div>
              <motion.button onClick={handleGenerate} disabled={!prompt.trim() || platforms.length === 0 || loading}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                style={{ width: '100%', padding: '15px 0', borderRadius: 14, border: 'none', cursor: !prompt.trim() || platforms.length === 0 || loading ? 'not-allowed' : 'pointer', background: !prompt.trim() || platforms.length === 0 || loading ? 'rgba(201,168,76,0.2)' : 'linear-gradient(135deg,#C9A84C,#9d7c2e)', color: '#060912', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '0.25em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: loading ? 'none' : '0 0 30px rgba(201,168,76,0.22)' }}>
                <Zap size={15} />
                {loading ? 'Generating…' : 'Generate Content'}
              </motion.button>
            </div>
          </motion.div>
        )}

        {view === 'departments' && (
          <motion.div key="depts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DEPARTMENTS.map((d, i) => {
              const unlocked = level >= d.level;
              return (
                <motion.div key={d.key} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 16, background: unlocked ? 'rgba(13,17,32,0.85)' : 'rgba(13,17,32,0.4)', border: `1px solid ${unlocked ? 'rgba(201,168,76,0.18)' : 'rgba(255,255,255,0.05)'}`, opacity: unlocked ? 1 : 0.5, cursor: unlocked ? 'pointer' : 'not-allowed' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: unlocked ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${unlocked ? 'rgba(201,168,76,0.18)' : 'rgba(255,255,255,0.06)'}`, flexShrink: 0 }}>
                    {d.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: unlocked ? '#fff' : 'rgba(255,255,255,0.3)' }}>{d.label}</p>
                      {!unlocked
                        ? <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 8, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)' }}>LVL {d.level}</span>
                        : <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 8, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '2px 6px', borderRadius: 4, background: 'rgba(201,168,76,0.12)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.22)' }}>OPEN</span>
                      }
                    </div>
                  </div>
                  {unlocked && <span style={{ color: 'rgba(201,168,76,0.4)', fontSize: 18 }}>›</span>}
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {view === 'board' && (
          <motion.div key="board" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: '0 20px' }}>
            <div style={{ padding: '60px 20px', borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
              <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>Strategy Board</p>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.2)', marginTop: 6 }}>Drag & drop campaign planning — coming Phase 2</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
