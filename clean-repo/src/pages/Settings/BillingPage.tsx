// FILE PATH: src/pages/Settings/BillingPage.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, Crown, Building2, ArrowLeft, Star } from 'lucide-react';
import { PLANS, SUPPORT } from '../../lib/constants';
import { useBilling } from '../../hooks/useBilling';
import type { PlanId } from '../../lib/constants';

const PLAN_ICONS: Record<string, React.ElementType> = {
  free: Zap, pro: Crown, enterprise: Building2,
};

const TESTIMONIALS = [
  { quote: 'Saves me 5 hours a week. Paid for itself in week one.',  author: 'Sarah K.',    role: 'E-commerce founder' },
  { quote: 'My engagement doubled in 30 days after switching.',     author: 'Marcus T.',   role: 'Marketing Manager' },
  { quote: 'The cinematic generation experience is unlike anything.', author: 'Priya R.',   role: 'Content Creator' },
];

const FAQ = [
  { q: 'What payment methods do you accept?', a: 'All major credit and debit cards via Stripe (Visa, Mastercard, Amex, Discover). Apple Pay and Google Pay available on supported devices.' },
  { q: 'Can I cancel anytime?',               a: 'Yes. Cancel from your account settings or by contacting support. Your access continues until the end of the current billing period.' },
  { q: 'Is there a free trial?',              a: 'Yes — Pro includes a 7-day free trial. No charge until the trial ends. Cancel anytime before.' },
  { q: 'What happens when I hit the free plan limit?', a: 'You\'ll see a paywall after 25 generations. Your saved content is never deleted. Upgrade to continue generating.' },
];

export default function BillingPage() {
  const navigate = useNavigate();
  const { subscription, startCheckout, upgrading } = useBilling();
  const [interval, setInterval] = useState<'monthly' | 'annual'>('annual');
  const [openFaq, setOpenFaq]   = useState<number | null>(null);

  const currentPlanId = subscription?.planId ?? 'free';

  async function handleUpgrade(planId: PlanId) {
    if (planId === 'enterprise') {
      window.location.href = `mailto:${SUPPORT.email}?subject=Enterprise%20Inquiry`;
      return;
    }
    await startCheckout(planId, interval);
  }

  return (
    <div className="page-root">
      <div className="page-content">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-4 pb-3">
          <button onClick={() => navigate(-1)} className="text-white/40 hover:text-white/70 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-display font-bold text-lg heading-classified">Choose Your Plan</h1>
        </div>

        <div className="px-5 flex flex-col gap-6 pb-10">
          {/* Tagline */}
          <p className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Upgrade to unlock unlimited AI generation, advanced analytics, and the full Digital Office.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center gap-2 p-1 rounded-xl self-start"
               style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {(['monthly', 'annual'] as const).map((iv) => (
              <button key={iv} onClick={() => setInterval(iv)}
                      className="px-4 py-2 rounded-lg font-display text-xs font-semibold tracking-widest uppercase transition-all"
                      style={{
                        background: interval === iv ? 'rgba(201,168,76,0.2)' : 'transparent',
                        color: interval === iv ? '#C9A84C' : 'rgba(255,255,255,0.4)',
                      }}>
                {iv === 'annual' ? 'Annual · Save 35%' : 'Monthly'}
              </button>
            ))}
          </div>

          {/* Plan cards */}
          {PLANS.map((plan, i) => {
            const Icon     = PLAN_ICONS[plan.id] ?? Zap;
            const isCurrent = plan.id === currentPlanId;
            const isPro    = plan.id === 'pro';
            const isEnt    = plan.id === 'enterprise';
            const price    = interval === 'annual' ? plan.annualPrice : plan.monthlyPrice;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{
                  borderRadius: 20,
                  background: isPro ? 'linear-gradient(135deg, rgba(201,168,76,0.1), rgba(13,17,32,0.95))' : 'rgba(15,22,41,0.8)',
                  border: `1px solid ${isPro ? 'rgba(201,168,76,0.4)' : isEnt ? 'rgba(110,231,183,0.3)' : 'rgba(255,255,255,0.1)'}`,
                  boxShadow: isPro ? '0 0 30px rgba(201,168,76,0.1)' : 'none',
                  padding: 20,
                }}
              >
                {plan.badge && (
                  <div className="mb-3">
                    <span className="badge-classified">{plan.badge}</span>
                  </div>
                )}
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Icon size={18} style={{ color: isPro ? '#C9A84C' : isEnt ? '#6EE7B7' : 'rgba(255,255,255,0.4)' }} />
                    <p className="font-display font-bold text-xl text-white">{plan.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-2xl" style={{ color: isPro ? '#C9A84C' : '#fff' }}>
                      {price === 0 ? 'Free' : `$${price}`}
                    </p>
                    {price > 0 && (
                      <p className="font-body text-2xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        /mo{interval === 'annual' ? ' billed annually' : ''}
                      </p>
                    )}
                  </div>
                </div>

                <p className="font-body text-sm mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{plan.tagline}</p>

                {/* ROI framing for Pro */}
                {isPro && (
                  <div className="mb-3 px-3 py-2 rounded-xl"
                       style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
                    <p className="font-body text-xs" style={{ color: 'rgba(201,168,76,0.8)' }}>
                      💡 Pays for itself with 2 hours saved per week. Avg freelancer: $150/mo vs Pro at $19/mo.
                    </p>
                  </div>
                )}

                {/* Features */}
                <div className="flex flex-col gap-2 mb-4">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <Check size={13} style={{ color: isPro ? '#C9A84C' : isEnt ? '#6EE7B7' : 'rgba(255,255,255,0.4)' }} />
                      <span className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{f}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                {isCurrent ? (
                  <div className="py-3 text-center rounded-xl"
                       style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span className="font-display text-xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Current Plan
                    </span>
                  </div>
                ) : isEnt ? (
                  <button
                    onClick={() => handleUpgrade('enterprise')}
                    className="btn-reactor w-full py-3 justify-center"
                  >
                    Talk to Sales
                  </button>
                ) : isPro ? (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={upgrading}
                    className="btn-classified w-full py-3 justify-center disabled:opacity-50"
                  >
                    {upgrading ? 'Redirecting…' : 'Start 7-Day Free Trial'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    className="btn-void w-full py-3 justify-center"
                  >
                    Get Started
                  </button>
                )}

                {/* Trial notice for Pro */}
                {isPro && !isCurrent && (
                  <p className="text-center font-body text-2xs mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    No charge for 7 days · Cancel anytime
                  </p>
                )}
              </motion.div>
            );
          })}

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {['🔒 Secure checkout', 'Stripe certified', 'Cancel anytime', 'SOC 2 aligned'].map((b) => (
              <span key={b} className="font-body text-2xs" style={{ color: 'rgba(255,255,255,0.2)' }}>{b}</span>
            ))}
          </div>

          {/* Social proof — testimonials */}
          <div>
            <div className="flex items-center gap-2 mb-3 justify-center">
              {[1,2,3,4,5].map((i) => <Star key={i} size={14} fill="#C9A84C" style={{ color: '#C9A84C' }} />)}
              <span className="font-display text-xs tracking-wider uppercase" style={{ color: 'rgba(201,168,76,0.7)' }}>
                4.8/5 average
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {TESTIMONIALS.map(({ quote, author, role }) => (
                <div key={author} className="card-classified p-4">
                  <p className="font-body text-sm italic mb-3" style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                    "{quote}"
                  </p>
                  <div>
                    <p className="font-display font-semibold text-xs text-white">{author}</p>
                    <p className="font-body text-2xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="font-display font-semibold text-sm tracking-wider uppercase mb-3"
                style={{ color: 'rgba(255,255,255,0.5)' }}>Common Questions</h2>
            <div className="flex flex-col gap-2">
              {FAQ.map(({ q, a }, i) => (
                <div key={i} className="rounded-xl overflow-hidden"
                     style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex items-center justify-between w-full px-4 py-3.5 text-left"
                  >
                    <span className="font-body text-sm text-white pr-3">{q}</span>
                    <ChevronDownIcon open={openFaq === i} />
                  </button>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="px-4 pb-4">
                      <p className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{a}</p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"
         style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
