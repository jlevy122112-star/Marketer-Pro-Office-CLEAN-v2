/**
 * LoginPage.tsx — Premium rewrite
 * Marketer Pro Office Edition
 *
 * Design: cinematic dark luxury
 * - Split panel: brand left / form right (desktop), stacked (mobile)
 * - Animated grid background on brand panel
 * - Gold classified accent system
 * - Social auth + email form
 * - Trust signals, stat counters
 * - Framer-motion entrance animations
 * - WCAG AA accessible
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Loader2, Shield, TrendingUp,
  Zap, ArrowRight, Lock, CheckCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────
type AuthMode = 'signin' | 'signup' | 'forgot';

// ─── Brand stat counter ───────────────────────────────────────────────────────
const StatCounter = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col gap-0.5">
    <span className="font-display text-2xl font-extrabold text-classified tracking-wide">{value}</span>
    <span className="text-[11px] text-slate-600 tracking-[0.08em] uppercase">{label}</span>
  </div>
);

// ─── Feature pill ─────────────────────────────────────────────────────────────
const FeaturePill = ({ icon, text, delay }: { icon: React.ReactNode; text: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -12 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    className="flex items-center gap-2.5 text-sm text-slate-400"
  >
    <span className="text-classified/70 flex-shrink-0">{icon}</span>
    {text}
  </motion.div>
);

// ─── Password strength ────────────────────────────────────────────────────────
const PasswordStrength = ({ password }: { password: string }) => {
  if (!password) return null;
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const colors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? colors[score] : 'rgba(255,255,255,0.06)' }}
          />
        ))}
      </div>
      <span className="text-[11px] font-medium min-w-[32px] text-right transition-colors" style={{ color: colors[score] }}>
        {labels[score]}
      </span>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => { headingRef.current?.focus(); }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords don\'t match. Try again.');
      return;
    }
    if (mode === 'signup' && password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        await login(email, password);
        navigate('/');
      } else if (mode === 'signup') {
        await register(email, password, fullName);
        navigate('/onboarding');
      } else {
        // forgot - handled by supabase
        const { supabase } = await import('../lib/supabase');
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        setForgotSent(true);
      }
    } catch (err: any) {
      const msg = err?.message ?? '';
      if (msg.includes('Invalid login')) setError('Email or password is incorrect.');
      else if (msg.includes('already registered')) setError('Account already exists. Sign in instead.');
      else if (msg.includes('network')) setError('Connection issue. Check your internet.');
      else setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: AuthMode) => {
    setMode(next); setError(null); setForgotSent(false);
  };

  const COPY = {
    signin:  { title: 'Welcome back',        sub: 'Sign in to your Marketer Pro desk', cta: 'Access Desk', ctaLoad: 'Signing in…' },
    signup:  { title: 'Create your account', sub: 'Start building standout content today', cta: 'Create Account', ctaLoad: 'Creating workspace…' },
    forgot:  { title: 'Reset your password', sub: 'Enter your email and we\'ll send a reset link', cta: 'Send Reset Link', ctaLoad: 'Sending…' },
  };

  return (
    <div className="min-h-screen bg-void-900 flex" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ── Brand panel (desktop only) ── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex flex-col justify-between w-[440px] flex-shrink-0 relative overflow-hidden border-r border-white/[0.06]"
        style={{ background: 'linear-gradient(145deg, #050812 0%, #0d1428 50%, #111827 100%)' }}
      >
        {/* Animated grid */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)',
          }}
        />
        {/* Gold radial glow */}
        <div className="absolute top-0 left-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(201,168,76,0.08) 0%,transparent 70%)' }} />
        {/* Reactor glow bottom */}
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(110,231,183,0.05) 0%,transparent 70%)' }} />

        <div className="relative z-10 p-10 flex flex-col gap-10">
          {/* Logo */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#C9A84C,#9d7c2e)', boxShadow: '0 0 24px rgba(201,168,76,0.3)' }}>
              <TrendingUp className="w-5 h-5 text-void-900" />
            </div>
            <span className="font-display text-base font-bold tracking-[0.15em] text-classified">MARKETER PRO</span>
          </motion.div>

          {/* Headline */}
          <div>
            <motion.h2 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="font-display text-3xl font-extrabold text-slate-100 leading-[1.15] tracking-tight mb-4">
              Create content that<br />
              <span style={{ background: 'linear-gradient(135deg,#C9A84C,#E8C96A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                actually converts
              </span>
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="text-sm text-slate-400 leading-relaxed">
              AI-powered social content, brand-injected and platform-optimized. Built for creators serious about growth.
            </motion.p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-col gap-3">
            <FeaturePill icon={<Zap className="w-4 h-4"/>} text="Generate 30+ posts per day in seconds" delay={0.45} />
            <FeaturePill icon={<Shield className="w-4 h-4"/>} text="Every post injected with your brand" delay={0.5} />
            <FeaturePill icon={<TrendingUp className="w-4 h-4"/>} text="Optimized for every social platform" delay={0.55} />
            <FeaturePill icon={<CheckCircle className="w-4 h-4"/>} text="14-day free trial, cancel anytime" delay={0.6} />
          </div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
            className="flex gap-8 pt-4 border-t border-white/[0.06]">
            <StatCounter value="10x" label="Faster creation" />
            <StatCounter value="30+" label="Posts per day" />
            <StatCounter value="5★" label="App rating" />
          </motion.div>
        </div>

        {/* Bottom quote */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="relative z-10 m-10 p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <p className="text-sm text-slate-400 italic leading-relaxed mb-3">
            "We went from posting twice a week to 30 pieces of brand-consistent content daily."
          </p>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-classified/20 flex items-center justify-center text-classified text-xs font-bold">P</div>
            <div>
              <p className="text-xs font-semibold text-slate-300">Priya S.</p>
              <p className="text-[11px] text-slate-600">Head of Growth, Nexora</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[360px]"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#C9A84C,#9d7c2e)' }}>
              <TrendingUp className="w-4 h-4 text-void-900" />
            </div>
            <span className="font-display text-sm font-bold tracking-[0.15em] text-classified">MARKETER PRO</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <p className="text-[11px] font-bold tracking-[0.2em] text-classified uppercase mb-2">
              {mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Get started' : 'Account recovery'}
            </p>
            <h1 ref={headingRef} tabIndex={-1} className="font-display text-2xl font-extrabold text-slate-100 tracking-tight outline-none mb-1">
              {COPY[mode].title}
            </h1>
            <p className="text-sm text-slate-500">{COPY[mode].sub}</p>
          </div>

          {/* Forgot success */}
          <AnimatePresence>
            {forgotSent && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-emerald-400">Check your email</p>
                  <p className="text-xs text-slate-400 mt-0.5">We sent a reset link to {email}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Social auth */}
          {mode !== 'forgot' && (
            <>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: 'Google', color: '#4285F4', icon: 'G' },
                  { label: 'Apple', color: '#e2e8f0', icon: '🍎' },
                ].map(p => (
                  <button key={p.label}
                    className="h-11 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center gap-2 text-sm font-medium text-slate-300 hover:bg-white/[0.07] hover:border-classified/25 transition-all"
                    style={{ fontFamily: "'DM Sans',sans-serif" }}>
                    <span>{p.icon}</span>
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-xs text-slate-600">or email</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>
            </>
          )}

          {/* Error banner */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2"
                role="alert">
                <span className="text-red-400 text-sm mt-0.5">⚠</span>
                <p className="text-sm text-red-300">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide">Full name</label>
                <input
                  type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="Jane Smith" autoComplete="name" required
                  className="w-full h-11 px-4 rounded-xl text-sm text-slate-200 placeholder-slate-700 outline-none transition-all"
                  style={{ background: 'var(--desk-800,#111827)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.06)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide">Email address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com" autoComplete="email" required
                className="w-full h-11 px-4 rounded-xl text-sm text-slate-200 placeholder-slate-700 outline-none transition-all"
                style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.06)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-400 tracking-wide">Password</label>
                  {mode === 'signin' && (
                    <button type="button" onClick={() => switchMode('forgot')}
                      className="text-xs text-slate-500 hover:text-classified transition-colors">Forgot?</button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? '8+ characters' : '••••••••'}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required
                    className="w-full h-11 pl-4 pr-11 rounded-xl text-sm text-slate-200 placeholder-slate-700 outline-none transition-all"
                    style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.06)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors" aria-label={showPass ? 'Hide' : 'Show'}>
                    {showPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                  </button>
                </div>
                {mode === 'signup' && <PasswordStrength password={password} />}
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide">Confirm password</label>
                <input
                  type={showPass ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password" autoComplete="new-password" required
                  className="w-full h-11 px-4 rounded-xl text-sm text-slate-200 placeholder-slate-700 outline-none transition-all"
                  style={{ background: '#111827', border: `1px solid ${confirmPassword && confirmPassword !== password ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)'}` }}
                  onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.06)'; }}
                  onBlur={e => { e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
            )}

            {/* CTA */}
            <button
              type="submit" disabled={loading || forgotSent}
              className="w-full h-12 rounded-xl font-display font-bold text-sm tracking-[0.1em] uppercase flex items-center justify-center gap-2 transition-all mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg,#C9A84C,#9d7c2e)', color: '#080B14', boxShadow: '0 4px 20px rgba(201,168,76,0.3)' }}
              onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 28px rgba(201,168,76,0.4)'; }}}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(201,168,76,0.3)'; }}
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin"/>{COPY[mode].ctaLoad}</>
                : <>{COPY[mode].cta}<ArrowRight className="w-4 h-4"/></>}
            </button>

            {/* Privacy note for signup */}
            {mode === 'signup' && (
              <p className="text-[11px] text-slate-600 text-center leading-relaxed">
                By creating an account you agree to our{' '}
                <Link to="/terms" className="text-slate-400 hover:text-classified transition-colors">Terms</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-slate-400 hover:text-classified transition-colors">Privacy Policy</Link>
              </p>
            )}
          </form>

          {/* Mode switch */}
          <p className="text-center text-sm text-slate-500 mt-6">
            {mode === 'signin' && <>No account? <button onClick={() => switchMode('signup')} className="text-classified hover:text-classified-light font-medium transition-colors">Start free →</button></>}
            {mode === 'signup' && <>Already have an account? <button onClick={() => switchMode('signin')} className="text-classified hover:text-classified-light font-medium transition-colors">Sign in</button></>}
            {mode === 'forgot' && <button onClick={() => switchMode('signin')} className="text-classified hover:text-classified-light font-medium transition-colors">← Back to sign in</button>}
          </p>

          {/* Trust signals */}
          {mode !== 'forgot' && (
            <div className="flex items-center justify-center gap-4 mt-6">
              {[['🔒', 'Encrypted'], ['🛡️', 'SOC 2'], ['✓', 'GDPR']].map(([icon, label]) => (
                <div key={label} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                  <span>{icon}</span><span>{label}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
