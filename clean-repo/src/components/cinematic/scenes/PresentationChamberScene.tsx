// FILE PATH: src/components/cinematic/scenes/PresentationChamberScene.tsx
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Hash, Image, Film, Copy, Calendar, Bookmark, ArrowLeft, Flag, Zap, Info } from 'lucide-react';
import type { GenerationResult, GeneratedArtifact } from '../../../types';
import { PLATFORMS } from '../../../lib/constants';
import { api } from '../../../lib/api';
import { queueMutation } from '../../../lib/offlineQueue';
import { useToast } from '../../../contexts/ToastContext';

interface PresentationChamberSceneProps {
  result:        GenerationResult | undefined;
  isGenerating:  boolean;
  error?:        string;
  onArtifactUse: (artifact: GeneratedArtifact) => void;
  onSchedule:    (artifact: GeneratedArtifact) => void;
  onReturn:      () => void;
}

type Phase = 'fade_in' | 'briefcase' | 'open' | 'reveal' | 'ready';

const SCORE_LEVELS = [
  { min: 80, label: 'Strong engagement potential', color: '#6EE7B7' },
  { min: 60, label: 'Good — consider light editing', color: '#C9A84C' },
  { min: 0,  label: 'May need revision',           color: '#EF4444' },
];

const REPORT_REASONS = [
  'Inaccurate or misleading',
  'Inappropriate content',
  'Off-brand tone',
  'Other',
];

export function PresentationChamberScene({
  result, isGenerating, error, onArtifactUse, onSchedule, onReturn,
}: PresentationChamberSceneProps) {
  const { success } = useToast();
  const [phase, setPhase]           = useState<Phase>('fade_in');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [copied, setCopied]         = useState(false);
  const [showScoreTip, setShowScoreTip] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [reporting, setReporting]   = useState(false);
  const [reported, setReported]     = useState<Set<string>>(new Set());
  const [generationElapsed, setGenerationElapsed] = useState(0);

  useEffect(() => {
    if (!isGenerating && result) {
      const t1 = setTimeout(() => setPhase('briefcase'), 200);
      const t2 = setTimeout(() => setPhase('open'),      600);
      const t3 = setTimeout(() => setPhase('reveal'),    1100);
      const t4 = setTimeout(() => setPhase('ready'),     1600);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    }
  }, [isGenerating, result]);

  // Generation elapsed timer — shows "Usually 8-12 seconds" during wait
  useEffect(() => {
    if (!isGenerating) return;
    const t = setInterval(() => setGenerationElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [isGenerating]);

  const artifacts = result?.artifacts ?? [];
  // Sort by score descending
  const sorted    = [...artifacts].sort((a: any, b: any) => (b.score ?? 0) - (a.score ?? 0));
  const selected  = sorted[selectedIdx] ?? null;

  async function handleCopy() {
    if (!selected) return;
    await navigator.clipboard.writeText(selected.copy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSave() {
    if (!selected) return;
    onArtifactUse(selected);
    // Chain: show "Schedule it?" CTA
    success('Saved to Vault', 'Schedule it to publish →');
    setScheduling(true);
  }

  async function handleConfirmSchedule() {
    if (!selected || !scheduleDate) return;
    const mutation = {
      method: 'POST' as const,
      path: '/content/schedule',
      body: { artifactId: selected.id, scheduledFor: scheduleDate, platform: selected.platform },
      label: `Schedule ${selected.platform} post`,
    };
    try {
      await api.post(mutation.path, mutation.body);
    } catch {
      queueMutation(mutation); // queue if offline
    }
    onSchedule(selected);
    setScheduling(false);
    setScheduleDate('');
    success('Post scheduled', 'Check the Plan tab to manage it');
  }

  async function handleReport(reason: string) {
    if (!selected) return;
    const id = selected.id;
    await api.post('/content/report', {
      artifactId: id,
      reason,
      platform: selected.platform,
      snapshot: { copy: selected.copy },
    }).catch(() => {});
    setReported((s) => new Set([...s, id]));
    setReporting(false);
    success('Flagged', 'Thanks for helping improve the AI');
  }

  const getScore = (artifact: any): number | null => artifact?.score ?? null;
  const getScoreLevel = (score: number) => SCORE_LEVELS.find((l) => score >= l.min)!;

  const platform = selected ? PLATFORMS.find((p) => p.id === selected.platform) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: '#010204', paddingTop: 'var(--sat)', paddingBottom: 'var(--sab)' }}
    >
      {/* Spotlight */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(201,168,76,0.08) 0%, transparent 70%)' }} />

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2 flex-shrink-0">
        <button onClick={onReturn} className="flex items-center gap-2 text-white/40">
          <ArrowLeft size={18} />
          <span className="font-display text-2xs tracking-widest uppercase">Desk</span>
        </button>
        <p className="font-display text-xs tracking-[0.3em] uppercase" style={{ color: 'rgba(201,168,76,0.6)' }}>
          ARTIFACT CHAMBER
        </p>
        <div style={{ width: 60 }} />
      </div>

      {/* ── GENERATING STATE ── */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 rounded-full border-2 border-transparent"
              style={{ borderTopColor: '#C9A84C', borderRightColor: 'rgba(201,168,76,0.2)' }}
            />
            <div className="text-center">
              <p className="font-display text-sm tracking-widest uppercase" style={{ color: '#C9A84C' }}>
                Generating…
              </p>
              <p className="font-body text-xs mt-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Usually 8–12 seconds · {generationElapsed}s elapsed
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ERROR STATE ── */}
      {!isGenerating && error && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="text-4xl">⚠️</div>
          <p className="font-display font-bold text-lg heading-classified">Generation Failed</p>
          <p className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
            {error}
          </p>
          <button onClick={onReturn} className="btn-classified w-full justify-center">
            Try Again
          </button>
        </div>
      )}

      {/* ── RESULTS ── */}
      {!isGenerating && !error && phase !== 'fade_in' && sorted.length > 0 && (
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {/* Briefcase open animation */}
          <AnimatePresence>
            {phase === 'briefcase' && (
              <motion.div
                initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="flex items-center justify-center py-10"
              >
                <motion.div
                  animate={{ rotate: [0, -8, 8, -4, 0] }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-6xl"
                >
                  💼
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Artifact tabs */}
          {(phase === 'reveal' || phase === 'ready') && sorted.length > 1 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {sorted.map((art: GeneratedArtifact, i) => {
                const p = PLATFORMS.find((pl) => pl.id === art.platform);
                return (
                  <button
                    key={art.id}
                    onClick={() => setSelectedIdx(i)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-2xs font-display font-semibold tracking-wider uppercase transition-all flex-shrink-0"
                    style={{
                      background: i === selectedIdx ? `${p?.color ?? '#C9A84C'}20` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${i === selectedIdx ? `${p?.color ?? '#C9A84C'}50` : 'rgba(255,255,255,0.08)'}`,
                      color: i === selectedIdx ? p?.color ?? '#C9A84C' : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: p?.color }} />
                    {p?.name ?? art.platform}
                  </button>
                );
              })}
            </div>
          )}

          {/* Selected artifact */}
          {(phase === 'reveal' || phase === 'ready') && selected && (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="card-classified flex flex-col gap-4"
            >
              {/* Platform badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: platform?.color ?? '#C9A84C' }} />
                  <span className="font-display text-2xs tracking-widest uppercase"
                        style={{ color: 'rgba(201,168,76,0.7)' }}>
                    {platform?.name ?? selected.platform}
                  </span>
                </div>
                {selected.optimized && (
                  <span className="badge-reactor">Optimized</span>
                )}
              </div>

              {/* Copy text */}
              <p className="font-body text-sm text-white leading-relaxed">{(selected as any).copy}</p>

              {/* Hashtags */}
              {(selected as any).hashtags && (selected as any).hashtags.length > 0 && (
                <p className="font-mono text-xs" style={{ color: 'rgba(110,231,183,0.7)' }}>
                  {((selected as any).hashtags as string[]).map((h) => `#${h}`).join(' ')}
                </p>
              )}

              {/* Quality score with tooltip */}
              {getScore(selected) !== null && (() => {
                const score = getScore(selected)!;
                const level = getScoreLevel(score);
                return (
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-display text-2xs tracking-widest uppercase"
                            style={{ color: 'rgba(255,255,255,0.3)' }}>Quality Score</span>
                      <button onClick={() => setShowScoreTip(!showScoreTip)}
                              className="text-white/25 hover:text-white/50 transition-colors">
                        <Info size={12} />
                      </button>
                    </div>
                    <AnimatePresence>
                      {showScoreTip && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="rounded-xl p-3 mb-2 text-xs"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <p className="font-body" style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                            <span style={{ color: '#6EE7B7' }}>80–100:</span> Strong engagement potential<br/>
                            <span style={{ color: '#C9A84C' }}>60–79:</span> Good starting point — consider editing<br/>
                            <span style={{ color: '#EF4444' }}>0–59:</span> May need revision before publishing
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ background: level.color }}
                        />
                      </div>
                      <span className="font-display text-xs font-bold" style={{ color: level.color }}>{score}</span>
                    </div>
                    <p className="font-body text-2xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {level.label}
                    </p>
                  </div>
                );
              })()}

              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={handleCopy}
                        className={cn('flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-display text-2xs tracking-widest uppercase transition-all border',
                          copied ? 'border-reactor/40 bg-reactor/10 text-reactor' : 'border-white/10 text-white/50')}
                >
                  <Copy size={13} />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={handleSave}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-display text-2xs tracking-widest uppercase border border-classified/30 bg-classified/10 text-classified transition-all">
                  <Bookmark size={13} />
                  Save
                </button>
              </div>

              {/* Inline scheduler */}
              {scheduling && (
                <div className="flex flex-col gap-2">
                  <label className="label-classified">Schedule for</label>
                  <input
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="input-classified"
                    style={{ colorScheme: 'dark' }}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => { setScheduling(false); setScheduleDate(''); }}
                            className="btn-void flex-1 py-2.5">Cancel</button>
                    <button onClick={handleConfirmSchedule}
                            disabled={!scheduleDate}
                            className="btn-classified flex-2 py-2.5 disabled:opacity-40">
                      <Calendar size={13} /> Confirm Schedule
                    </button>
                  </div>
                </div>
              )}

              {/* Report content — Apple 1.2 / Google AI policy required */}
              <div>
                {!reported.has(selected.id) && !reporting && (
                  <button
                    onClick={() => setReporting(true)}
                    data-testid="report-content"
                    className="flex items-center gap-1.5 font-body text-xs mt-1"
                    style={{ color: 'rgba(255,255,255,0.22)' }}
                  >
                    <Flag size={11} />
                    Flag this output
                  </button>
                )}
                {reporting && (
                  <div className="flex flex-col gap-2 mt-2">
                    <p className="font-display text-2xs tracking-widest uppercase"
                       style={{ color: 'rgba(255,255,255,0.35)' }}>What's wrong with this output?</p>
                    {REPORT_REASONS.map((reason) => (
                      <button
                        key={reason}
                        onClick={() => handleReport(reason)}
                        data-testid="report-content"
                        className="text-left px-3 py-2 rounded-xl font-body text-xs transition-all"
                        style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)',
                                 color: 'rgba(255,255,255,0.6)' }}>
                        {reason}
                      </button>
                    ))}
                    <button onClick={() => setReporting(false)}
                            className="font-body text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      Cancel
                    </button>
                  </div>
                )}
                {reported.has(selected.id) && (
                  <p className="font-body text-xs mt-1" style={{ color: 'rgba(110,231,183,0.7)' }}>
                    ✓ Flagged — thank you for the feedback
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* Generate new content CTA — at bottom of chamber */}
          {phase === 'ready' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="mt-4"
            >
              <button
                onClick={onReturn}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-display text-xs font-semibold tracking-widest uppercase transition-all"
                style={{ background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.2)',
                         color: 'rgba(201,168,76,0.7)' }}
              >
                <Zap size={14} />
                Generate New Content
              </button>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
