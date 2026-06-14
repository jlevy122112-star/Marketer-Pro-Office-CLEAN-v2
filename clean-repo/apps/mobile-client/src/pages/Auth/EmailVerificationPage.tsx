// FILE PATH: src/pages/Auth/EmailVerificationPage.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';
import { SUPPORT } from '../../lib/constants';

export default function EmailVerificationPage() {
  const navigate                  = useNavigate();
  const location                  = useLocation();
  const { success }               = useToast();
  const [loading, setLoading]     = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Email passed as state from SignUpPage navigate call
  const email = (location.state as { email?: string })?.email ?? '';

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Listen for Supabase SIGNED_IN event — fires when the user clicks the email link
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        success('Email verified!', 'Welcome to Marketer-Pro.');
        navigate('/onboarding', { replace: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate, success]);

  async function handleResend() {
    if (!email || loading || countdown > 0) return;
    setLoading(true);
    await supabase.auth.resend({ type: 'signup', email });
    setLoading(false);
    setCountdown(60);
  }

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
          className="w-full max-w-sm flex flex-col items-center text-center gap-6"
        >
          {/* Animated email icon */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(201,168,76,0.1)', border: '2px solid rgba(201,168,76,0.3)' }}
          >
            <Mail size={32} style={{ color: '#C9A84C' }} />
          </motion.div>

          <div>
            <h1 className="font-display font-bold text-2xl heading-classified mb-3">
              Verify Your Email
            </h1>
            <p className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
              We sent a verification link to{' '}
              {email && (
                <span style={{ color: '#C9A84C' }}>{email}</span>
              )}.
              {!email && ' your email address.'}
              {' '}Tap the link in that email to activate your account.
            </p>
          </div>

          {/* Step-by-step instructions */}
          <div className="card-classified w-full p-4 text-left">
            <p className="font-display text-2xs tracking-widest uppercase mb-3"
               style={{ color: 'rgba(201,168,76,0.6)' }}>
              Next steps
            </p>
            {[
              '1. Open your email app',
              '2. Find the email from Marketer-Pro',
              '3. Tap "Verify my email"',
              '4. You\'ll be brought back here automatically',
            ].map((step) => (
              <p key={step}
                 className="font-body text-sm py-2 border-b last:border-none"
                 style={{ color: 'rgba(255,255,255,0.55)', borderColor: 'rgba(255,255,255,0.06)' }}>
                {step}
              </p>
            ))}
          </div>

          {/* Resend button with countdown */}
          {countdown > 0 ? (
            <p className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Resend available in{' '}
              <span style={{ fontFamily: 'var(--font-mono)', color: '#C9A84C' }}>
                {countdown}s
              </span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={loading || !email}
              className="btn-void w-full justify-center disabled:opacity-50"
            >
              {loading ? 'Sending…' : 'Resend Verification Email'}
            </button>
          )}

          {/* Escape hatches */}
          <div className="flex flex-col gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <p>
              Wrong email?{' '}
              <Link to="/signup"
                    style={{ color: 'rgba(201,168,76,0.7)', textDecoration: 'none' }}>
                Start over
              </Link>
            </p>
            <p>
              Already verified?{' '}
              <Link to="/login"
                    style={{ color: 'rgba(201,168,76,0.7)', textDecoration: 'none' }}>
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Persistent help pill */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center z-20"
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
  async function handleResend() {
    if (!email || loading) return;
    setLoading(true);
    await supabase.auth.resend({ type: 'signup', email });
    setLoading(false);
    setCountdown(60);
  }

  return (
    <div className="page-root overflow-y-auto">
      <div className="fixed inset-0" style={{ background: '#080B14' }}>
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0"
             style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 20%, rgba(201,168,76,0.06) 0%, transparent 65%)' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-full px-5 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm flex flex-col items-center text-center gap-6"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0.5 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(201,168,76,0.1)', border: '2px solid rgba(201,168,76,0.3)' }}>
            <Mail size={32} style={{ color: '#C9A84C' }} />
          </motion.div>

          <div>
            <h1 className="font-display font-bold text-2xl heading-classified mb-3">Verify Your Email</h1>
            <p className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
              We sent a verification link to{' '}
              {email && <span style={{ color: '#C9A84C' }}>{email}</span>}.
              {' '}Tap the link in that email to activate your account.
            </p>
          </div>

          {/* What to do next */}
          <div className="card-classified w-full p-4 text-left">
            <p className="font-display text-2xs tracking-widest uppercase mb-3" style={{ color: 'rgba(201,168,76,0.6)' }}>
              Next steps
            </p>
            {[
              '1. Open your email app',
              '2. Find the email from Marketer-Pro',
              '3. Tap "Verify my email"',
              '4. You\'ll be brought back here automatically',
            ].map((step) => (
              <p key={step} className="font-body text-sm py-1.5 border-b"
                 style={{ color: 'rgba(255,255,255,0.55)', borderColor: 'rgba(255,255,255,0.06)' }}>
                {step}
              </p>
            ))}
          </div>

          {/* Resend */}
          {countdown > 0 ? (
            <p className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Resend available in <span className="font-mono" style={{ color: '#C9A84C' }}>{countdown}s</span>
            </p>
          ) : (
            <button onClick={handleResend} disabled={loading}
                    className="btn-void w-full justify-center disabled:opacity-50">
              {loading ? 'Sending…' : 'Resend Verification Email'}
            </button>
          )}

          {/* Wrong email */}
          <div className="flex flex-col gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <p>Wrong email?{' '}
              <Link to="/signup" style={{ color: 'rgba(201,168,76,0.7)', textDecoration: 'none' }}>
                Start over
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Persistent help */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center z-20"
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
