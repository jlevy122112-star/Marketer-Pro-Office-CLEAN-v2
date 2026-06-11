import { motion } from 'framer-motion';

export function LoadingScreen() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#060912', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(201,168,76,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.34,1.56,0.64,1] }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <div style={{ position: 'relative' }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg,#C9A84C,#9d7c2e)', boxShadow: '0 0 60px rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 30, color: '#060912' }}>M</span>
          </div>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
            style={{ position: 'absolute', inset: -8, borderRadius: 28, border: '2px solid transparent', borderTopColor: 'rgba(201,168,76,0.6)', borderRightColor: 'rgba(201,168,76,0.15)' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: '0.2em', textTransform: 'uppercase', background: 'linear-gradient(135deg,#C9A84C,#E8C54E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Marketer-Pro</p>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>Your Digital Office</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[0,1,2,3].map((i) => (
            <motion.div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9A84C' }}
              animate={{ opacity: [0.2,1,0.2], scale: [0.8,1.2,0.8] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.18 }} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
