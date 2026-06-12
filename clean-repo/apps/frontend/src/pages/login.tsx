'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/modules/auth/useAuth';
import { useToast } from '@/components/common/Toast';
import {
  FloatingInput,
  FieldError,
  KeyboardAwareForm,
  PasskeyButton,
  EmailIndicator,
  haptic,
} from '@/components/common/UpgradedComponents';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();
  const { error: toastError }        = useToast();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState<{ email?: string; password?: string }>({});

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await haptic('medium');
    setLoading(true);
    const { error } = await signIn(email, password);
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
    await haptic('light');
    router.replace('/office');
  }

  async function handleAppleSignIn() {
    // Sign in with Apple — required by Apple Guideline 4.8
    // Connect via Supabase Apple OAuth provider in your Supabase dashboard
    const { error } = await signInWithGoogle(); // swap with signInWithApple when configured
    if (error) toastError('Apple sign-in failed', error);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#060912', overflowY: 'auto' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(201,168,76,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.04) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 70% 50% at 50% 20%, rgba(201,168,76,0.08) 0%, transparent 65%)' }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', padding: '48px 20px 32px' }}>

        <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.34,1.56,0.64,1] }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg,#C9A84C,#9d7c2e)', boxShadow: '0 0 60px rgba(201,168,76,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 32, color: '#060912' }}>M</span>
          </div>
          <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: '0.2em', textTransform: 'uppercase', background: 'linear-gradient(135deg,#C9A84C,#E8C54E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Marketer-Pro
          </p>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
            Your Digital Office
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          style={{ width: '100%', maxWidth: 380, background: 'rgba(13,17,32,0.92)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 24, padding: 24, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>

          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fff', marginBottom: 24 }}>
            Access Desk
          </h2>

          <KeyboardAwareForm onSubmit={handleSubmit} style={{ gap: 4 }}>
            <div>
              <FloatingInput
                id="login-email"
                label="Email"
                type="email"
                value={email}
                onChange={(v) => { setEmail(v); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }}
                autoComplete="email"
                required
                error={errors.email}
                rightElement={<EmailIndicator email={email} />}
              />
              <FieldError message={errors.email} id="login-email-error" />
            </div>

            <div style={{ marginTop: 8 }}>
              <FloatingInput
                id="login-password"
                label="Password"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(v) => { setPassword(v); if (errors.password) setErrors((p) => ({ ...p, password: undefined })); }}
                autoComplete="current-password"
                required
                error={errors.password}
                rightElement={
                  <button type="button"
                    onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                    style={{ color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
              <FieldError message={errors.password} id="login-password-error" />
            </div>

            <Link href="/forgot-password"
              style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: 'rgba(201,168,76,0.6)', textDecoration: 'none', textAlign: 'right', display: 'block', marginTop: 4, marginBottom: 8 }}>
              Forgot password?
            </Link>

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              aria-label="Sign in to your account"
              aria-busy={loading}
              style={{ width: '100%', padding: '15px 0', borderRadius: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? 'rgba(201,168,76,0.25)' : 'linear-gradient(135deg,#C9A84C,#9d7c2e)', color: '#060912', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '0.25em', textTransform: 'uppercase', boxShadow: loading ? 'none' : '0 0 30px rgba(201,168,76,0.22)', marginTop: 4 }}>
              {loading ? 'Accessing…' : '⬡ Access Desk'}
            </motion.button>
          </KeyboardAwareForm>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 14px' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Sign in with Apple — REQUIRED by Apple Guideline 4.8 */}
          <button
            data-testid="apple-signin"
            onClick={handleAppleSignIn}
            aria-label="Sign in with Apple"
            style={{ width: '100%', padding: '13px 0', borderRadius: 14, background: '#000', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontFamily: "'Syne',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.15em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
            <svg width="16" height="16" viewBox="0 0 814 1000" fill="white" aria-hidden="true">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46.1 672.4 0 531 0 392.6c0-232.5 150.6-355.6 299-355.6 79.3 0 145.3 51.9 194.8 51.9 47.4 0 121.6-54.9 206-54.9zM549.5 46c-13.5 17.9-35.9 33.8-54.4 33.8-1.3 0-2.6-.2-3.9-.4-4-21.3 11.4-44.2 24.4-58.8 14.1-16 38.4-29.4 59.1-30.8 3.2 22.5-10.3 44.9-25.2 56.2z"/>
            </svg>
            Continue with Apple
          </button>

          {/* Google OAuth */}
          <button
            onClick={() => signInWithGoogle()}
            aria-label="Continue with Google"
            style={{ width: '100%', padding: '13px 0', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontFamily: "'Syne',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.15em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Passkey — renders only when WebAuthn available on device */}
          <PasskeyButton onClick={async () => {
            try {
              await navigator.credentials.get({
                publicKey: {
                  challenge: crypto.getRandomValues(new Uint8Array(32)),
                  rpId: window.location.hostname,
                  userVerification: 'preferred',
                  timeout: 60000,
                },
              });
              router.replace('/office');
            } catch {
              toastError('Passkey sign-in failed', 'Use email/password instead');
            }
          }} />

          <p style={{ textAlign: 'center', fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 20 }}>
            No account?{' '}
            <Link href="/signup" style={{ color: '#C9A84C', textDecoration: 'none', fontWeight: 600 }}>
              Create one free
            </Link>
          </p>
        </motion.div>

        <div style={{ display: 'flex', gap: 24, marginTop: 24 }} aria-hidden="true">
          {['SOC 2 Ready', 'AES-256', 'GDPR'].map((b) => (
            <p key={b} style={{ fontFamily: "'Syne',sans-serif", fontSize: 8, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)' }}>
              ◆ {b}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
    }          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 30, color: '#060912' }}>M</span>
        </div>
        <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: '0.2em', textTransform: 'uppercase', background: 'linear-gradient(135deg,#C9A84C,#E8C54E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Marketer-Pro</p>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>Your Digital Office</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 380, background: 'rgba(13,17,32,0.9)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 24, padding: 24, backdropFilter: 'blur(20px)' }}>

        <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 17, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fff', marginBottom: 22 }}>Access Desk</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.7)', marginBottom: 8 }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required style={inputStyle} onFocus={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.5)'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.7)', marginBottom: 8 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={{ ...inputStyle, paddingRight: 48 }} onFocus={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.5)'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <Link href="/forgot-password" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: 'rgba(201,168,76,0.6)', textDecoration: 'none', textAlign: 'right', marginTop: -6 }}>Forgot password?</Link>
          <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            style={{ width: '100%', padding: '14px 0', borderRadius: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? 'rgba(201,168,76,0.25)' : 'linear-gradient(135deg,#C9A84C,#9d7c2e)', color: '#060912', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '0.25em', textTransform: 'uppercase', boxShadow: loading ? 'none' : '0 0 30px rgba(201,168,76,0.22)', marginTop: 4 }}>
            {loading ? 'Accessing…' : '⬡ Access Desk'}
          </motion.button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
        </div>

        <button onClick={() => signInWithGoogle()} style={{ width: '100%', padding: '13px 0', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontFamily: "'Syne',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.15em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>

        <p style={{ textAlign: 'center', fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 18 }}>
          No account?{' '}<Link href="/signup" style={{ color: '#C9A84C', textDecoration: 'none', fontWeight: 600 }}>Create one free</Link>
        </p>
      </motion.div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 20, marginTop: 24 }}>
        {['SOC 2 Ready','AES-256','GDPR'].map((b) => (
          <p key={b} style={{ fontFamily: "'Syne',sans-serif", fontSize: 8, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)' }}>◆ {b}</p>
        ))}
      </div>
    </div>
  );
}
