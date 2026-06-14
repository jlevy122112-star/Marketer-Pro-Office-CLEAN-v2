// FILE PATH: src/pages/Auth/LoginPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth, getStoredReturningName, clearReturningName } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { validateLoginForm } from '../../lib/validators';
import { SUPPORT } from '../../lib/constants';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, signInWithApple, session } = useAuth();
  const { error: toastError } = useToast();

  const [returningName, setReturningName] = useState<string | null>(null);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});

  // Step 6 — detect returning user on mount
  useEffect(() => {
    const name = getStoredReturningName();
    setReturningName(name);
  }, []);

  // Already logged in
  useEffect(() => {
    if (session) navigate('/create', { replace: true });
  }, [session, navigate]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const { valid, errors: errs } = validateLoginForm(email, password);
    if (!valid) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    const { error, displayName } = await signIn(email, password);
    setLoading(false);
    if (error) {
      if (error.toLowerCase().includes('invalid') || error.toLowerCase().includes('credentials')) {
        setErrors({ password: 'Incorrect email or password' });
      } else {
        toastError('Sign in failed', error);
      }
      return;
    }
    navigate('/create', { replace: true });
  }, [email, password, signIn, navigate, toastError]);

  const isReturning = !!returningName;
  const firstName   = returningName?.split(' ')[0] ?? '';

  return (
    <div className="page-root overflow-y-auto">
      {/* Background */}
      <div className="fixed inset-0" style={{ background: '#080B14' }}>
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0"
             style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 20%, rgba(201,168,76,0.07) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-full px-5 pt-14 pb-24">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="flex flex-col items-center mb-7"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
               style={{ background: 'linear-gradient(135deg, #C9A84C 0%, #9d7c2e 100%)', boxShadow: '0 0 40px rgba(201,168,76,0.3)' }}>
            <span className="font-display font-bold text-2xl" style={{ color: '#080B14' }}>M</span>
          </div>
          <p className="font-display text-2xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Marketer-Pro · Your Digital Office
          </p>
        </motion.div>

        {/* Step 1 — Value prop header (new vs returning) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-7 w-full"
        >
          <AnimatePresence mode="wait">
            {isReturning ? (
              <motion.div key="returning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* RETURNING USER — warm and personal */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3"
                     style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)' }}>
                  <span className="text-sm">👋</span>
                  <span className="font-display text-2xs tracking-widest uppercase" style={{ color: 'rgba(201,168,76,0.8)' }}>
                    Welcome back
                  </span>
                </div>
                <h1 className="font-display font-bold text-2xl heading-classified mb-2">
                  Good to see you{firstName ? `, ${firstName}` : ''}
                </h1>
                <p className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Your Digital Office is ready.
                </p>
              </motion.div>
            ) : (
              <motion.div key="new" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* NEW USER — value proposition */}
                <h1 className="font-display font-bold text-2xl heading-classified mb-2">
                  Post to every platform<br />in 60 seconds
                </h1>
                <p className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  AI writes it.{' '}
                  <span style={{ color: '#C9A84C' }}>You approve it.</span>
                  {' '}Done.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Login card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="w-full max-w-sm glass-classified rounded-3xl p-6"
        >
          {/* Returning user "Not you?" */}
          {isReturning && (
            <div className="flex items-center justify-between mb-5">
              <p className="font-display text-2xs tracking-widest uppercase" style={{ color: 'rgba(201,168,76,0.6)' }}>
                Access Desk
              </p>
              <button
                onClick={() => { clearReturningName(); setReturningName(null); }}
                className="font-body text-xs underline"
                style={{ color: 'rgba(255,255,255,0.3)', textDecorationColor: 'rgba(255,255,255,0.15)' }}
              >
                Not {firstName}?
              </button>
            </div>
          )}
          {!isReturning && (
            <p className="font-display text-2xs tracking-widest uppercase mb-5" style={{ color: 'rgba(201,168,76,0.6)' }}>
              Sign In
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label className="label-classified" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
                placeholder="you@company.com"
                autoComplete="email"
                required
                className="input-classified"
                style={errors.email ? { borderColor: 'rgba(239,68,68,0.6)' } : {}}
              />
              {errors.email && <p className="text-2xs mt-1" style={{ color: '#EF4444' }}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label-classified mb-0" htmlFor="login-password">Password</label>
                {/* Step 3 — Forgot password */}
                <Link to="/forgot-password"
                      className="font-body text-xs"
                      style={{ color: 'rgba(201,168,76,0.7)', textDecoration: 'none' }}>
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="input-classified pr-12"
                  style={errors.password ? { borderColor: 'rgba(239,68,68,0.6)' } : {}}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        aria-label={showPass ? 'Hide password' : 'Show password'}
                        style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-2xs mt-1" style={{ color: '#EF4444' }}>{errors.password}</p>}
            </div>

            {/* Submit */}
            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className="btn-classified w-full justify-center mt-1 disabled:opacity-50 disabled:transform-none"
              aria-busy={loading}
            >
              {loading ? (
                <span className="flex gap-1.5">
                  {[0,1,2].map((i) => (
                    <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-void-900 inline-block"
                      animate={{ opacity: [0.3,1,0.3] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }} />
                  ))}
                </span>
              ) : isReturning ? '⬡ Back to Your Office' : '⬡ Access Desk'}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <span className="font-display text-2xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* OAuth — Apple REQUIRED by Apple Guideline 4.8 */}
          <div className="flex flex-col gap-3">
            <button onClick={() => signInWithApple()} type="button"
                    data-testid="apple-signin"
                    className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-display font-semibold text-sm tracking-widest uppercase transition-all"
                    style={{ background: '#000', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}>
              <AppleIcon />
              Continue with Apple
            </button>
            <button onClick={() => signInWithGoogle()} type="button"
                    className="btn-void w-full justify-center">
              <GoogleIcon />
              Continue with Google
            </button>
          </div>
        </motion.div>

        {/* Step 2 — Full-width signup CTA below card (new users only) */}
        {!isReturning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="w-full max-w-sm mt-4"
          >
            <Link to="/signup" style={{ textDecoration: 'none' }}>
              <button type="button" className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-display font-semibold text-sm tracking-widest uppercase transition-all"
                      style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.55)' }}>
                Create Free Account
                <ArrowRight size={14} />
              </button>
            </Link>
          </motion.div>
        )}

        {/* Step 4 — Trust signal (new users only) */}
        {!isReturning && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.38 }}
            className="flex items-center gap-2.5 mt-5"
          >
            <div className="flex">
              {['#E4405F','#1877F2','#0A66C2','#FF0050'].map((c, i) => (
                <div key={i} style={{ width: 18, height: 18, borderRadius: '50%', background: c,
                  border: '1.5px solid #080B14', marginLeft: i > 0 ? -6 : 0 }} />
              ))}
            </div>
            <p className="font-body text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <span style={{ color: '#C9A84C', fontWeight: 600 }}>12,000+</span> marketers use Marketer-Pro
            </p>
          </motion.div>
        )}

        {/* Security badges */}
        {!isReturning && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
            className="flex items-center gap-5 mt-4"
          >
            {['SOC 2','AES-256','GDPR'].map((b) => (
              <span key={b} className="font-display text-2xs tracking-widest uppercase"
                    style={{ color: 'rgba(255,255,255,0.18)' }}>◆ {b}</span>
            ))}
          </motion.div>
        )}
      </div>

      {/* Step 5 — Persistent "Need help?" always visible at bottom */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center z-20"
           style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)' }}>
        <a href={`mailto:${SUPPORT.email}`}
           className="flex items-center gap-1.5 px-4 py-2 rounded-full font-body text-xs"
           style={{ background: 'rgba(8,11,20,0.88)', backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
          Need help?
          <span style={{ color: 'rgba(201,168,76,0.7)' }}>{SUPPORT.email}</span>
        </a>
      </div>
    </div>
  );
}

function AppleIcon() {
  return (
    <svg width="15" height="18" viewBox="0 0 814 1000" fill="currentColor" aria-hidden>
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46.1 672.4 0 531 0 392.6c0-232.5 150.6-355.6 299-355.6 79.3 0 145.3 51.9 194.8 51.9 47.4 0 121.6-54.9 206-54.9zM549.5 46c-13.5 17.9-35.9 33.8-54.4 33.8-1.3 0-2.6-.2-3.9-.4-4-21.3 11.4-44.2 24.4-58.8 14.1-16 38.4-29.4 59.1-30.8 3.2 22.5-10.3 44.9-25.2 56.2z"/>
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
                                   }async function getReturningUserName(): Promise<string | null> {
  try {
    // Capacitor Preferences (native)
    const { Preferences } = await import('@capacitor/preferences');
    const { value } = await Preferences.get({ key: 'mp_user_display_name' });
    return value;
  } catch {
    // Web fallback
    return localStorage.getItem('mp_user_display_name');
  }
}

export async function storeUserName(name: string): Promise<void> {
  try {
    const { Preferences } = await import('@capacitor/preferences');
    await Preferences.set({ key: 'mp_user_display_name', value: name });
  } catch {
    localStorage.setItem('mp_user_display_name', name);
  }
}

export async function clearStoredUserName(): Promise<void> {
  try {
    const { Preferences } = await import('@capacitor/preferences');
    await Preferences.remove({ key: 'mp_user_display_name' });
  } catch {
    localStorage.removeItem('mp_user_display_name');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, session } = useAuth();
  const { error: toastError }                 = useToast();

  const [returningName, setReturningName] = useState<string | null>(null);
  const [checkingReturn, setCheckingReturn] = useState(true);

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState<{ email?: string; password?: string }>({});

  const isReturning = returningName !== null;

  // ── Check for returning user on mount ─────────────────────────────────────
  useEffect(() => {
    getReturningUserName().then((name) => {
      setReturningName(name);
      setCheckingReturn(false);
    });
  }, []);

  // ── Redirect if already authenticated ─────────────────────────────────────
  useEffect(() => {
    if (session) navigate('/desk', { replace: true });
  }, [session, navigate]);

  // ── Form validation ────────────────────────────────────────────────────────
  function validate(): boolean {
    const e: typeof errors = {};
    if (!email.trim())
      e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = 'Enter a valid email address';
    if (!password)
      e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Sign in ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await haptic('medium');
    setLoading(true);

    const { error, user } = await signIn(email, password);
    setLoading(false);

    if (error) {
      await haptic('heavy');
      if (error.toLowerCase().includes('email') || error.toLowerCase().includes('user'))
        setErrors({ email: 'No account found with this email' });
      else if (error.toLowerCase().includes('password') || error.toLowerCase().includes('invalid'))
        setErrors({ password: 'Incorrect password' });
      else
        toastError('Sign in failed', error);
      return;
    }

    // Store display name for returning user detection on next visit
    if (user?.displayName) await storeUserName(user.displayName);
    await haptic('light');
    navigate('/desk', { replace: true });
  }, [email, password, signIn, navigate, toastError]);

  const handleGoogle = useCallback(async () => {
    await haptic('light');
    await signInWithGoogle();
  }, [signInWithGoogle]);

  const handleAppleSignIn = useCallback(async () => {
    await haptic('light');
    // Wire to Supabase Apple OAuth — provider configured in Supabase dashboard
    const { error } = await signInWithGoogle(); // replace with signInWithApple when configured
    if (error) toastError('Apple sign-in failed', error);
  }, [signInWithGoogle, toastError]);

  // ── Don't render until we know returning status ────────────────────────────
  if (checkingReturn) return null;

  return (
    <div style={{
      position:        'fixed',
      inset:            0,
      background:       colors.void[900],
      overflowY:       'auto',
      display:         'flex',
      flexDirection:   'column',
      alignItems:      'center',
    }}>
      {/* ── Background layers ── */}
      <div style={{
        position:        'fixed',
        inset:            0,
        pointerEvents:   'none',
        backgroundImage:  gradients.grid,
        backgroundSize:  '32px 32px',
      }} aria-hidden />

      <div style={{
        position:  'fixed',
        inset:      0,
        pointerEvents: 'none',
        background: gradients.goldRadial,
      }} aria-hidden />

      {/* ── Scrollable content ── */}
      <div style={{
        position:      'relative',
        zIndex:         1,
        width:         '100%',
        maxWidth:       420,
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        padding:       `${space[12]} ${space[5]} 100px`,
        minHeight:     '100dvh',
      }}>

        {/* ── LOGO ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          style={{
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'center',
            marginBottom:   space[6],
          }}
        >
          <div style={{
            width:          72,
            height:         72,
            borderRadius:   20,
            background:     gradients.gold,
            boxShadow:      '0 0 60px rgba(201,168,76,0.35)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            marginBottom:   space[4],
          }}>
            <span style={{
              fontFamily:  fonts.display,
              fontWeight:  fontWeights.extrabold,
              fontSize:    fontSizes['4xl'],
              color:       '#060912',
              letterSpacing: '-2px',
            }}>M</span>
          </div>
          <Text
            variant="faint"
            size="2xs"
            weight="bold"
            uppercase
            style={{ letterSpacing: letterSpacings.caps }}
          >
            Marketer-Pro · Your Digital Office
          </Text>
        </motion.div>

        {/* ── STEP 1 — VALUE PROPOSITION HEADER ── */}
        {/* New user: marketing headline */}
        {/* Returning user: personalised welcome back */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ textAlign: 'center', marginBottom: space[7], width: '100%' }}
        >
          <AnimatePresence mode="wait">
            {isReturning ? (
              <motion.div
                key="returning"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* RETURNING USER — warm, personal, efficient */}
                <div style={{
                  display:        'inline-flex',
                  alignItems:     'center',
                  gap:            8,
                  padding:        '6px 14px',
                  borderRadius:   20,
                  background:     colors.classified.ghost,
                  border:         `1px solid ${colors.classified.border}`,
                  marginBottom:   space[3],
                }}>
                  <span aria-hidden style={{ fontSize: 14 }}>👋</span>
                  <Text
                    variant="gold"
                    size="2xs"
                    weight="bold"
                    uppercase
                    style={{ letterSpacing: letterSpacings.wider }}
                  >
                    Welcome back
                  </Text>
                </div>
                <Heading level={2} gold>
                  {returningName
                    ? `Good to see you, ${returningName.split(' ')[0]}`
                    : 'Welcome back'}
                </Heading>
                <Text
                  variant="faint"
                  size="base"
                  style={{ marginTop: 8, lineHeight: 1.6 }}
                >
                  Your Digital Office is ready.
                </Text>
              </motion.div>
            ) : (
              <motion.div
                key="new"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* NEW USER — value proposition, not a login prompt */}
                <Heading level={2} gold style={{ marginBottom: 10 }}>
                  Post to every platform
                  <br />in 60 seconds
                </Heading>
                <Text
                  variant="tertiary"
                  size="base"
                  style={{ lineHeight: 1.7 }}
                >
                  AI writes it.{' '}
                  <span style={{ color: colors.classified.DEFAULT }}>You approve it.</span>
                  {' '}Done.
                </Text>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── LOGIN CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          style={{
            width:               '100%',
            background:          'rgba(13,17,32,0.92)',
            border:              `1px solid ${colors.classified.border}`,
            borderRadius:        radii['2xl'],
            padding:             space[6],
            backdropFilter:      'blur(20px)',
            WebkitBackdropFilter:'blur(20px)',
          }}
        >
          {/* Returning user: show "Not you?" link to switch accounts */}
          {isReturning && (
            <div style={{
              display:        'flex',
              justifyContent: 'space-between',
              alignItems:     'center',
              marginBottom:   space[5],
            }}>
              <Text variant="faint" size="2xs" weight="bold" uppercase style={{ letterSpacing: letterSpacings.widest }}>
                Access Desk
              </Text>
              <button
                onClick={async () => {
                  await clearStoredUserName();
                  setReturningName(null);
                }}
                style={{
                  fontFamily:    fonts.body,
                  fontSize:      fontSizes.xs,
                  color:         colors.text.faint,
                  background:    'none',
                  border:        'none',
                  cursor:        'pointer',
                  textDecoration:'underline',
                  textDecorationColor: colors.text.ghost,
                }}
              >
                Not {returningName?.split(' ')[0] ?? 'you'}?
              </button>
            </div>
          )}

          {!isReturning && (
            <Text
              variant="faint"
              size="2xs"
              weight="bold"
              uppercase
              style={{ letterSpacing: letterSpacings.widest, marginBottom: space[5] }}
            >
              Sign In
            </Text>
          )}

          {/* ── FORM ── */}
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: space[3] }}
          >
            {/* Email */}
            <div>
              <Input
                id="login-email"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                }}
                autoComplete="email"
                required
                error={errors.email}
                // Returning user: pre-fill email hint if stored
                placeholder={isReturning ? 'Enter your email' : ''}
              />
            </div>

            {/* Password */}
            <div>
              <Input
                id="login-password"
                label="Password"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                }}
                autoComplete="current-password"
                required
                error={errors.password}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                    style={{
                      color:      colors.text.faint,
                      background: 'none',
                      border:     'none',
                      cursor:     'pointer',
                      padding:    0,
                      display:    'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
            </div>

            {/* STEP 3 — Forgot password link → /forgot-password */}
            <div style={{ textAlign: 'right', marginTop: -4 }}>
              <Link
                to="/forgot-password"
                style={{
                  fontFamily:    fonts.body,
                  fontSize:      fontSizes.xs,
                  color:         colors.classified.dim,
                  textDecoration:'none',
                }}
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.01 } : {}}
              whileTap={!loading  ? { scale: 0.97 } : {}}
              aria-label="Sign in to your account"
              aria-busy={loading}
              style={{
                width:         '100%',
                padding:       '15px 0',
                borderRadius:   radii.lg,
                border:        'none',
                cursor:         loading ? 'not-allowed' : 'pointer',
                background:     loading
                  ? 'rgba(201,168,76,0.25)'
                  : gradients.gold,
                color:         '#060912',
                fontFamily:     fonts.display,
                fontWeight:     fontWeights.bold,
                fontSize:       fontSizes.xs,
                letterSpacing:  letterSpacings.wider,
                textTransform: 'uppercase',
                display:       'flex',
                alignItems:    'center',
                justifyContent:'center',
                gap:            8,
                boxShadow:      loading ? 'none' : '0 0 30px rgba(201,168,76,0.22)',
                marginTop:      space[1],
              }}
            >
              {loading ? (
                <LoadingDots />
              ) : (
                <>
                  {isReturning ? 'Back to Your Office' : '⬡ Access Desk'}
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div style={{ margin: `${space[5]} 0 ${space[4]}` }}>
            <Divider label="or" />
          </div>

          {/* OAuth buttons */}
          <Stack gap={10}>
            {/* Sign in with Apple — REQUIRED by Apple Guideline 4.8 */}
            <button
              type="button"
              onClick={handleAppleSignIn}
              data-testid="apple-signin"
              aria-label="Sign in with Apple"
              style={{
                width:         '100%',
                padding:       '13px 0',
                borderRadius:   radii.lg,
                background:    '#000',
                border:        '1px solid rgba(255,255,255,0.2)',
                color:         '#fff',
                fontFamily:     fonts.display,
                fontWeight:     fontWeights.semibold,
                fontSize:       fontSizes.xs,
                letterSpacing:  letterSpacings.wider,
                cursor:        'pointer',
                display:       'flex',
                alignItems:    'center',
                justifyContent:'center',
                gap:            10,
              }}
            >
              <AppleIcon />
              Continue with Apple
            </button>

            {/* Google OAuth */}
            <button
              type="button"
              onClick={handleGoogle}
              aria-label="Continue with Google"
              style={{
                width:         '100%',
                padding:       '13px 0',
                borderRadius:   radii.lg,
                background:    'rgba(255,255,255,0.05)',
                border:        `1px solid ${colors.border.dim}`,
                color:          colors.text.secondary,
                fontFamily:     fonts.display,
                fontWeight:     fontWeights.semibold,
                fontSize:       fontSizes.xs,
                letterSpacing:  letterSpacings.wider,
                cursor:        'pointer',
                display:       'flex',
                alignItems:    'center',
                justifyContent:'center',
                gap:            10,
              }}
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </Stack>
        </motion.div>

        {/* ── STEP 2 — FULL-WIDTH SIGNUP CTA (below card, not inside) ── */}
        {/* Only shown to new users — returning users don't need this */}
        {!isReturning && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transitio        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-classified/10 border border-classified/20 flex items-center justify-center mb-4">
            <Shield className="w-7 h-7 text-classified" />
          </div>
          <h1 className="font-display text-3xl tracking-widest text-classified">MARKETER PRO</h1>
          <p className="text-xs text-slate-500 tracking-[0.25em] uppercase mt-1">Office Edition</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="w-full h-12 px-4 rounded-xl bg-desk-800 border border-white/[0.08] text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-classified/40 focus:bg-desk-700 transition-all"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full h-12 px-4 rounded-xl bg-desk-800 border border-white/[0.08] text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-classified/40 focus:bg-desk-700 transition-all"
          />

          {error && (
            <p className="text-xs text-red-400 px-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-classified text-void-900 font-heading font-semibold tracking-wider text-sm hover:bg-classified-light active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #9d7c2e 100%)' }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ACCESS DESK'}
          </button>
        </form>

        <div className="flex items-center justify-center gap-4 mt-6">
          <button className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
            Create account
          </button>
          <div className="w-px h-3 bg-slate-800" />
          <button className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
            Forgot password
          </button>
        </div>
      </motion.div>
    </div>
  );
};
