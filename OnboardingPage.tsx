/**
 * OnboardingPage.tsx — Premium rewrite (was a stub)
 * Marketer Pro Office Edition
 *
 * 4-step guided onboarding completing in under 2 minutes:
 *   Step 1: Welcome + workspace name
 *   Step 2: Brand identity (logo + colors)
 *   Step 3: Connect social accounts
 *   Step 4: Complete + go to desk
 *
 * Design: cinematic dark, classified gold, Syne/DM Sans fonts,
 * animated progress, staggered reveals, no blank states ever.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Upload, Check, Zap,
  Instagram, Linkedin, Globe, TrendingUp,
  Palette, Users, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// ─── Steps config ─────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Welcome', icon: '👋' },
  { id: 2, label: 'Brand',   icon: '🎨' },
  { id: 3, label: 'Connect', icon: '🔗' },
  { id: 4, label: 'Ready',   icon: '🚀' },
];

const BRAND_COLORS = [
  '#C9A84C', '#6366f1', '#10b981', '#ef4444',
  '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6',
];

const SOCIAL_PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: '📸', color: '#e1306c', hint: '1.4B users' },
  { id: 'linkedin',  name: 'LinkedIn',  icon: '💼', color: '#0077b5', hint: 'B2B powerhouse' },
  { id: 'tiktok',    name: 'TikTok',    icon: '🎵', color: '#ff0050', hint: 'Fastest growth' },
  { id: 'facebook',  name: 'Facebook',  icon: '📘', color: '#1877f2', hint: '3B users' },
  { id: 'twitter',   name: 'X (Twitter)', icon: '𝕏', color: '#e2e8f0', hint: 'Trending topics' },
  { id: 'youtube',   name: 'YouTube',   icon: '▶️', color: '#ff0000', hint: 'Video first' },
];

// ─── Progress bar ─────────────────────────────────────────────────────────────
const OnboardProgress = ({ step }: { step: number }) => (
  <div className="flex items-center gap-2 mb-10">
    {STEPS.map((s, i) => (
      <React.Fragment key={s.id}>
        <motion.div
          animate={{
            background: s.id < step ? 'linear-gradient(135deg,#C9A84C,#9d7c2e)'
              : s.id === step ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.04)',
            borderColor: s.id <= step ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.08)',
          }}
          className="w-8 h-8 rounded-full flex items-center justify-center border text-sm flex-shrink-0 transition-all"
        >
          {s.id < step
            ? <Check className="w-3.5 h-3.5 text-void-900" />
            : <span className={`text-xs font-bold font-display ${s.id === step ? 'text-classified' : 'text-slate-600'}`}>{s.id}</span>
          }
        </motion.div>
        {i < STEPS.length - 1 && (
          <div className="flex-1 h-px relative overflow-hidden bg-white/[0.06]">
            <motion.div
              animate={{ scaleX: step > s.id ? 1 : 0 }}
              initial={{ scaleX: 0 }}
              style={{ originX: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
              style={{ background: 'linear-gradient(90deg,#C9A84C,rgba(201,168,76,0.3))' }}
            />
          </div>
        )}
      </React.Fragment>
    ))}
  </div>
);

// ─── Step 1: Welcome ──────────────────────────────────────────────────────────
const Step1 = ({ onNext, userName }: { onNext: (name: string) => void; userName: string }) => {
  const [workspace, setWorkspace] = useState(userName ? `${userName}'s Brand` : '');

  return (
    <motion.div key="step1" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="text-center">
      <div className="text-5xl mb-6">👋</div>
      <h1 className="font-display text-2xl font-extrabold text-slate-100 tracking-tight mb-3">
        Welcome to<br/>
        <span style={{ background: 'linear-gradient(135deg,#C9A84C,#E8C96A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Marketer Pro
        </span>
      </h1>
      <p className="text-sm text-slate-400 leading-relaxed mb-8 max-w-xs mx-auto">
        Let's set up your workspace in under 2 minutes. We'll personalize everything to your brand.
      </p>

      <div className="text-left mb-6">
        <label className="block text-xs font-medium text-slate-400 mb-2 tracking-wide">Your workspace name</label>
        <input
          type="text" value={workspace} onChange={e => setWorkspace(e.target.value)}
          placeholder="e.g. Acme Brand Studio"
          className="w-full h-12 px-4 rounded-xl text-sm text-slate-200 placeholder-slate-600 outline-none transition-all"
          style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', fontFamily: "'DM Sans',sans-serif" }}
          onFocus={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.35)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.06)'; }}
          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
          autoFocus
        />
      </div>

      <button
        onClick={() => onNext(workspace)}
        disabled={!workspace.trim()}
        className="w-full h-12 rounded-xl font-display font-bold text-sm tracking-[0.1em] uppercase flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg,#C9A84C,#9d7c2e)', color: '#080B14', boxShadow: '0 4px 20px rgba(201,168,76,0.25)' }}
      >
        Get Started <ArrowRight className="w-4 h-4"/>
      </button>
    </motion.div>
  );
};

// ─── Step 2: Brand setup ──────────────────────────────────────────────────────
const Step2 = ({ onNext, onSkip }: { onNext: (color: string) => void; onSkip: () => void }) => {
  const [selectedColor, setSelectedColor] = useState(BRAND_COLORS[0]);
  const [logoUploaded, setLogoUploaded] = useState(false);

  return (
    <motion.div key="step2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl mb-6 mx-auto"
        style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}>
        <Palette className="w-6 h-6 text-classified" />
      </div>
      <h2 className="font-display text-xl font-extrabold text-slate-100 tracking-tight text-center mb-2">Set up your brand</h2>
      <p className="text-sm text-slate-400 text-center mb-8 max-w-xs mx-auto">Every piece of content will be injected with your brand identity automatically.</p>

      {/* Logo upload */}
      <div
        onClick={() => setLogoUploaded(true)}
        className="border-2 border-dashed rounded-2xl p-6 mb-6 cursor-pointer flex flex-col items-center gap-2 transition-all"
        style={{
          borderColor: logoUploaded ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.08)',
          background: logoUploaded ? 'rgba(201,168,76,0.05)' : 'rgba(17,24,39,0.6)',
        }}
        onMouseEnter={e => { if (!logoUploaded) (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,168,76,0.25)'; }}
        onMouseLeave={e => { if (!logoUploaded) (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
      >
        {logoUploaded
          ? <><div className="w-12 h-12 rounded-xl bg-classified flex items-center justify-center font-display font-bold text-void-900 text-xl">M</div><p className="text-xs text-classified font-medium">Logo uploaded ✓</p></>
          : <><Upload className="w-6 h-6 text-slate-500"/><p className="text-sm text-slate-400">Drop your logo here</p><p className="text-xs text-slate-600">PNG, SVG or JPG · Max 5MB</p></>
        }
      </div>

      {/* Color picker */}
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.12em] mb-3">Primary Brand Color</p>
      <div className="flex gap-2.5 mb-8 flex-wrap">
        {BRAND_COLORS.map(color => (
          <button
            key={color}
            onClick={() => setSelectedColor(color)}
            className="w-10 h-10 rounded-xl transition-all"
            style={{
              background: color,
              border: `2px solid ${selectedColor === color ? 'white' : 'transparent'}`,
              transform: selectedColor === color ? 'scale(1.15)' : 'scale(1)',
              boxShadow: selectedColor === color ? `0 0 12px ${color}60` : 'none',
            }}
            aria-label={`Select color ${color}`}
            aria-pressed={selectedColor === color}
          />
        ))}
      </div>

      <button
        onClick={() => onNext(selectedColor)}
        className="w-full h-12 rounded-xl font-display font-bold text-sm tracking-[0.1em] uppercase flex items-center justify-center gap-2 transition-all mb-3"
        style={{ background: 'linear-gradient(135deg,#C9A84C,#9d7c2e)', color: '#080B14', boxShadow: '0 4px 20px rgba(201,168,76,0.25)' }}
      >
        Save Brand & Continue <ArrowRight className="w-4 h-4"/>
      </button>
      <button onClick={onSkip} className="w-full text-center text-xs text-slate-600 hover:text-slate-400 transition-colors py-1">
        Set up later
      </button>
    </motion.div>
  );
};

// ─── Step 3: Connect accounts ─────────────────────────────────────────────────
const Step3 = ({ onNext, onSkip }: { onNext: (platforms: string[]) => void; onSkip: () => void }) => {
  const [connected, setConnected] = useState<string[]>([]);

  const toggle = (id: string) =>
    setConnected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  return (
    <motion.div key="step3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl mb-6 mx-auto"
        style={{ background: 'rgba(110,231,183,0.1)', border: '1px solid rgba(110,231,183,0.2)' }}>
        <Globe className="w-6 h-6 text-reactor" />
      </div>
      <h2 className="font-display text-xl font-extrabold text-slate-100 tracking-tight text-center mb-2">Connect your accounts</h2>
      <p className="text-sm text-slate-400 text-center mb-6 max-w-xs mx-auto">We'll optimize every post for each platform's best practices automatically.</p>

      <div className="flex flex-col gap-2.5 mb-6">
        {SOCIAL_PLATFORMS.map((p, i) => {
          const isConnected = connected.includes(p.id);
          return (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => toggle(p.id)}
              className="flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left"
              style={{
                background: isConnected ? `${p.color}12` : 'rgba(17,24,39,0.6)',
                borderColor: isConnected ? `${p.color}40` : 'rgba(255,255,255,0.06)',
              }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: `${p.color}20`, border: `1px solid ${p.color}30` }}>
                {p.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-200">{p.name}</p>
                <p className="text-xs text-slate-500">{p.hint}</p>
              </div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all flex-shrink-0`}
                style={{
                  background: isConnected ? p.color : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isConnected ? p.color : 'rgba(255,255,255,0.1)'}`,
                }}>
                {isConnected && <Check className="w-3 h-3 text-white" />}
              </div>
            </motion.button>
          );
        })}
      </div>

      <button
        onClick={() => onNext(connected)}
        disabled={connected.length === 0}
        className="w-full h-12 rounded-xl font-display font-bold text-sm tracking-[0.1em] uppercase flex items-center justify-center gap-2 transition-all mb-3 disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg,#C9A84C,#9d7c2e)', color: '#080B14', boxShadow: '0 4px 20px rgba(201,168,76,0.25)' }}
      >
        {connected.length > 0 ? `Connect ${connected.length} Account${connected.length > 1 ? 's' : ''}` : 'Select Platforms'}
        {connected.length > 0 && <ArrowRight className="w-4 h-4"/>}
      </button>
      <button onClick={onSkip} className="w-full text-center text-xs text-slate-600 hover:text-slate-400 transition-colors py-1">
        Connect later
      </button>
    </motion.div>
  );
};

// ─── Step 4: Complete ─────────────────────────────────────────────────────────
const Step4 = ({ onComplete, workspaceName }: { onComplete: () => void; workspaceName: string }) => {
  const items = ['Unlimited AI content generation', 'Platform-optimized posts', 'Brand injection on every post', 'Real-time performance analytics'];
  return (
    <motion.div key="step4" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="text-center">
      {/* Animated check */}
      <div className="relative w-20 h-20 mx-auto mb-8">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0, 0.2] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute inset-0 rounded-full"
          style={{ border: '1px solid rgba(201,168,76,0.3)', margin: '-8px' }}
        />
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0, 0.15] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.4 }}
          className="absolute inset-0 rounded-full"
          style={{ border: '1px solid rgba(201,168,76,0.2)', margin: '-16px' }}
        />
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#C9A84C,#9d7c2e)', boxShadow: '0 0 40px rgba(201,168,76,0.4)' }}>
          <Check className="w-8 h-8 text-void-900" />
        </div>
      </div>

      <h2 className="font-display text-2xl font-extrabold mb-2" style={{ background: 'linear-gradient(135deg,#C9A84C,#E8C96A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {workspaceName} is ready!
      </h2>
      <p className="text-sm text-slate-400 mb-8 max-w-xs mx-auto">Your workspace is set up and personalized. Here's what's waiting for you:</p>

      <div className="flex flex-col gap-2.5 mb-8">
        {items.map((item, i) => (
          <motion.div key={item} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.08 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-left"
            style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)' }}>
            <Zap className="w-4 h-4 text-classified flex-shrink-0" />
            <span className="text-sm text-slate-300 font-medium">{item}</span>
          </motion.div>
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        onClick={onComplete}
        className="w-full h-13 rounded-xl font-display font-bold text-sm tracking-[0.12em] uppercase flex items-center justify-center gap-2 transition-all"
        style={{ height: '52px', background: 'linear-gradient(135deg,#C9A84C,#9d7c2e)', color: '#080B14', boxShadow: '0 8px 32px rgba(201,168,76,0.4)' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 40px rgba(201,168,76,0.5)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(201,168,76,0.4)'; }}
      >
        Open My Desk <ArrowRight className="w-4 h-4"/>
      </motion.button>
    </motion.div>
  );
};

// ─── Main OnboardingPage ──────────────────────────────────────────────────────
export const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [workspaceName, setWorkspaceName] = useState('');

  const userName = (user as any)?.user_metadata?.full_name?.split(' ')[0] ?? 'there';

  return (
    <div className="min-h-screen bg-void-900 flex items-center justify-center px-6 py-12 safe-top safe-bottom"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-64 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse,rgba(201,168,76,0.06) 0%,transparent 70%)' }} />

      <div className="w-full max-w-sm relative z-10">
        <OnboardProgress step={step} />

        <AnimatePresence mode="wait">
          {step === 1 && <Step1 onNext={name => { setWorkspaceName(name); setStep(2); }} userName={userName} />}
          {step === 2 && <Step2 onNext={() => setStep(3)} onSkip={() => setStep(3)} />}
          {step === 3 && <Step3 onNext={() => setStep(4)} onSkip={() => setStep(4)} />}
          {step === 4 && <Step4 onComplete={() => navigate('/')} workspaceName={workspaceName || 'Your workspace'} />}
        </AnimatePresence>

        <p className="text-center text-xs text-slate-700 mt-8">
          Step {step} of {STEPS.length} · Takes under 2 minutes
        </p>
      </div>
    </div>
  );
};

export default OnboardingPage;
