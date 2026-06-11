'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Crown, Building2, Zap } from 'lucide-react';
import { PLANS } from '@/lib/constants';
import { useBilling } from '@/modules/api/useBilling';

interface Props { open: boolean; onClose: () => void; feature?: string; requiredPlan?: string; }

export function PaywallModal({ open, onClose, feature, requiredPlan = 'pro' }: Props) {
  const { startCheckout, upgrading } = useBilling();
  const [interval, setInterval]     = useState<'monthly' | 'annual'>('annual');
  const Icons = { free: Zap, pro: Crown, enterprise: Building2 };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)' }} />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            style={{ position: 'fixed', inset: '0 0 0 0', top: 'auto', zIndex: 201, borderRadius: '24px 24px 0 0', background: '#0D1120', border: '1px solid rgba(201,168,76,0.2)', maxHeight: '90dvh', overflowY: 'auto', paddingBottom: 'env(safe-area-inset-bottom,16px)' }}>
            <div style={{ height: 3, background: 'linear-gradient(90deg,#9d7c2e,#C9A84C,#E8C54E,#C9A84C,#9d7c2e)' }} />
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'linear-gradient(135deg,#C9A84C,#E8C54E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Unlock Full Access</h2>
                  {feature && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}><span style={{ color: '#C9A84C' }}>{feature}</span> requires a paid plan</p>}
                </div>
                <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <div style={{ display: 'flex', gap: 2, padding: 3, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 20 }}>
                {(['monthly','annual'] as const).map((iv) => (
                  <button key={iv} onClick={() => setInterval(iv)} style={{ flex: 1, padding: '8px 0', borderRadius: 9, fontFamily: "'Syne',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', background: interval === iv ? 'rgba(201,168,76,0.15)' : 'transparent', color: interval === iv ? '#C9A84C' : 'rgba(255,255,255,0.4)', border: 'none' }}>
                    {iv === 'annual' ? 'Annual · Save 35%' : 'Monthly'}
                  </button>
                ))}
              </div>

              {PLANS.filter((p) => p.id !== 'free').map((plan) => {
                const Icon = Icons[plan.id as keyof typeof Icons] ?? Zap;
                const price = interval === 'annual' ? plan.annualPrice : plan.monthlyPrice;
                const highlight = plan.id === requiredPlan;
                return (
                  <div key={plan.id} style={{ marginBottom: 12, padding: 16, borderRadius: 18, background: highlight ? 'rgba(201,168,76,0.06)' : 'rgba(255,255,255,0.03)', border: `1px solid ${highlight ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.08)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon size={16} style={{ color: highlight ? '#C9A84C' : 'rgba(255,255,255,0.5)' }} />
                        <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: '#fff' }}>{plan.name}</span>
                        {plan.badge && <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '2px 6px', borderRadius: 4, background: 'rgba(201,168,76,0.12)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.22)' }}>{plan.badge}</span>}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: '#fff' }}>${price}</span>
                        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>/mo</span>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px', marginBottom: 14 }}>
                      {plan.features.slice(0,6).map((f) => (
                        <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                          <Check size={10} style={{ color: highlight ? '#C9A84C' : '#6EE7B7', flexShrink: 0, marginTop: 3 }} />
                          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 1.4 }}>{f}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => startCheckout(plan.id, interval)} disabled={upgrading}
                      style={{ width: '100%', padding: '13px 0', borderRadius: 12, border: 'none', cursor: upgrading ? 'not-allowed' : 'pointer', background: highlight ? 'linear-gradient(135deg,#C9A84C,#9d7c2e)' : 'rgba(255,255,255,0.06)', color: highlight ? '#060912' : 'rgba(255,255,255,0.7)', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: upgrading ? 0.6 : 1 }}>
                      {upgrading ? 'Loading…' : `Get ${plan.name}`}
                    </button>
                  </div>
                );
              })}
              <p style={{ textAlign: 'center', fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>
                Cancel anytime · Secure via Stripe
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
