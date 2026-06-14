// FILE PATH: src/pages/Auth/ForgotPasswordPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SUPPORT } from '../../lib/constants';

export default function ForgotPasswordPage() {
  const [email, setEmail]         = useState('');
  const [emailError, setEmailError] = useState('');
  const [sent, setSent]           = useState(false);
  const [loading, setLoading]     = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleSend = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim()) { setEmailError('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('Enter a valid email address'); return; }
    setEmailError('');
    setLoading(true);
    // Always show success — never reveal whether email exists (prevents enumeration attacks)
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    setSent(true);
    setCountdown(60);
  }, [email]);

  return (
    <div className="page-root overflow-y-auto">
      <div className="fixed inset-0 bg-void-900">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0"
             style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 20%, rgba(201,168,76,0.06) 0%, transparent 65%)' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-full px-5 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <Link to="/login"
                className="inline-flex items-center gap-2 mb-6 font-display text-2xs tracking-widest uppercase"
                style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Sign In
          </Link>

          <div className="glass-classified rounded-3xl overflow-hidden">
            {/* Gold accent bar */}
            <div className="h-0.5"
                 style={{ background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }} />

            <div className="p-6">
              <AnimatePresence mode="wait">
                {!sent ? (
                  <motion.div key="form"
                    initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                    <h1 className="font-display font-bold text-2xl heading-classified mb-2">Reset Password</h1>
                    <p className="font-body text-sm mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      Enter your account email and we'll send you a secure reset link.
                    </p>

                    <form onSubmit={handleSend} className="flex flex-col gap-4">
                      <div>
                        <label className="label-classified" htmlFor="forgot-email">Email Address</label>
                        <input
                          id="forgot-email"
                          type="email"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                          placeholder="you@company.com"
                          autoFocus
                          autoComplete="email"
                          className="input-classified"
                          style={emailError ? { borderColor: 'rgba(239,68,68,0.6)' } : {}}
                        />
                        {emailError && (
                          <p className="text-2xs mt-1" style={{ color: '#EF4444' }}>{emailError}</p>
                        )}
                      </div>

                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                        className="btn-classified w-full justify-center disabled:opacity-50"
                      >
                        {loading ? 'Sending…' : 'Send Reset Link'}
                      </motion.button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div key="sent"
                    initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                    className="flex flex-col items-center text-center gap-5">

                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(201,168,76,0.1)', border: '2px solid rgba(201,168,76,0.3)' }}>
                      <Mail size={28} style={{ color: '#C9A84C' }} />
                    </motion.div>

                    <div>
                      <h2 className="font-display font-bold text-xl heading-classified mb-2">Check Your Inbox</h2>
                      <p className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                        We sent a reset link to{' '}
                        <span style={{ color: '#C9A84C' }}>{email}</span>.
                        Check your spam folder if you don't see it within a minute.
                      </p>
                    </div>

                    {countdown > 0 ? (
                      <div className="w-full py-3 rounded-xl text-center"
                           style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <p className="font-body text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          Resend available in{' '}
                          <span style={{ fontFamily: 'var(--font-mono)', color: '#C9A84C' }}>{countdown}s</span>
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSend()}
                        disabled={loading}
                        className="btn-void w-full justify-center disabled:opacity-50"
                      >
                        {loading ? 'Sending…' : 'Resend Email'}
                      </button>
                    )}

                    <button
                      onClick={() => { setSent(false); setEmail(''); setCountdown(0); }}
                      className="font-body text-xs"
                      style={{ color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none',
                               cursor: 'pointer', textDecoration: 'underline',
                               textDecorationColor: 'rgba(255,255,255,0.15)' }}
                    >
                      Wrong email? Try again
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <p className="text-center font-body text-xs mt-5" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Still having trouble?{' '}
            <a href={`mailto:${SUPPORT.email}`}
               style={{ color: 'rgba(201,168,76,0.7)', textDecoration: 'none' }}>
              Contact support
            </a>
          </p>
        </motion.div>
      </div>

      {/* Persistent help pill */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center z-20 pb-4"
           style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)' }}>
        <a href={`mailto:${SUPPORT.email}`}
           className="flex items-center gap-1.5 px-4 py-2 rounded-full font-body text-xs"
           style={{ background: 'rgba(8,11,20,0.88)', backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
          Need help? <span style={{ color: 'rgba(201,168,76,0.7)' }}>{SUPPORT.email}</span>
        </a>
      </div>
    </div>
  );
}
