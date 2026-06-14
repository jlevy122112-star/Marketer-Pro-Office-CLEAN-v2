// FILE PATH: src/pages/Auth/SignUpPage.tsx
import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { validateSignupForm, PASSWORD_RULES, validatePasswordStrength } from '../../lib/validators';
import { SUPPORT } from '../../lib/constants';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, signInWithApple } = useAuth();
  const { error: toastError } = useToast();

  // Field order: Email → Password → Confirm → Name (optimal for conversion)
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [name, setName]         = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});

  const strength = validatePasswordStrength(password); // 0-3
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong'];
  const strengthColors = ['', '#EF4444', '#F59E0B', '#6EE7B7'];
  const matches = confirm.length > 0 && password === confirm;

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const { valid, errors: errs } = validateSignupForm(email, password, confirm, name);
    if (!valid) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    const { error } = await signUp(email, password, name.trim());
    setLoading(false);
    if (error) { toastError('Sign up failed', error); return; }
    // Navigate to verify-email page, passing email in state
    navigate('/verify-email', { state: { email }, replace: true });
  }, [email, password, confirm, name, signUp, navigate, toastError]);

  return (
    <div className="page-root overflow-y-auto">
      <div className="fixed inset-0" style={{ background: '#080B14' }}>
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0"
             style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 20%, rgba(201,168,76,0.07) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-full px-5 pt-12 pb-24">
        {/* Back */}
        <div className="w-full max-w-sm mb-6">
          <Link to="/login"
                className="inline-flex items-center gap-2 font-display text-2xs tracking-widest uppercase"
                style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-7 w-full max-w-sm">
          <h1 className="font-display font-bold text-2xl heading-classified mb-2">
            Create Your Office
          </h1>
          <p className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Free to start. No credit card required.
          </p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-sm glass-classified rounded-3xl p-6"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email first — lowest friction */}
            <div>
              <label className="label-classified" htmlFor="su-email">Email</label>
              <input id="su-email" type="email" value={email}
                     onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
                     placeholder="you@company.com" autoComplete="email" required autoFocus
                     className="input-classified"
                     style={errors.email ? { borderColor: 'rgba(239,68,68,0.6)' } : {}} />
              {errors.email && <p className="text-2xs mt-1" style={{ color: '#EF4444' }}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="label-classified" htmlFor="su-password">Password</label>
              <div className="relative">
                <input id="su-password" type={showPass ? 'text' : 'password'} value={password}
                       onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
                       placeholder="Min. 8 characters" autoComplete="new-password" required
                       className="input-classified pr-12"
                       style={errors.password ? { borderColor: 'rgba(239,68,68,0.6)' } : {}} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-2xs mt-1" style={{ color: '#EF4444' }}>{errors.password}</p>}

              {/* Password requirements shown when typing */}
              {password.length > 0 && (
                <div className="mt-2.5 flex flex-col gap-1.5">
                  {PASSWORD_RULES.map((rule) => {
                    const met = rule.test(password);
                    return (
                      <div key={rule.label} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                             style={{ background: met ? '#6EE7B7' : 'rgba(255,255,255,0.06)',
                                      border: `1px solid ${met ? '#6EE7B7' : 'rgba(255,255,255,0.1)'}` }}>
                          {met && <svg width="7" height="7" viewBox="0 0 8 8" fill="none">
                            <path d="M1.5 4L3 6L6.5 2" stroke="#080B14" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>}
                        </div>
                        <span className="font-body text-2xs transition-colors"
                              style={{ color: met ? '#6EE7B7' : 'rgba(255,255,255,0.3)' }}>{rule.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="label-classified" htmlFor="su-confirm">Confirm Password</label>
              <div className="relative">
                <input id="su-confirm" type={showConf ? 'text' : 'password'} value={confirm}
                       onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirm: '' })); }}
                       placeholder="Re-enter password" autoComplete="new-password" required
                       className="input-classified pr-12"
                       style={errors.confirm ? { borderColor: 'rgba(239,68,68,0.6)' }
                            : confirm.length > 0 && matches ? { borderColor: 'rgba(110,231,183,0.5)' } : {}} />
                <button type="button" onClick={() => setShowConf(!showConf)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirm.length > 0 && (
                <p className="text-2xs mt-1" style={{ color: matches ? '#6EE7B7' : '#EF4444' }}>
                  {matches ? '✓ Passwords match' : (errors.confirm || 'Passwords do not match')}
                </p>
              )}
            </div>

            {/* Name — last, lowest priority, clearly labeled optional */}
            <div>
              <label className="label-classified" htmlFor="su-name">
                Display Name <span style={{ color: 'rgba(255,255,255,0.25)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
              </label>
              <input id="su-name" type="text" value={name}
                     onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, displayName: '' })); }}
                     placeholder="Your name or company" autoComplete="name"
                     className="input-classified" />
              {errors.displayName && <p className="text-2xs mt-1" style={{ color: '#EF4444' }}>{errors.displayName}</p>}
            </div>

            {/* Data promise — at point of commitment */}
            <p className="font-body text-2xs text-center" style={{ color: 'rgba(255,255,255,0.22)' }}>
              🔒 We never sell your data
            </p>

            {/* What happens next */}
            <p className="font-body text-2xs text-center" style={{ color: 'rgba(255,255,255,0.28)' }}>
              After signing up → Set up your workspace (90 sec)
            </p>

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className="btn-classified w-full justify-center disabled:opacity-50 disabled:transform-none">
              {loading ? 'Creating Account…' : 'Create Free Account'}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <span className="font-display text-2xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={() => signInWithApple()} type="button"
                    className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-display font-semibold text-sm tracking-widest uppercase transition-all"
                    style={{ background: '#000', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}>
              <AppleIcon /> Continue with Apple
            </button>
            <button onClick={() => signInWithGoogle()} type="button"
                    className="btn-void w-full justify-center">
              <GoogleIcon /> Continue with Google
            </button>
          </div>

          <p className="text-center font-body text-2xs mt-5" style={{ color: 'rgba(255,255,255,0.2)' }}>
            By signing up you agree to our{' '}
            <a href="https://marketer-pro.app/terms" style={{ color: 'rgba(201,168,76,0.6)', textDecoration: 'none' }}>Terms</a>
            {' '}&{' '}
            <a href="https://marketer-pro.app/privacy" style={{ color: 'rgba(201,168,76,0.6)', textDecoration: 'none' }}>Privacy Policy</a>
          </p>

          <p className="text-center font-body text-xs mt-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'rgba(201,168,76,0.7)', textDecoration: 'none' }}>Sign in</Link>
          </p>
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

function AppleIcon() {
  return <svg width="15" height="18" viewBox="0 0 814 1000" fill="currentColor" aria-hidden>
    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46.1 672.4 0 531 0 392.6c0-232.5 150.6-355.6 299-355.6 79.3 0 145.3 51.9 194.8 51.9 47.4 0 121.6-54.9 206-54.9zM549.5 46c-13.5 17.9-35.9 33.8-54.4 33.8-1.3 0-2.6-.2-3.9-.4-4-21.3 11.4-44.2 24.4-58.8 14.1-16 38.4-29.4 59.1-30.8 3.2 22.5-10.3 44.9-25.2 56.2z"/>
  </svg>;
}
function GoogleIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>;
}
