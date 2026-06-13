'use client';

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import { colors, fonts, fontSizes, fontWeights, letterSpacings, gradients } from '@marketer-pro/ui';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div style={{ position: 'fixed', inset: 0, background: colors.void[900], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: gradients.grid, backgroundSize: '32px 32px', pointerEvents: 'none' }} aria-hidden />
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{ textAlign: 'center', padding: '0 32px', position: 'relative', zIndex: 1 }}>
        <p style={{ fontFamily: fonts.display, fontWeight: fontWeights.extrabold, fontSize: '80px', background: gradients.goldSheen, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1 }}>
          404
        </p>
        <p style={{ fontFamily: fonts.display, fontWeight: fontWeights.bold, fontSize: fontSizes.xl, letterSpacing: letterSpacings.wider, textTransform: 'uppercase', color: '#fff', marginTop: 16 }}>
          Page Not Found
        </p>
        <p style={{ fontFamily: fonts.body, fontSize: fontSizes.base, color: colors.text.faint, marginTop: 8 }}>
          This area of the Vault does not exist.
        </p>
        <motion.button onClick={() => navigate('/desk')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          style={{ marginTop: 28, padding: '13px 28px', borderRadius: 14, background: gradients.gold, border: 'none', color: '#060912', fontFamily: fonts.display, fontWeight: fontWeights.bold, fontSize: fontSizes.xs, letterSpacing: letterSpacings.wider, textTransform: 'uppercase', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 0 30px rgba(201,168,76,0.25)' }}>
          <Home size={16} aria-hidden /> Return to Desk
        </motion.button>
      </motion.div>
    </div>
  );
}
