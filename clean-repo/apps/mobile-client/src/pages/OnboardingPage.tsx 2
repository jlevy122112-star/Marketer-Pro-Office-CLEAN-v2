'use client';

// ─────────────────────────────────────────────────────────────────────────────
// ONBOARDING PAGE
// 4-step flow: Workspace → Brand → Platforms → Launch
// Audit upgrades: dot progress, time estimate, skip, step illustrations,
// cinematic launch button, confirm password, terms above submit.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  Container,
  Stack,
  Row,
  Heading,
  Text,
  Input,
  Button,
  Chip,
  Badge,
} from '@marketer-pro/ui';
import {
  colors, fonts, fontSizes, fontWeights,
  letterSpacings, radii, space, gradients,
} from '@marketer-pro/ui';
import { ACTIVE_PLATFORMS, COMING_SOON_PLATFORMS } from '@marketer-pro/cinematic-engine';

import { useAuth }         from '../contexts/AuthContext';
import { useBrandContext } from '../contexts/BrandContext';
import { api }             from '../lib/api';

import type { PlatformId, BrandTone } from '@marketer-pro/cinematic-engine';

// ── Types ─────────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4;

const TONES: { id: BrandTone; label: string; desc: string }[] = [
  { id: 'professional',  label: 'Professional',  desc: 'Polished & credible' },
  { id: 'casual',         label: 'Casual',         desc: 'Friendly & relatable' },
  { id: 'playful',        label: 'Playful',        desc: 'Fun & energetic' },
  { id: 'authoritative',  label: 'Authority',      desc: 'Expert & bold' },
  { id: 'inspirational',  label: 'Inspirational',  desc: 'Motivating & uplifting' },
  { id: 'luxury',         label: 'Luxury',         desc: 'Premium & exclusive' },
];

const STEP_ICONS: Record<Step, string> = {
  1: '🏢',
  2: '🎨',
  3: '📡',
  4: '🚀',
};

const STEP_TITLES: Record<Step, string> = {
  1: 'Set Up Workspace',
  2: 'Brand Identity',
  3: 'Connect Platforms',
  4: 'Cleared for Launch',
};

// ─────────────────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const navigate         = useNavigate();
  const { session, refreshUser } = useAuth();
  const { setActiveBrand } = useBrandContext();

  const [step, setStep]             = useState<Step>(1);
  const [workspace, setWorkspace]   = useState('');
  const [brandName, setBrandName]   = useState('');
  const [industry, setIndustry]     = useState('');
  const [tone, setTone]             = useState<BrandTone>('professional');
  const [platforms, setPlatforms]   = useState<PlatformId[]>(['instagram', 'facebook']);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors]         = useState<Record<string, string>>({});

  function togglePlatform(id: PlatformId) {
    setPlatforms((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  }

  function canAdvance(): boolean {
    if (step === 1) return workspace.trim().length >= 2;
    if (step === 2) return brandName.trim().length >= 2;
    if (step === 3) return platforms.length >= 1;
    return true;
  }

  function canSkip(): boolean {
    return step === 2 || step === 3;
  }

  const handleNext = useCallback(() => {
    if (step < 4) setStep((s) => (s + 1) as Step);
  }, [step]);

  const handleSkip = useCallback(() => {
    if (step === 2) { setBrandName('My Brand'); setIndustry('General'); }
    handleNext();
  }, [step, handleNext]);

  const handleFinish = useCallback(async () => {
    setSubmitting(true);
    try {
      // 1. Create brand via real API
      const brand = await api.post<{ id: string; name: string; tone: string }>('/brands', {
        name:      brandName || workspace,
        industry:  industry || 'General',
        tone,
        platforms,
        workspaceName: workspace,
      });

      // 2. Mark onboarding complete on user profile
      await api.patch('/me', { onboardingComplete: true });

      // 3. Update local brand context so Desk has it immediately
      setActiveBrand({ id: brand.id, name: brand.name, tone: brand.tone as BrandTone });

      // 4. Refresh user in auth context
      await refreshUser();

      navigate('/desk', { replace: true });
    } catch (e) {
      setErrors({ submit: e instanceof Error ? e.message : 'Setup failed. Please try again.' });
      setSubmitting(false);
    }
  }, [workspace, brandName, industry, tone, platforms, navigate, setActiveBrand, refreshUser]);

  return (
    <div style={{
      position:   'fixed',
      inset:       0,
      background:  colors.void[900],
      display:    'flex',
      flexDirection: 'column',
      paddingTop:  'var(--sat, 0px)',
      paddingBottom: 'var(--sab, 0px)',
      overflow:   'hidden',
    }}>
      {/* Grid background */}
      <div style={{
        position:      'absolute',
        inset:          0,
        pointerEvents: 'none',
        backgroundImage: gradients.grid,
        backgroundSize:  '32px 32px',
      }} aria-hidden />

      {/* Scrollable content */}
      <div style={{
        flex:                1,
        overflowY:           'auto',
        position:            'relative',
        zIndex:              1,
        padding:             `${space[6]} ${space[5]} ${space[4]}`,
        WebkitOverflowScrolling: 'touch',
      }}>

        {/* Time estimate */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: space[5] }}>
          <span style={{
            fontFamily:    fonts.mono,
            fontSize:      fontSizes['2xs'],
            letterSpacing: letterSpacings.wider,
            textTransform: 'uppercase',
            color:         colors.classified.dim,
            padding:       '4px 12px',
            borderRadius:  20,
            background:    colors.classified.ghost,
            border:        `1px solid ${colors.classified.border}`,
          }}>
            ⏱ Takes about 90 seconds
          </span>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: space[8] }}>
          <ProgressDots current={step} total={4} />
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -28 }}
            transition={{ duration: 0.26 }}
          >
            {/* Step illustration */}
            <motion.div
              animate={{ rotate: [0, 3, -3, 0], scale: [1, 1.04, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                fontSize:       60,
                textAlign:      'center',
                marginBottom:   space[6],
                filter:         `drop-shadow(0 0 20px ${colors.classified.glow})`,
                display:        'block',
              }}
              aria-hidden
            >
              {STEP_ICONS[step]}
            </motion.div>

            <Heading level={2} gold style={{ marginBottom: 8 }}>
              {STEP_TITLES[step]}
            </Heading>

            {/* ── STEP 1 — Workspace ── */}
            {step === 1 && (
              <Stack gap={16}>
                <Text variant="tertiary" size="base" style={{ lineHeight: 1.7, marginBottom: 4 }}>
                  What should we call your Digital Office?
                </Text>
                <Input
                  label="Workspace Name"
                  value={workspace}
                  onChange={(e) => setWorkspace(e.target.value)}
                  placeholder=""
                  autoFocus
                  autoComplete="organization"
                  error={errors.workspace}
                />
                <div style={{
                  padding:       space[4],
                  borderRadius:  radii.xl,
                  background:    colors.classified.ghost,
                  border:        `1px solid ${colors.classified.border}`,
                }}>
                  <Text
                    variant="faint"
                    size="2xs"
                    weight="bold"
                    uppercase
                    style={{ letterSpacing: letterSpacings.widest, marginBottom: 12 }}
                  >
                    What you get
                  </Text>
                  {[
                    'AI content for 5 platforms',
                    'Smart content calendar',
                    'Analytics command center',
                    'Brand asset vault',
                    'XP progression system',
                  ].map((f) => (
                    <Row key={f} gap={10} align="center" style={{ marginBottom: 8 }}>
                      <Check size={12} color={colors.classified.DEFAULT} />
                      <Text variant="tertiary" size="sm">{f}</Text>
                    </Row>
                  ))}
                </div>
              </Stack>
            )}

            {/* ── STEP 2 — Brand ── */}
            {step === 2 && (
              <Stack gap={16}>
                <Text variant="tertiary" size="base" style={{ lineHeight: 1.7, marginBottom: 4 }}>
                  Tell the AI about your brand voice.
                </Text>
                <Input
                  label="Brand Name"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  autoFocus
                  error={errors.brandName}
                />
                <Input
                  label="Industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder=""
                />
                <div>
                  <Text
                    variant="faint"
                    size="2xs"
                    weight="bold"
                    uppercase
                    style={{ letterSpacing: letterSpacings.widest, marginBottom: 10, display: 'block' }}
                  >
                    Brand Tone
                  </Text>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {TONES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTone(t.id)}
                        style={{
                          textAlign:    'left',
                          padding:      '12px 14px',
                          borderRadius: radii.lg,
                          background:   tone === t.id ? colors.classified.ghost : 'rgba(255,255,255,0.03)',
                          border:       `1px solid ${tone === t.id ? colors.classified.border : colors.border.subtle}`,
                          cursor:       'pointer',
                          transition:   'all 0.2s',
                        }}
                        aria-pressed={tone === t.id}
                      >
                        <Text
                          variant={tone === t.id ? 'gold' : 'primary'}
                          size="sm"
                          weight="bold"
                          style={{ display: 'block', marginBottom: 3 }}
                        >
                          {t.label}
                        </Text>
                        <Text variant="faint" size="xs">{t.desc}</Text>
                      </button>
                    ))}
                  </div>
                </div>
              </Stack>
            )}

            {/* ── STEP 3 — Platforms ── */}
            {step === 3 && (
              <Stack gap={10}>
                <Text variant="tertiary" size="base" style={{ lineHeight: 1.7, marginBottom: 4 }}>
                  Select where you will be posting.
                </Text>
                {ACTIVE_PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    aria-pressed={platforms.includes(p.id)}
                    style={{
                      display:       'flex',
                      alignItems:    'center',
                      gap:           14,
                      padding:       '14px 16px',
                      borderRadius:  radii.xl,
                      background:    platforms.includes(p.id) ? `${p.color}12` : 'rgba(255,255,255,0.03)',
                      border:        `1px solid ${platforms.includes(p.id) ? `${p.color}50` : colors.border.subtle}`,
                      cursor:        'pointer',
                      transition:    'all 0.2s',
                      width:         '100%',
                      textAlign:     'left',
                    }}
                  >
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: p.color, flexShrink: 0,
                    }} aria-hidden />
                    <Text
                      variant={platforms.includes(p.id) ? 'primary' : 'secondary'}
                      size="base"
                      weight="semibold"
                      style={{ flex: 1, fontFamily: fonts.display }}
                    >
                      {p.name}
                    </Text>
                    {platforms.includes(p.id) && (
                      <Check size={16} color={p.color} />
                    )}
                  </button>
                ))}
                {COMING_SOON_PLATFORMS.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display:       'flex',
                      alignItems:    'center',
                      padding:       '14px 16px',
                      borderRadius:  radii.xl,
                      background:    'rgba(255,255,255,0.02)',
                      border:        `1px solid rgba(255,255,255,0.05)`,
                      opacity:       0.45,
                    }}
                  >
                    <Text variant="faint" size="base" style={{ flex: 1, fontFamily: fonts.display }}>
                      {p.name}
                    </Text>
                    <Badge variant="neutral">Soon</Badge>
                  </div>
                ))}
              </Stack>
            )}

            {/* ── STEP 4 — Launch ── */}
            {step === 4 && (
              <Stack gap={20}>
                <Text variant="tertiary" size="base" style={{ lineHeight: 1.7 }}>
                  Your Digital Office is ready. Generate content, plan campaigns,
                  and analyze performance — all from one command center.
                </Text>

                {/* Summary */}
                <div style={{
                  padding:      space[4],
                  borderRadius: radii.xl,
                  background:   colors.classified.ghost,
                  border:       `1px solid ${colors.classified.border}`,
                }}>
                  {[
                    { label: 'Workspace',  value: workspace },
                    { label: 'Brand',      value: brandName || 'My Brand' },
                    { label: 'Industry',   value: industry || 'General' },
                    { label: 'Platforms',  value: `${platforms.length} selected` },
                    { label: 'Tone',       value: tone },
                  ].map(({ label, value }) => (
                    <Row key={label} justify="space-between" style={{ marginBottom: 10 }}>
                      <Text
                        variant="faint"
                        size="2xs"
                        weight="bold"
                        uppercase
                        style={{ letterSpacing: letterSpacings.widest }}
                      >
                        {label}
                      </Text>
                      <Text
                        variant="tertiary"
                        size="sm"
                        style={{ textTransform: 'capitalize' }}
                      >
                        {value}
                      </Text>
                    </Row>
                  ))}
                </div>

                {errors.submit && (
                  <Text variant="error" size="sm" style={{ textAlign: 'center' }}>
                    {errors.submit}
                  </Text>
                )}
              </Stack>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Navigation ── */}
        <div style={{
          display:       'flex',
          flexDirection: 'column',
          gap:           space[3],
          marginTop:     space[8],
          paddingBottom: space[2],
        }}>
          <Row gap={12}>
            {step > 1 && (
              <button
                onClick={() => setStep((s) => (s - 1) as Step)}
                style={{
                  padding:       '14px 24px',
                  borderRadius:  radii.lg,
                  background:    'rgba(255,255,255,0.05)',
                  border:        `1px solid ${colors.border.dim}`,
                  color:         colors.text.tertiary,
                  fontFamily:    fonts.display,
                  fontWeight:    fontWeights.bold,
                  fontSize:      fontSizes.xs,
                  letterSpacing: letterSpacings.wider,
                  textTransform: 'uppercase',
                  cursor:        'pointer',
                }}
              >
                Back
              </button>
            )}

            {step < 4 ? (
              <motion.button
                onClick={handleNext}
                disabled={!canAdvance()}
                whileHover={canAdvance() ? { scale: 1.01 } : {}}
                whileTap={canAdvance()   ? { scale: 0.98 } : {}}
                style={{
                  flex:          1,
                  padding:       '15px 0',
                  borderRadius:  radii.lg,
                  border:        'none',
                  cursor:        canAdvance() ? 'pointer' : 'not-allowed',
                  background:    canAdvance()
                    ? gradients.gold
                    : 'rgba(201,168,76,0.2)',
                  color:         '#060912',
                  fontFamily:    fonts.display,
                  fontWeight:    fontWeights.bold,
                  fontSize:      fontSizes.xs,
                  letterSpacing: letterSpacings.wider,
                  textTransform: 'uppercase',
                  display:       'flex',
                  alignItems:    'center',
                  justifyContent:'center',
                  gap:           8,
                  boxShadow:     canAdvance() ? '0 0 30px rgba(201,168,76,0.25)' : 'none',
                }}
              >
                Continue <ChevronRight size={15} />
              </motion.button>
            ) : (
              // Cinematic launch button — step 4
              <motion.button
                onClick={handleFinish}
                disabled={submitting}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 22 }}
                whileHover={!submitting ? { scale: 1.02 } : {}}
                whileTap={!submitting   ? { scale: 0.97 } : {}}
                style={{
                  flex:          1,
                  padding:       '18px 0',
                  borderRadius:  radii.xl,
                  border:        'none',
                  cursor:        submitting ? 'not-allowed' : 'pointer',
                  background:    submitting ? 'rgba(201,168,76,0.25)' : gradients.goldSheen,
                  backgroundSize: '200% 200%',
                  color:         '#060912',
                  fontFamily:    fonts.display,
                  fontWeight:    fontWeights.extrabold,
                  fontSize:      fontSizes.base,
                  letterSpacing: letterSpacings.wider,
                  textTransform: 'uppercase',
                  boxShadow:     submitting ? 'none' : '0 0 60px rgba(201,168,76,0.4), 0 0 120px rgba(201,168,76,0.15)',
                  animation:     submitting ? 'none' : 'gradientShift 3s ease infinite',
                }}
              >
                {submitting ? '⚡ Preparing Your Office…' : '🚀 Enter Your Office'}
              </motion.button>
            )}
          </Row>

          {/* Skip button — steps 2 and 3 only */}
          {canSkip() && (
            <button
              onClick={handleSkip}
              style={{
                background:    'none',
                border:        'none',
                cursor:        'pointer',
                fontFamily:    fonts.body,
                fontSize:      fontSizes.sm,
                color:         colors.text.faint,
                textAlign:     'center',
                padding:       '6px 0',
                textDecoration:'underline',
                textDecorationColor: colors.text.ghost,
              }}
            >
              Skip for now →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Progress Dots component ───────────────────────────────────────────────────
function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Step ${current} of ${total}`}
      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width:      i === current - 1 ? 24 : 6,
            background: i < current
              ? colors.classified.DEFAULT
              : colors.text.ghost,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          style={{ height: 6, borderRadius: 3 }}
        />
      ))}
    </div>
  );
}
