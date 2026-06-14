// FILE PATH: src/pages/Auth/ResetPasswordPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SUPPORT } from '../../lib/constants';

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Contains a letter',     test: (p: string) => /[a-zA-Z]/.test(p) },
  { label: 'Contains a number',     test: (p: string) => /[0-9]/.test(p) },
] as const;

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [tokenValid, setTokenValid]   = useState<boolean | null>(null);
  const [password, setPassword]       = useState('');
  const [confirm, setConfirm]         = useState('');
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [done, setDone]               = useState(false);
  const [error, setError]             = useState('');

  const rulesMet     = PASSWORD_RULES.filter((r) => r.test(password)).length;
  const strongEnough = rulesMet === PASSWORD_RULES.length;
  const matches      = password === confirm && confirm.length > 0;

  // Parse Supabase recovery token from URL hash
  useEffect(() => {
    const hash   = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', ''));
    const type   = params.get('type');
    const token  = params.get('access_token');

    if (type === 'recovery' && token) {
      supabase.auth.setSession({
        access_token:  token,
        refresh_token: params.get('refresh_token') ?? '',
      }).then(({ error: err }) => {
        setTokenValid(!err);
        if (err) console.error('[ResetPassword] Token error:', err.message);
      });
    } else {
      setTokenValid(false);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!strongEnough || !matches) return;
    setError('');
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      setDone(true);
      // Sign out all other sessions after password change — security best practice
      await supabase.auth.signOut({ scope: 'others' });
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── Checking token ─────────────────────────────────────────────────────────
  if (tokenValid === null) {
    return (
      <div className="page-root items-center justify-center bg-void-900">
        <div className="w-8 h-8 rounded-full border-2 border-transparent"
             style={{ borderTopColor: '#C9A84C', animation: 'spin 0.9s linear infinite' }}
             role="status" aria-label="Verifying link" />
      </div>
    );
  }

  // ── Invalid / expired token ────────────────────────────────────────────────
  if (tokenValid === false) {
    return (
      <div className="page-root items-center justify-center bg-void-900 px-5">
        <div className="text-center max-w-xs">
          <div className="text-5xl mb-5">⚠️</div>
          <h1 className="font-display font-bold text-xl heading-classified mb-3">Link Expired</h1>
          <p className="font-body text-sm mb-6"
             style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
            This password reset link has expired or is invalid. Links are valid for 60 minutes.
          </p>
          <button onClick={() => navigate('/forgot-password')}
                  className="btn-classified w-full justify-center">
            Request a New Link
          </button>
        </div>
      </div>
    );
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
          className="w-full max-w-sm glass-classified rounded-3xl overflow-hidden"
        >
          {/* Gold accent bar */}
          <div className="h-0.5"
               style={{ background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }} />

          <div className="p-6">
            <AnimatePresence mode="wait">
              {done ? (
                <motion.div key="done"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center py-4 gap-5">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}>
                    <CheckCircle size={52} style={{ color: '#6EE7B7' }} />
                  </motion.div>
                  <div>
                    <h2 className="font-display font-bold text-xl heading-classified mb-2">Password Updated</h2>
                    <p className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      Taking you to sign in…
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h1 className="font-display font-bold text-2xl heading-classified mb-2">New Password</h1>
                  <p className="font-body text-sm mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    Choose a strong password for your account.
                  </p>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Password field */}
                    <div>
                      <label className="label-classified" htmlFor="new-pw">New Password</label>
                      <div className="relative">
                        <input
                          id="new-pw"
                          type={showPass ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete="new-password"
                          required
                          className="input-classified pr-12"
                        />
                        <button type="button" onClick={() => setShowPass(!showPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                style={{ color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer' }}>
                          {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>

                      {/* Requirements checklist — always visible when typing */}
                      {password.length > 0 && (
                        <div className="mt-3 flex flex-col gap-1.5">
                          {PASSWORD_RULES.map((rule) => {
                            const met = rule.test(password);
                            return (
                              <div key={rule.label} className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                                     style={{ background: met ? '#6EE7B7' : 'rgba(255,255,255,0.07)',
                                              border: `1px solid ${met ? '#6EE7B7' : 'rgba(255,255,255,0.12)'}` }}>
                                  {met && (
                                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                      <path d="M1.5 4L3 6L6.5 2" stroke="#080B14" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                  )}
                                </div>
                                <span className="font-body text-xs transition-colors"
                                      style={{ color: met ? '#6EE7B7' : 'rgba(255,255,255,0.35)' }}>
                                  {rule.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Confirm password */}
                    <div>
                      <label className="label-classified" htmlFor="confirm-pw">Confirm Password</label>
                      <div className="relative">
                        <input
                          id="confirm-pw"
                          type={showConfirm ? 'text' : 'password'}
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          autoComplete="new-password"
                          required
                          className="input-classified pr-12"
                          style={confirm.length > 0
                            ? { borderColor: matches ? 'rgba(110,231,183,0.5)' : 'rgba(239,68,68,0.5)' }
                            : {}}
                        />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                style={{ color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer' }}>
                          {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {confirm.length > 0 && (
                        <p className="text-2xs mt-1"
                           style={{ color: matches ? '#6EE7B7' : '#EF4444' }}>
                          {matches ? '✓ Passwords match' : 'Passwords do not match'}
                        </p>
                      )}
                    </div>

                    {/* API error */}
                    {error && (
                      <p className="font-body text-xs text-center" style={{ color: '#EF4444' }}>{error}</p>
                    )}

                    <motion.button
                      type="submit"
                      disabled={loading || !strongEnough || !matches}
                      whileHover={!loading && strongEnough && matches ? { scale: 1.01 } : {}}
                      whileTap={!loading && strongEnough && matches   ? { scale: 0.98 } : {}}
                      className="btn-classified w-full justify-center disabled:opacity-40 disabled:transform-none"
                    >
                      {loading ? 'Updating…' : 'Set New Password'}
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
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
