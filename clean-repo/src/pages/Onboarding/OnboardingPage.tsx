// FILE PATH: src/pages/Onboarding/OnboardingPage.tsx
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Palette, Share2, Rocket, ChevronRight, Check } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { ACTIVE_PLATFORMS, COMING_SOON_PLATFORMS } from '../../lib/constants';
import type { PlatformId } from '../../lib/constants';
import type { BrandTone } from '../../types';

const STEPS = [
  { id: 1, label: 'Workspace',  icon: Building2 },
  { id: 2, label: 'Brand',      icon: Palette },
  { id: 3, label: 'Platforms',  icon: Share2 },
  { id: 4, label: 'Launch',     icon: Rocket },
];

// Tone previews — show what each tone actually sounds like
const TONES: { id: BrandTone; label: string; desc: string; preview: string }[] = [
  { id: 'professional',  label: 'Professional',  desc: 'Polished & credible',    preview: 'Our Q3 results demonstrate continued market leadership and innovation.' },
  { id: 'casual',        label: 'Casual',        desc: 'Friendly & relatable',   preview: 'Hey! We just dropped something you\'re gonna love. Check it out! 🎉' },
  { id: 'playful',       label: 'Playful',       desc: 'Fun & energetic',        preview: 'Plot twist: your next campaign is going to be absolutely incredible ✨' },
  { id: 'authoritative', label: 'Authoritative', desc: 'Expert & bold',          preview: 'The data is clear: brands posting 5x/week see 3x audience growth.' },
  { id: 'inspirational', label: 'Inspirational', desc: 'Motivating & uplifting', preview: 'Every great brand started with a single story. Today, yours begins.' },
  { id: 'luxury',        label: 'Luxury',        desc: 'Premium & exclusive',    preview: 'Crafted for those who demand excellence in every detail. Discover more.' },
];

export default function OnboardingPage() {
  const navigate   = useNavigate();
  const { gold }   = useToast();
  const { refreshUser } = useAuth();

  const [step, setStep]               = useState(1);
  const [workspaceName, setWorkspaceName] = useState('');
  const [brandName, setBrandName]     = useState('');
  const [industry, setIndustry]       = useState('');
  const [tone, setTone]               = useState<BrandTone>('professional');
  const [activeTonePreview, setActiveTonePreview] = useState<BrandTone | null>(null);
  const [platforms, setPlatforms]     = useState<PlatformId[]>(['instagram', 'facebook']);
  const [loading, setLoading]         = useState(false);

  function togglePlatform(id: PlatformId) {
    setPlatforms((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  }

  function canAdvance() {
    if (step === 1) return workspaceName.trim().length >= 2;
    if (step === 2) return brandName.trim().length >= 2;
    if (step === 3) return platforms.length >= 1;
    return true;
  }

  const handleFinish = useCallback(async () => {
    setLoading(true);
    try {
      await api.post('/brands', {
        name: brandName || workspaceName,
        industry: industry || 'General',
        tone,
        platforms,
        workspaceName,
      });
      await api.patch('/me', { onboardingComplete: true });
      await refreshUser();
      gold('Welcome to your Digital Office!', 'Generate your first post to get started.');
      navigate('/create', { replace: true });
    } catch {
      // Silent fallback — don't block user from entering app
      navigate('/create', { replace: true });
    } finally {
      setLoading(false);
    }
  }, [brandName, workspaceName, industry, tone, platforms, gold, navigate, refreshUser]);

  const selectedTone = TONES.find((t) => t.id === tone)!;

  return (
    <div className="page-root overflow-y-auto">
      <div className="fixed inset-0" style={{ background: '#080B14' }}>
        <div className="absolute inset-0 bg-grid opacity-25" />
        <div className="absolute inset-0"
             style={{ background: 'radial-gradient(ellipse 70% 40% at 50% 20%, rgba(201,168,76,0.06) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 min-h-full flex flex-col px-5 pt-8 pb-10">
        {/* Time estimate */}
        <div className="flex justify-center mb-6">
          <span className="font-mono text-2xs px-3 py-1 rounded-full tracking-widest uppercase"
                style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', color: 'rgba(201,168,76,0.7)' }}>
            ⏱ Takes about 90 seconds
          </span>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {STEPS.map((s) => (
            <motion.div
              key={s.id}
              animate={{ width: s.id === step ? 24 : 8, background: s.id <= step ? '#C9A84C' : 'rgba(255,255,255,0.15)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="h-2 rounded-full"
            />
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            {/* Step 1 — Workspace */}
            {step === 1 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="font-display font-bold text-2xl heading-classified mb-2">Set Up Workspace</h2>
                  <p className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    What should we call your Digital Office?
                  </p>
                </div>
                <div>
                  <label className="label-classified" htmlFor="workspace-name">Workspace Name</label>
                  <input id="workspace-name" type="text" value={workspaceName}
                         onChange={(e) => setWorkspaceName(e.target.value)}
                         placeholder="e.g. Acme Marketing HQ, Sarah's Studio"
                         className="input-classified" autoFocus />
                </div>
                <div className="card-classified p-4">
                  <p className="font-display text-2xs tracking-widest uppercase mb-3" style={{ color: 'rgba(201,168,76,0.6)' }}>
                    What you unlock
                  </p>
                  {[
                    'AI content generation for 5 platforms',
                    'Smart content calendar',
                    'Analytics command center',
                    'Brand asset vault',
                    'XP progression system',
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-2 py-1.5 border-b last:border-none"
                         style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <Check size={12} style={{ color: '#C9A84C' }} />
                      <span className="font-body text-xs text-white/60">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2 — Brand with tone previews */}
            {step === 2 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="font-display font-bold text-2xl heading-classified mb-2">Brand Identity</h2>
                  <p className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Tell us about your brand voice.
                  </p>
                </div>
                <div>
                  <label className="label-classified" htmlFor="brand-name">Brand Name</label>
                  <input id="brand-name" type="text" value={brandName}
                         onChange={(e) => setBrandName(e.target.value)}
                         placeholder="e.g. Acme Co, The Growth Agency"
                         className="input-classified" />
                </div>
                <div>
                  <label className="label-classified" htmlFor="industry">Industry</label>
                  <input id="industry" type="text" value={industry}
                         onChange={(e) => setIndustry(e.target.value)}
                         placeholder="e.g. E-commerce, SaaS, Real Estate"
                         className="input-classified" />
                </div>
                <div>
                  <label className="label-classified">Brand Tone</label>
                  <div className="grid grid-cols-2 gap-2">
                    {TONES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTone(t.id)}
                        onMouseEnter={() => setActiveTonePreview(t.id)}
                        onMouseLeave={() => setActiveTonePreview(null)}
                        className="text-left p-3 rounded-xl transition-all border"
                        style={{
                          background: tone === t.id ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.03)',
                          borderColor: tone === t.id ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.08)',
                        }}
                      >
                        <p className="font-display font-semibold text-xs text-white">{t.label}</p>
                        <p className="font-body text-2xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{t.desc}</p>
                      </button>
                    ))}
                  </div>
                  {/* Tone preview */}
                  <AnimatePresence>
                    {(activeTonePreview ?? tone) && (
                      <motion.div
                        key={activeTonePreview ?? tone}
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="mt-3 p-3 rounded-xl"
                        style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)' }}
                      >
                        <p className="font-display text-2xs tracking-widest uppercase mb-1.5" style={{ color: 'rgba(201,168,76,0.5)' }}>
                          Sample output
                        </p>
                        <p className="font-body text-xs italic" style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
                          "{TONES.find((t) => t.id === (activeTonePreview ?? tone))?.preview}"
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Step 3 — Platforms with intent clarification */}
            {step === 3 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="font-display font-bold text-2xl heading-classified mb-2">Where Do You Post?</h2>
                  <p className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Select your active platforms. You'll connect your accounts in Settings after setup.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {ACTIVE_PLATFORMS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className="flex items-center gap-3 p-4 rounded-2xl transition-all border"
                      style={{
                        background: platforms.includes(p.id) ? `${p.color}15` : 'rgba(255,255,255,0.03)',
                        borderColor: platforms.includes(p.id) ? `${p.color}50` : 'rgba(255,255,255,0.08)',
                      }}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ background: p.color }} />
                      <span className="font-display font-semibold text-sm text-white flex-1 text-left">{p.name}</span>
                      {platforms.includes(p.id) && <Check size={16} style={{ color: p.color }} />}
                    </button>
                  ))}
                  {COMING_SOON_PLATFORMS.map((p) => (
                    <div key={p.id}
                         className="flex items-center gap-3 p-4 rounded-2xl border"
                         style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)', opacity: 0.5 }}>
                      <div className="w-3 h-3 rounded-full" style={{ background: p.color, opacity: 0.5 }} />
                      <span className="font-display font-semibold text-sm flex-1 text-left" style={{ color: 'rgba(255,255,255,0.4)' }}>{p.name}</span>
                      <span className="badge-classified text-2xs">Soon</span>
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded-xl"
                     style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)' }}>
                  <p className="font-body text-xs" style={{ color: 'rgba(201,168,76,0.7)' }}>
                    💡 Connect your actual accounts later in Settings → Platforms to enable publishing
                  </p>
                </div>
              </div>
            )}

            {/* Step 4 — Launch */}
            {step === 4 && (
              <div className="flex flex-col items-center gap-6 pt-4">
                <motion.div
                  animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-7xl"
                >
                  🚀
                </motion.div>
                <div className="text-center">
                  <h2 className="font-display font-bold text-2xl heading-classified mb-3">Cleared for Launch</h2>
                  <p className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                    Your Digital Office is ready.
                  </p>
                </div>

                {/* Summary */}
                <div className="card-classified w-full p-4">
                  {[
                    { label: 'Workspace', value: workspaceName },
                    { label: 'Brand',     value: brandName || 'My Brand' },
                    { label: 'Platforms', value: `${platforms.length} selected` },
                    { label: 'Tone',      value: tone },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between py-1.5 border-b last:border-none"
                         style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <span className="font-display text-2xs tracking-widest uppercase"
                            style={{ color: 'rgba(201,168,76,0.6)' }}>{label}</span>
                      <span className="font-body text-xs text-white/60 capitalize">{value}</span>
                    </div>
                  ))}
                </div>

                {/* "What to do first" — makes first action obvious */}
                <div className="w-full p-4 rounded-2xl"
                     style={{ background: 'rgba(110,231,183,0.06)', border: '1px solid rgba(110,231,183,0.2)' }}>
                  <p className="font-display text-2xs tracking-widest uppercase mb-2" style={{ color: 'rgba(110,231,183,0.7)' }}>
                    What happens next
                  </p>
                  {[
                    '1. Describe what you want to promote',
                    '2. Watch AI generate content for all platforms',
                    '3. Schedule or publish instantly',
                  ].map((s) => (
                    <p key={s} className="font-body text-xs py-1" style={{ color: 'rgba(255,255,255,0.55)' }}>{s}</p>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center gap-3 mt-8">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="btn-void px-5">
              Back
            </button>
          )}
          {/* Skip on steps 2 & 3 */}
          {(step === 2 || step === 3) && (
            <button onClick={() => setStep(step + 1)}
                    className="font-body text-xs px-3"
                    style={{ color: 'rgba(255,255,255,0.3)' }}>
              Skip
            </button>
          )}
          <motion.button
            onClick={step < 4 ? () => setStep(step + 1) : handleFinish}
            disabled={!canAdvance() || loading}
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            className="btn-classified flex-1 justify-center disabled:opacity-40"
          >
            {step === 4
              ? loading ? 'Launching…' : '🚀 Enter Your Office'
              : <><span>Continue</span><ChevronRight size={16} /></>
            }
          </motion.button>
        </div>
      </div>
    </div>
  );
}
