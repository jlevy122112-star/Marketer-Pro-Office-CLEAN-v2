'use client';

// ─────────────────────────────────────────────────────────────────────────────
// GENERATOR FORM
// Lives on the Desk page (not an overlay). Calls engine.start() on submit,
// which kicks off the Vault Door → Reactor → Presentation sequence.
// Audit upgrades applied:
//   - Prompt starters for cold-start problem
//   - Sticky generate button in gradient-fade footer
//   - Per-platform character limit guidance
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from 'react';
import { Zap } from 'lucide-react';
import {
  ACTIVE_PLATFORMS,
  COMING_SOON_PLATFORMS,
  CONTENT_TYPES,
  PROMPT_STARTERS,
  PLATFORM_CHAR_LIMITS,
} from '../constants';
import type { GenerationRequest, PlatformId, ContentType, BrandTone } from '../types';

interface GeneratorFormProps {
  onSubmit:     (request: GenerationRequest) => void;
  brandId:      string;
  defaultTone:  BrandTone;
  disabled?:    boolean;
}

export default function GeneratorForm({ onSubmit, brandId, defaultTone, disabled }: GeneratorFormProps) {
  const [prompt, setPrompt]       = useState('');
  const [platforms, setPlatforms] = useState<PlatformId[]>(['instagram', 'facebook']);
  const [contentType, setContentType] = useState<ContentType>('post');

  const tightestLimit = useMemo(() => {
    if (platforms.length === 0) return null;
    return Math.min(...platforms.map((p) => PLATFORM_CHAR_LIMITS[p]));
  }, [platforms]);

  function togglePlatform(id: PlatformId) {
    setPlatforms((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  }

  function handleSubmit() {
    if (!prompt.trim() || platforms.length === 0 || disabled) return;
    onSubmit({
      brandId,
      prompt: prompt.trim(),
      contentType,
      platforms,
      tone: defaultTone,
      includeHashtags: true,
      includeAltText: true,
      contentFilterEnabled: true,
    });
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

  const label: React.CSSProperties = {
    display: 'block', fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700,
    letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.65)', marginBottom: 8,
  };

  const canGenerate = !!prompt.trim() && platforms.length > 0 && !disabled;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ padding: 18, borderRadius: 20, background: 'rgba(13,17,32,0.85)', border: '1px solid rgba(201,168,76,0.18)', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Prompt */}
        <div>
          <label style={label} htmlFor="generator-prompt">What are we creating today?</label>
          <textarea
            id="generator-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your campaign, product launch, event or idea…"
            rows={3}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: 'none', resize: 'none', lineHeight: 1.6, boxSizing: 'border-box' }}
            onFocus={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.45)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
          {tightestLimit && prompt.length > 0 && (
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: prompt.length > tightestLimit ? '#F87171' : 'rgba(255,255,255,0.25)', marginTop: 6, textAlign: 'right' }}>
              {prompt.length} / {tightestLimit} (tightest platform limit)
            </p>
          )}

          {/* Prompt starters — cold start fix */}
          {!prompt && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
              <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.45)' }}>
                Try one of these
              </p>
              {PROMPT_STARTERS.map((s) => (
                <button key={s} onClick={() => setPrompt(s.slice(2).trim())}
                  style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Sans',sans-serif", fontSize: 12, cursor: 'pointer' }}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Platforms */}
        <div>
          <label style={label}>Platforms</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {ACTIVE_PLATFORMS.map((p) => (
              <button key={p.id} onClick={() => togglePlatform(p.id)} style={chip(platforms.includes(p.id), p.color)}>
                {p.name}
              </button>
            ))}
            {COMING_SOON_PLATFORMS.map((p) => (
              <div key={p.id} style={{ padding: '7px 12px', borderRadius: 10, fontSize: 11, fontFamily: "'Syne',sans-serif", fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'transparent', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.15)', cursor: 'not-allowed' }}>
                {p.name} · Soon
              </div>
            ))}
          </div>
        </div>

        {/* Content type */}
        <div>
          <label style={label}>Content Type</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CONTENT_TYPES.map((ct) => (
              <button key={ct.id} onClick={() => setContentType(ct.id)} style={chip(contentType === ct.id)}>
                {ct.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky generate button */}
      <div style={{
        position: 'sticky', bottom: 0, left: 0, right: 0,
        padding: '12px 0',
        background: 'linear-gradient(0deg, rgba(6,9,18,1) 60%, rgba(6,9,18,0) 100%)',
        zIndex: 10,
      }}>
        <button
          onClick={handleSubmit}
          disabled={!canGenerate}
          aria-label="Generate content"
          style={{
            width: '100%', padding: '16px 0', borderRadius: 16, border: 'none',
            cursor: canGenerate ? 'pointer' : 'not-allowed',
            background: canGenerate ? 'linear-gradient(135deg,#C9A84C,#9d7c2e)' : 'rgba(201,168,76,0.2)',
            color: '#060912', fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 13,
            letterSpacing: '0.25em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: canGenerate ? '0 0 40px rgba(201,168,76,0.3)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          <Zap size={16} />
          Generate Content
        </button>
      </div>
    </div>
  );
    }            <p className="font-display text-lg tracking-[0.2em] text-classified">
              VAULT GENERATOR
            </p>
            <p className="font-body text-xs text-slate-500 mt-0.5">
              Configure your generation request
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Platforms */}
        <div className="space-y-2">
          <label className="font-classified text-[10px] tracking-[0.2em] text-slate-500 uppercase">
            Platforms
          </label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => handleTogglePlatform(p)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-heading font-medium uppercase tracking-wider transition-all
                  ${platforms.includes(p)
                    ? 'bg-classified/15 text-classified border border-classified/30'
                    : 'bg-white/[0.03] text-slate-500 border border-white/[0.06] hover:border-white/[0.12]'
                  }
                `}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Content type */}
        <div className="space-y-2">
          <label className="font-classified text-[10px] tracking-[0.2em] text-slate-500 uppercase">
            Content type
          </label>
          <div className="flex gap-2">
            {CONTENT_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setContentType(t)}
                className={`
                  flex-1 py-2 rounded-lg text-xs font-heading uppercase tracking-wider transition-all
                  ${contentType === t
                    ? 'bg-reactor/15 text-reactor border border-reactor/30'
                    : 'bg-white/[0.03] text-slate-500 border border-white/[0.06] hover:border-white/[0.12]'
                  }
                `}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Goal */}
        <div className="space-y-2">
          <label className="font-classified text-[10px] tracking-[0.2em] text-slate-500 uppercase">
            Goal / Brief
          </label>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="What do you want to achieve with this content?"
            rows={3}
            className="w-full bg-desk-800 border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-700 resize-none focus:outline-none focus:border-classified/30 transition-colors font-body"
          />
        </div>

        {/* Fire button */}
        <motion.button
          onClick={handleFire}
          disabled={!goal.trim() || platforms.length === 0 || isActive}
          whileTap={{ scale: 0.97 }}
          className="w-full h-12 rounded-xl font-heading text-sm tracking-[0.15em] uppercase flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #c9a84c 0%, #9d7c2e 100%)',
            color: '#050810',
          }}
        >
          <Wand2 className="w-4 h-4" strokeWidth={2} />
          Fire the Reactor
        </motion.button>
      </div>
    </motion.div>
  );
};
