import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Check, Loader2, Wand2, BarChart3, CalendarDays } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBrand } from '../contexts/BrandContext';

// ─── Step definitions ─────────────────────────────────────────────────────────
const STEPS = ['welcome', 'brand', 'tone', 'platforms', 'ready'] as const;
type Step = typeof STEPS[number];

const TONE_OPTIONS = [
  { id: 'professional',  label: 'Professional',  emoji: '💼', desc: 'Polished, authoritative, business-focused' },
  { id: 'casual',        label: 'Casual',         emoji: '👋', desc: 'Friendly, approachable, conversational' },
  { id: 'inspirational', label: 'Inspirational',  emoji: '✨', desc: 'Motivating, uplifting, vision-driven' },
  { id: 'humorous',      label: 'Humorous',       emoji: '😄', desc: 'Witty, playful, entertains your audience' },
  { id: 'authoritative', label: 'Authoritative',  emoji: '🎯', desc: 'Expert, commanding, thought leadership' },
  { id: 'playful',       label: 'Playful',        emoji: '🎨', desc: 'Creative, bold, makes people smile' },
] as const;

const PLATFORM_OPTIONS = [
  { id: 'instagram', label: 'Instagram', color: '#e1306c' },
  { id: 'facebook',  label: 'Facebook',  color: '#1877f2' },
  { id: 'tiktok',    label: 'TikTok',    color: '#010101' },
  { id: 'linkedin',  label: 'LinkedIn',  color: '#0a66c2' },
  { id: 'x',         label: 'X / Twitter', color: '#000000' },
] as const;

const INDUSTRY_OPTIONS = [
  'E-commerce', 'SaaS / Tech', 'Food & Beverage', 'Fashion & Beauty',
  'Health & Fitness', 'Real Estate', 'Finance', 'Education',
  'Entertainment', 'Travel', 'Non-profit', 'Other',
];

// ─── Shared step wrapper ──────────────────────────────────────────────────────
const StepWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, x: 40 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -40 }}
    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    className="flex flex-col gap-6"
  >
    {children}
  </motion.div>
);

// ─── Step: Welcome ────────────────────────────────────────────────────────────
const WelcomeStep = ({ onNext }: { onNext: () => void }) => (
  <StepWrapper>
    <div className="flex flex-col items-center gap-4 py-6">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        <div className="w-20 h-20 rounded-3xl bg-classified/10 border border-classified/20 flex items-center justify-center">
          <Shield className="w-10 h-10 text-classified" />
        </div>
        <motion.div
          className="absolute inset-0 rounded-3xl border border-classified/30"
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
      </motion.div>

      <div className="text-center space-y-2">
        <h1 className="font-display text-4xl tracking-[0.15em] text-classified">MARKETER PRO</h1>
        <p className="text-xs text-slate-500 tracking-[0.3em] uppercase font-classified">Office Edition</p>
      </div>

      <p className="text-center text-sm text-slate-400 font-body max-w-xs leading-relaxed">
        Your AI-powered marketing command center. Let's set up your workspace in under 2 minutes.
      </p>
    </div>

    <div className="grid grid-cols-3 gap-3">
      {[
        { icon: Wand2,        label: 'AI Content',  desc: 'Generate posts in seconds' },
        { icon: CalendarDays, label: 'Scheduler',   desc: 'Plan and auto-publish' },
        { icon: BarChart3,    label: 'Analytics',   desc: 'Track your performance' },
      ].map(({ icon: Icon, label, desc }) => (
        <div key={label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
          <Icon className="w-5 h-5 text-classified" />
          <p className="text-xs font-heading font-semibold text-slate-300">{label}</p>
          <p className="text-2xs text-slate-600">{desc}</p>
        </div>
      ))}
    </div>

    <button
      onClick={onNext}
      className="w-full h-13 rounded-xl flex items-center justify-center gap-2 font-heading font-semibold text-sm text-void-900 tracking-wider uppercase transition-all active:scale-[0.98]"
      style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #9d7c2e 100%)', height: 52 }}
    >
      Get Started
      <ArrowRight className="w-4 h-4" />
    </button>
  </StepWrapper>
);

// ─── Step: Brand ──────────────────────────────────────────────────────────────
const BrandStep = ({
  onNext,
  brandName, setBrandName,
  industry, setIndustry,
  website, setWebsite,
}: {
  onNext: () => void;
  brandName: string; setBrandName: (v: string) => void;
  industry: string; setIndustry: (v: string) => void;
  website: string; setWebsite: (v: string) => void;
}) => (
  <StepWrapper>
    <div>
      <h2 className="font-display text-2xl tracking-wider text-classified">YOUR BRAND</h2>
      <p className="text-sm text-slate-500 mt-1">Tell us about the brand you're marketing.</p>
    </div>

    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-2xs font-heading tracking-widest text-slate-500 uppercase">Brand name *</label>
        <input
          value={brandName}
          onChange={e => setBrandName(e.target.value)}
          placeholder="e.g. Acme Corp"
          className="w-full h-12 px-4 rounded-xl bg-desk-800 border border-white/[0.08] text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-classified/40 transition-colors"
          autoFocus
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-2xs font-heading tracking-widest text-slate-500 uppercase">Industry</label>
        <div className="grid grid-cols-3 gap-2">
          {INDUSTRY_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => setIndustry(opt)}
              className={`px-2 py-2 rounded-lg text-xs font-body transition-all text-center ${
                industry === opt
                  ? 'bg-classified/15 border border-classified/30 text-classified'
                  : 'bg-white/[0.03] border border-white/[0.06] text-slate-500 hover:border-white/[0.12]'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-2xs font-heading tracking-widest text-slate-500 uppercase">Website (optional)</label>
        <input
          value={website}
          onChange={e => setWebsite(e.target.value)}
          placeholder="https://yourbrand.com"
          className="w-full h-12 px-4 rounded-xl bg-desk-800 border border-white/[0.08] text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-classified/40 transition-colors"
        />
      </div>
    </div>

    <button
      onClick={onNext}
      disabled={!brandName.trim()}
      className="w-full flex items-center justify-center gap-2 font-heading font-semibold text-sm text-void-900 tracking-wider uppercase disabled:opacity-40 transition-all active:scale-[0.98]"
      style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #9d7c2e 100%)', height: 52, borderRadius: 12 }}
    >
      Continue
      <ArrowRight className="w-4 h-4" />
    </button>
  </StepWrapper>
);

// ─── Step: Tone ───────────────────────────────────────────────────────────────
const ToneStep = ({
  onNext, tone, setTone,
}: { onNext: () => void; tone: string; setTone: (t: string) => void }) => (
  <StepWrapper>
    <div>
      <h2 className="font-display text-2xl tracking-wider text-classified">BRAND VOICE</h2>
      <p className="text-sm text-slate-500 mt-1">How does your brand communicate?</p>
    </div>

    <div className="grid grid-cols-2 gap-2">
      {TONE_OPTIONS.map(opt => (
        <button
          key={opt.id}
          onClick={() => setTone(opt.id)}
          className={`flex flex-col gap-1 p-3 rounded-xl border transition-all text-left ${
            tone === opt.id
              ? 'bg-classified/10 border-classified/30 shadow-classified'
              : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-lg">{opt.emoji}</span>
            {tone === opt.id && <Check className="w-3.5 h-3.5 text-classified" />}
          </div>
          <p className={`text-sm font-heading font-semibold ${tone === opt.id ? 'text-classified' : 'text-slate-300'}`}>
            {opt.label}
          </p>
          <p className="text-2xs text-slate-600 leading-relaxed">{opt.desc}</p>
        </button>
      ))}
    </div>

    <button
      onClick={onNext}
      disabled={!tone}
      className="w-full flex items-center justify-center gap-2 font-heading font-semibold text-sm text-void-900 tracking-wider uppercase disabled:opacity-40 transition-all active:scale-[0.98]"
      style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #9d7c2e 100%)', height: 52, borderRadius: 12 }}
    >
      Continue
      <ArrowRight className="w-4 h-4" />
    </button>
  </StepWrapper>
);

// ─── Step: Platforms ──────────────────────────────────────────────────────────
const PlatformsStep = ({
  onNext, platforms, togglePlatform,
}: { onNext: () => void; platforms: string[]; togglePlatform: (p: string) => void }) => (
  <StepWrapper>
    <div>
      <h2 className="font-display text-2xl tracking-wider text-classified">PLATFORMS</h2>
      <p className="text-sm text-slate-500 mt-1">Which platforms do you publish on?</p>
    </div>

    <div className="space-y-2">
      {PLATFORM_OPTIONS.map(({ id, label, color }) => {
        const selected = platforms.includes(id);
        return (
          <button
            key={id}
            onClick={() => togglePlatform(id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
              selected
                ? 'border-classified/30 bg-classified/5'
                : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
            }`}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${color}25`, border: `1px solid ${color}40` }}
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            </div>
            <span className={`flex-1 text-sm font-body text-left ${selected ? 'text-slate-200' : 'text-slate-400'}`}>
              {label}
            </span>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              selected ? 'bg-classified border-classified' : 'border-white/20'
            }`}>
              {selected && <Check className="w-3 h-3 text-void-900" strokeWidth={3} />}
            </div>
          </button>
        );
      })}
    </div>

    <button
      onClick={onNext}
      disabled={platforms.length === 0}
      className="w-full flex items-center justify-center gap-2 font-heading font-semibold text-sm text-void-900 tracking-wider uppercase disabled:opacity-40 transition-all active:scale-[0.98]"
      style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #9d7c2e 100%)', height: 52, borderRadius: 12 }}
    >
      Continue
      <ArrowRight className="w-4 h-4" />
    </button>
  </StepWrapper>
);

// ─── Step: Ready ──────────────────────────────────────────────────────────────
const ReadyStep = ({ onFinish, saving }: { onFinish: () => void; saving: boolean }) => (
  <StepWrapper>
    <div className="flex flex-col items-center gap-5 py-8 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, duration: 0.6, type: 'spring', stiffness: 200 }}
        className="w-20 h-20 rounded-full bg-classified/15 border border-classified/30 flex items-center justify-center"
      >
        <Check className="w-10 h-10 text-classified" strokeWidth={2.5} />
      </motion.div>

      <div className="space-y-2">
        <h2 className="font-display text-3xl tracking-[0.15em] text-classified">ALL SET</h2>
        <p className="text-sm text-slate-400 font-body max-w-xs">
          Your workspace is configured. Your AI marketing assistant is ready to deploy.
        </p>
      </div>

      <div className="w-full p-4 rounded-xl border border-classified/15 bg-classified/5 text-left space-y-2">
        <p className="text-2xs font-heading tracking-widest text-classified uppercase">What's next</p>
        {[
          'Open the Artifact Vault to generate your first content',
          'Schedule posts from the Calendar',
          'Level up by completing daily missions',
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="w-1 h-1 rounded-full bg-classified mt-2 flex-shrink-0" />
            <p className="text-xs text-slate-400 font-body">{item}</p>
          </div>
        ))}
      </div>
    </div>

    <button
      onClick={onFinish}
      disabled={saving}
      className="w-full flex items-center justify-center gap-2 font-heading font-semibold text-sm text-void-900 tracking-wider uppercase transition-all active:scale-[0.98]"
      style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #9d7c2e 100%)', height: 52, borderRadius: 12 }}
    >
      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
      {saving ? 'Setting up...' : 'Enter the Office'}
      {!saving && <ArrowRight className="w-4 h-4" />}
    </button>
  </StepWrapper>
);

// ─── Main OnboardingPage ──────────────────────────────────────────────────────
export const OnboardingPage = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { createBrand } = useBrand();

  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Form state
  const [brandName, setBrandName] = useState('');
  const [industry, setIndustry]   = useState('');
  const [website, setWebsite]     = useState('');
  const [tone, setTone]           = useState('professional');
  const [platforms, setPlatforms] = useState<string[]>(['instagram']);

  const togglePlatform = (p: string) =>
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const handleFinish = async () => {
    setSaving(true);
    try {
      // Create the first brand
      await createBrand({
        name: brandName.trim() || 'My Brand',
        industry: industry || null,
        website: website || null,
        tone: tone as 'professional',
        primaryColor: '#c9a84c',
        secondaryColor: '#1a1a25',
      });

      // Mark onboarding complete + award XP
      await fetch('/api/progression/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ eventType: 'completed_onboarding' }),
      });

      await refreshUser();
      navigate('/', { replace: true });
    } catch {
      setSaving(false);
    }
  };

  const STEP_COMPONENTS = [
    <WelcomeStep onNext={() => setCurrentStep(1)} />,
    <BrandStep
      onNext={() => setCurrentStep(2)}
      brandName={brandName} setBrandName={setBrandName}
      industry={industry}   setIndustry={setIndustry}
      website={website}     setWebsite={setWebsite}
    />,
    <ToneStep onNext={() => setCurrentStep(3)} tone={tone} setTone={setTone} />,
    <PlatformsStep onNext={() => setCurrentStep(4)} platforms={platforms} togglePlatform={togglePlatform} />,
    <ReadyStep onFinish={handleFinish} saving={saving} />,
  ];

  return (
    <div className="flex flex-col h-screen bg-void-900 safe-top">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201,168,76,0.06) 0%, transparent 65%)' }}
      />

      {/* Progress dots */}
      {currentStep > 0 && (
        <div className="relative z-10 flex items-center justify-center gap-2 pt-6 pb-2">
          {STEPS.slice(1).map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i < currentStep - 1
                  ? 'w-6 bg-classified'
                  : i === currentStep - 1
                  ? 'w-4 bg-classified'
                  : 'w-4 bg-white/10'
              }`}
            />
          ))}
        </div>
      )}

      {/* Step content */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-4">
        <AnimatePresence mode="wait">
          <div key={currentStep}>
            {STEP_COMPONENTS[currentStep]}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
};
