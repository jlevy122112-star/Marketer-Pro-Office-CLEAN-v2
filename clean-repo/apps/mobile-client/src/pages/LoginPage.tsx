'use client';

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN PAGE — UPGRADED
// Steps implemented:
//   1. Value proposition header (new + returning user variants)
//   2. Full-width secondary signup CTA below card
//   3. Forgot password link → /forgot-password (built below)
//   4. Contextual trust signal (new users only)
//   5. Persistent "Need help?" link always visible
//   6. Returning vs new user journey differentiation
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

import {
  Stack, Row, Heading, Text, Button, Input, Divider,
} from '@marketer-pro/ui';
import {
  colors, fonts, fontSizes, fontWeights,
  letterSpacings, radii, space, gradients,
} from '@marketer-pro/ui';

import { useAuth }  from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { haptic }   from '@marketer-pro/cinematic-engine';
import { SUPPORT }  from '../lib/constants';

// ─────────────────────────────────────────────────────────────────────────────
// RETURNING USER DETECTION
// Checks Capacitor Preferences / localStorage for a previously
// stored display name. If present → the user has logged in before.
// ─────────────────────────────────────────────────────────────────────────────
async function getReturningUserName(): Promise<string | null> {
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
