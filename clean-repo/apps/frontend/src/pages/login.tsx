'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/modules/auth/useAuth';
import { useToast } from '@/components/common/Toast';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();
  const { error: toastError } = useToast();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) { toastError('Sign in failed', error); return; }
    router.replace('/office');
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#060912', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 20px 24px' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(201,168,76,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.04) 1px,transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 70% 50% at 50% 20%, rgba(201,168,76,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
        <div style={{ width: 68, height: 68, borderRadius: 19, background: 'linear-gradient(135deg,#C9A84C,#9d7c2e)', boxShadow: '0 0 60px rgba(201,168,76,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 30, color: '#060912' }}>M</span>
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
