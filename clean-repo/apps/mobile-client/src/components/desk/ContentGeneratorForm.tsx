// FILE PATH: src/components/desk/ContentGeneratorForm.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ChevronDown } from 'lucide-react';
import { ACTIVE_PLATFORMS, COMING_SOON_PLATFORMS } from '../../lib/constants';
import type { GenerationRequest, BrandTone } from '../../types';
import type { PlatformId } from '../../lib/constants';
import { cn } from '../../lib/utils';
import { CoachMark, useCoachMark } from '../common/CoachMark';

interface ContentGeneratorFormProps {
  onGenerate:   (request: GenerationRequest) => void;
  isGenerating: boolean;
  brandId?:     string;
}

const CONTENT_TYPES = [
  { id: 'post',      label: 'Post' },
  { id: 'image_ad',  label: 'Image Ad' },
  { id: 'video_ad',  label: 'Video Ad' },
  { id: 'carousel',  label: 'Carousel' },
  { id: 'story',     label: 'Story' },
  { id: 'reel',      label: 'Reel' },
] as const;

const TONES: { id: BrandTone; label: string }[] = [
  { id: 'professional',  label: 'Professional' },
  { id: 'casual',        label: 'Casual' },
  { id: 'playful',       label: 'Playful' },
  { id: 'authoritative', label: 'Authority' },
  { id: 'inspirational', label: 'Inspire' },
  { id: 'witty',         label: 'Witty' },
];

// Cold-start prompt starters — solves the blank-page problem
const PROMPT_STARTERS = [
  '✨ Announce a new product launch with excitement',
  '🎯 Share an industry insight that builds authority',
  '📣 Promote a limited-time offer with urgency',
  '💡 Educate my audience about a common misconception',
  '🤝 Share a customer success story',
];

// Per-platform character limits
const CHAR_LIMITS: Partial<Record<PlatformId, number>> = {
  twitter: 280, instagram: 2200, linkedin: 3000,
  facebook: 63206, tiktok: 2200,
};

export function ContentGeneratorForm({ onGenerate, isGenerating, brandId = 'default' }: ContentGeneratorFormProps) {
  const [prompt, setPrompt]   = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformId[]>(['instagram', 'facebook']);
  const [contentType, setContentType] = useState<'post' | 'image_ad' | 'video_ad' | 'carousel' | 'story' | 'reel'>('post');
  const [tone, setTone]         = useState<BrandTone>('professional');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Coach mark — shown once on first visit to the Create tab
  const { visible: showCoach, dismiss: dismissCoach } = useCoachMark('generator-prompt-hint');

  // Tightest character limit among selected platforms
  const tightestLimit = selectedPlatforms.reduce<number | null>((min, id) => {
    const limit = CHAR_LIMITS[id];
    if (!limit) return min;
    return min === null ? limit : Math.min(min, limit);
  }, null);

  function togglePlatform(id: PlatformId) {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function handleSubmit() {
    if (!prompt.trim() || selectedPlatforms.length === 0 || isGenerating) return;
    onGenerate({
      brandId, prompt: prompt.trim(), contentType,
      platforms: selectedPlatforms, tone,
      includeHashtags: true, includeAltText: true,
      includeAdCopy: contentType.includes('ad'),
    });
  }

  const overLimit = tightestLimit !== null && prompt.length > tightestLimit;

  return (
    <div className="card-classified p-4 flex flex-col gap-4">
      {/* Prompt textarea with coach mark */}
      <div>
        <label className="label-classified" htmlFor="generator-prompt">
          What are we creating today?
        </label>
        <CoachMark
          id="generator-prompt-hint"
          text="Start here → describe what you want to create"
          position="above"
        >
          <textarea
            id="generator-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your campaign, product, event, or idea…"
            rows={3}
            className="input-classified w-full resize-none"
            style={{ fontFamily: 'var(--font-body)' }}
            onFocus={showCoach ? dismissCoach : undefined}
          />
        </CoachMark>

        {/* Char count / limit */}
        <p className="text-2xs mt-1.5 flex justify-between"
           style={{ color: overLimit ? '#EF4444' : 'rgba(255,255,255,0.25)' }}>
          <span>{prompt.length} chars</span>
          {tightestLimit && (
            <span>{overLimit ? `${prompt.length - tightestLimit} over limit` : `/${tightestLimit} (tightest platform)`}</span>
          )}
        </p>

        {/* Prompt starters — shown when textarea is empty */}
        <AnimatePresence>
          {!prompt && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3"
            >
              <p className="font-display text-2xs tracking-widest uppercase mb-2"
                 style={{ color: 'rgba(201,168,76,0.5)' }}>
                Try one of these
              </p>
              <div className="flex flex-col gap-1.5">
                {PROMPT_STARTERS.map((starter) => (
                  <button
                    key={starter}
                    onClick={() => setPrompt(starter.slice(2).trim())}
                    className="text-left px-3 py-2 rounded-xl font-body text-xs transition-all"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                             color: 'rgba(255,255,255,0.5)' }}
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Platform selector */}
      <div>
        <label className="label-classified">Platforms</label>
        <div className="flex flex-wrap gap-2">
          {ACTIVE_PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => togglePlatform(p.id)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-2xs font-display font-semibold tracking-wider uppercase transition-all border',
                selectedPlatforms.includes(p.id) ? 'text-white border-transparent' : 'text-white/40 border-white/10 bg-transparent'
              )}
              style={selectedPlatforms.includes(p.id)
                ? { background: p.color, borderColor: p.color, boxShadow: `0 0 12px ${p.color}40` }
                : {}}
            >
              {p.name}
            </button>
          ))}
          {COMING_SOON_PLATFORMS.map((p) => (
            <div key={p.id}
                 className="px-3 py-1.5 rounded-xl text-2xs font-display font-semibold tracking-wider uppercase border border-white/5 text-white/15 cursor-not-allowed">
              {p.name} · Soon
            </div>
          ))}
        </div>
      </div>

      {/* Content type */}
      <div>
        <label className="label-classified">Content Type</label>
        <div className="flex gap-2 flex-wrap">
          {CONTENT_TYPES.map((ct) => (
            <button
              key={ct.id}
              onClick={() => setContentType(ct.id)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-2xs font-display font-semibold tracking-wider uppercase transition-all border',
                contentType === ct.id
                  ? 'border-classified/40 bg-classified/10 text-classified'
                  : 'border-white/10 text-white/40'
              )}
            >
              {ct.label}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-2xs font-display tracking-widest uppercase"
        style={{ color: 'rgba(255,255,255,0.3)' }}
      >
        <ChevronDown size={14}
          style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        Advanced Options
      </button>

      {showAdvanced && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <label className="label-classified">Tone</label>
          <div className="flex gap-2 flex-wrap">
            {TONES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTone(t.id)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-2xs font-display font-semibold tracking-wider uppercase transition-all border',
                  tone === t.id ? 'border-reactor/40 bg-reactor/10 text-reactor' : 'border-white/10 text-white/40'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Sticky generate button */}
      <div className="sticky bottom-0 pb-1 -mb-1"
           style={{ background: 'linear-gradient(0deg, rgba(15,22,41,1) 60%, transparent 100%)' }}>
        <motion.button
          onClick={handleSubmit}
          disabled={!prompt.trim() || selectedPlatforms.length === 0 || isGenerating || overLimit}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="btn-classified w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
        >
          <Zap size={16} />
          {isGenerating ? 'GENERATING…' : 'GENERATE CONTENT'}
        </motion.button>
      </div>
    </div>
  );
}
