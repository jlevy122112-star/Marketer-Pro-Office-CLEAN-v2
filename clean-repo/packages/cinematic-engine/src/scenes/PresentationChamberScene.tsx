'use client';

// ─────────────────────────────────────────────────────────────────────────────
// ACT III — PRESENTATION CHAMBER SCENE
// Shows generated artifacts (sorted by score), or error state with retry.
// Audit upgrades applied:
//   - Quality score bar per artifact
//   - Native Web Share API with clipboard fallback
//   - Inline non-destructive schedule picker
//   - Report content button (Apple 1.2 / Google AI policy)
//   - Reveal tied to actual data arrival, not fixed timeout
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Check, Share2, CalendarPlus, Flag, RotateCcw } from 'lucide-react';
import { getPlatformMeta } from '../constants';
import type { GenerationResult, GeneratedArtifact } from '../types';

interface PresentationChamberSceneProps {
  result:  GenerationResult | null;
  error:   string | null;
  onReturn:  () => void;
  onRetry:   () => void;
  onSave?:     (artifact: GeneratedArtifact) => void;
  onSchedule?: (artifact: GeneratedArtifact, scheduledFor: string) => Promise<void>;
  onReport?:   (artifact: GeneratedArtifact, reason: string) => Promise<void>;
}

const REPORT_REASONS = [
  'Inaccurate or misleading',
  'Inappropriate content',
  'Off-brand tone',
  'Other',
];

export default function PresentationChamberScene({
  result, error, onReturn, onRetry, onSave, onSchedule, onReport,
}: PresentationChamberSceneProps) {
  const reduce = useReducedMotion();
  const [revealed, setRevealed]   = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copiedId, setCopiedId]   = useState<string | null>(null);
  const [scheduling, setScheduling] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [reporting, setReporting] = useState(false);
  const [reportSent, setReportSent] = useState<Record<string, boolean>>({});

  const artifacts = result?.artifacts ?? [];
  const selected  = artifacts.find((a) => a.id === selectedId) ?? artifacts[0] ?? null;

  // Reveal tied to data arrival — briefcase "slam" finishes, then list appears
  useEffect(() => {
    if (error) { setRevealed(true); return; }
    if (result && artifacts.length > 0) {
      const t = setTimeout(() => setRevealed(true), 400);
      return () => clearTimeout(t);
    }
  }, [result, error, artifacts.length]);

  async function handleCopy(artifact: GeneratedArtifact) {
    await navigator.clipboard.writeText(artifact.copy);
    setCopiedId(artifact.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleShare(artifact: GeneratedArtifact) {
    if (navigator.share) {
      try {
        await navigator.share({ text: artifact.copy });
      } catch {
        // user cancelled share sheet — no-op
      }
    } else {
      await handleCopy(artifact);
    }
  }

  async function handleConfirmSchedule(artifact: GeneratedArtifact) {
    if (!scheduledDate || !onSchedule) return;
    await onSchedule(artifact, scheduledDate);
    setScheduling(false);
    setScheduledDate('');
  }

  async function handleReport(artifact: GeneratedArtifact, reason: string) {
    if (!onReport) return;
    await onReport(artifact, reason);
    setReportSent((p) => ({ ...p, [artifact.id]: true }));
    setReporting(false);
  }

  return (
    <motion.div
      role="dialog"
      aria-label="Presentation Chamber — generated content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: '#060912',
        display: 'flex', flexDirection: 'column',
        paddingTop: 'var(--sat,0px)', paddingBottom: 'var(--sab,0px)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px' }}>
        <button onClick={onReturn} aria-label="Return to Desk"
          style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <ArrowLeft size={20} />
        </button>
        <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'linear-gradient(135deg,#C9A84C,#E8C54E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Presentation Chamber
        </p>
      </div>

      {/* Briefcase slam — plays until reveal */}
      <AnimatePresence>
        {!revealed && (
          <motion.div
            initial={{ y: -120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <motion.div
              animate={reduce ? {} : { rotate: [0, -2, 2, 0] }}
              transition={{ duration: 0.4, delay: 0.3 }}
              style={{ fontSize: 64 }}
              aria-hidden
            >
              💼
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      {revealed && error && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 }}>
          <div style={{ fontSize: 40 }} aria-hidden>⚠️</div>
          <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#F87171', textAlign: 'center' }}>
            Generation Failed
          </p>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', maxWidth: 280, lineHeight: 1.6 }}>
            {error}
          </p>
          <button onClick={onRetry}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 14, background: 'linear-gradient(135deg,#C9A84C,#9d7c2e)', border: 'none', color: '#060912', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer' }}>
            <RotateCcw size={14} /> Try Again
          </button>
        </div>
      )}

      {/* Artifact list + detail */}
      {revealed && !error && artifacts.length > 0 && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {artifacts.map((artifact, i) => {
            const meta = getPlatformMeta(artifact.platform);
            const isSelected = artifact.id === selected?.id;
            return (
              <motion.div
                key={artifact.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{
                  borderRadius: 18, padding: 16,
                  background: isSelected ? 'rgba(13,17,32,0.95)' : 'rgba(13,17,32,0.7)',
                  border: `1px solid ${isSelected ? `${meta.color}50` : 'rgba(255,255,255,0.07)'}`,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onClick={() => setSelectedId(artifact.id)}
              >
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color }} aria-hidden />
                    <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.6)' }}>
                      {meta.name}
                    </span>
                  </div>
                  {artifact.optimized && (
                    <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 8, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '2px 6px', borderRadius: 4, background: 'rgba(110,231,183,0.1)', color: '#6EE7B7', border: '1px solid rgba(110,231,183,0.2)' }}>
                      Optimized
                    </span>
                  )}
                </div>

                {/* Copy preview */}
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, marginBottom: 10, display: isSelected ? 'block' : '-webkit-box', WebkitLineClamp: isSelected ? undefined : 3, WebkitBoxOrient: 'vertical', overflow: isSelected ? 'visible' : 'hidden' }}>
                  {artifact.copy}
                </p>

                {/* Hashtags */}
                {artifact.hashtags.length > 0 && (
                  <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'rgba(110,231,183,0.6)', marginBottom: 10 }}>
                    {artifact.hashtags.map((h) => `#${h}`).join(' ')}
                  </p>
                )}

                {/* Quality score bar */}
                {typeof artifact.score === 'number' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: isSelected ? 14 : 0 }}>
                    <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                      <div style={{
                        height: '100%', borderRadius: 2, width: `${artifact.score}%`,
                        background: artifact.score >= 80 ? '#6EE7B7' : artifact.score >= 60 ? '#C9A84C' : '#F87171',
                        transition: 'width 0.8s ease',
                      }} />
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,0.4)', minWidth: 28, textAlign: 'right' }}>
                      {artifact.score}
                    </span>
                  </div>
                )}

                {/* Expanded actions — only on selected */}
                {isSelected && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Alt text */}
                    {artifact.altText && (
                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>
                        Alt text: {artifact.altText}
                      </p>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={(e) => { e.stopPropagation(); handleCopy(artifact); }}
                        style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: 'none', cursor: 'pointer', background: copiedId === artifact.id ? 'rgba(110,231,183,0.15)' : 'rgba(255,255,255,0.06)', color: copiedId === artifact.id ? '#6EE7B7' : 'rgba(255,255,255,0.6)', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        {copiedId === artifact.id ? <><Check size={13} /> Copied!</> : 'Copy'}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleShare(artifact); }}
                        style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <Share2 size={13} /> Share
                      </button>
                      {onSave && (
                        <button onClick={(e) => { e.stopPropagation(); onSave(artifact); }}
                          style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'rgba(201,168,76,0.12)', color: '#C9A84C', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                          Save
                        </button>
                      )}
                    </div>

                    {/* Inline scheduler */}
                    {onSchedule && (
                      scheduling ? (
                        <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <input
                            type="datetime-local"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            aria-label="Schedule date and time"
                            style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.3)', color: '#fff', fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: 'none', colorScheme: 'dark', boxSizing: 'border-box' }}
                          />
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => setScheduling(false)}
                              style={{ flex: 1, padding: '11px 0', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>
                              Cancel
                            </button>
                            <button onClick={() => handleConfirmSchedule(artifact)} disabled={!scheduledDate}
                              style={{ flex: 2, padding: '11px 0', borderRadius: 12, background: 'linear-gradient(135deg,#C9A84C,#9d7c2e)', border: 'none', color: '#060912', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: scheduledDate ? 'pointer' : 'not-allowed', opacity: scheduledDate ? 1 : 0.5 }}>
                              Confirm Schedule
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); setScheduling(true); }}
                          style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: '1px solid rgba(201,168,76,0.25)', cursor: 'pointer', background: 'transparent', color: '#C9A84C', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <CalendarPlus size={13} /> Schedule Post
                        </button>
                      )
                    )}

                    {/* Report content — Apple 1.2 / Google AI Policy */}
                    {onReport && (
                      reportSent[artifact.id] ? (
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: 'rgba(110,231,183,0.7)', textAlign: 'center' }}>
                          ✓ Reported — thank you for the feedback
                        </p>
                      ) : reporting ? (
                        <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {REPORT_REASONS.map((reason) => (
                            <button key={reason} onClick={() => handleReport(artifact, reason)}
                              data-testid="report-content"
                              style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)', color: 'rgba(255,255,255,0.6)', fontFamily: "'DM Sans',sans-serif", fontSize: 12, textAlign: 'left', cursor: 'pointer' }}>
                              {reason}
                            </button>
                          ))}
                          <button onClick={() => setReporting(false)}
                            style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          data-testid="report-content"
                          onClick={(e) => { e.stopPropagation(); setReporting(true); }}
                          aria-label="Report this content"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
                          <Flag size={12} /> Report content
                        </button>
                      )
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
