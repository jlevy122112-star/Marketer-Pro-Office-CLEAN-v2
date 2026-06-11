'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, CreditCard, Share2, Bell, LogOut, ChevronRight, ExternalLink } from 'lucide-react';
import { useAuth } from '@/modules/auth/useAuth';
import { useBilling } from '@/modules/api/useBilling';
import { ACTIVE_PLATFORMS, SUPPORT } from '@/lib/constants';

type Tab = 'account' | 'billing' | 'platforms' | 'notifications';
const TABS: { id: Tab; label: string; Icon: any }[] = [
  { id: 'account',       label: 'Account',    Icon: User },
  { id: 'billing',       label: 'Billing',    Icon: CreditCard },
  { id: 'platforms',     label: 'Platforms',  Icon: Share2 },
  { id: 'notifications', label: 'Alerts',     Icon: Bell },
];

function Row({ label, value, onPress, danger = false }: { label: string; value?: string; onPress?: () => void; danger?: boolean }) {
  return (
    <button onClick={onPress} disabled={!onPress}
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '14px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', cursor: onPress ? 'pointer' : 'default', marginBottom: 8 }}>
      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: danger ? '#F87171' : 'rgba(255,255,255,0.8)' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {value && <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{value}</span>}
        {onPress && <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.2)' }} />}
      </div>
    </button>
  );
}

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { subscription, openPortal } = useBilling();
  const router = useRouter();
  const [tab, setTab]     = useState<Tab>('account');
  const [notifs, setNotifs] = useState({ postPublished: true, weeklyReport: true, aiInsights: true, billingAlerts: true, newFeatures: false });

  return (
    <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 80 }}>
      <div style={{ padding: '16px 20px 10px' }}>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, background: 'linear-gradient(135deg,#C9A84C,#E8C54E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Settings</h1>
      </div>

      <div style={{ display: 'flex', gap: 6, padding: '0 20px', marginBottom: 20, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, fontFamily: "'Syne',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', background: tab === id ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${tab === id ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.08)'}`, color: tab === id ? '#C9A84C' : 'rgba(255,255,255,0.4)', flexShrink: 0, transition: 'all 0.2s' }}>
            <Icon size={11} />{label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} style={{ padding: '0 20px' }}>

          {tab === 'account' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 18, background: 'rgba(13,17,32,0.85)', border: '1px solid rgba(201,168,76,0.18)', marginBottom: 16 }}>
                <div style={{ width: 54, height: 54, borderRadius: 15, background: 'linear-gradient(135deg,#C9A84C,#9d7c2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: '#060912' }}>{user?.displayName?.charAt(0)?.toUpperCase() ?? 'U'}</span>
                </div>
                <div>
                  <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, color: '#fff' }}>{user?.displayName ?? 'User'}</p>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{user?.email}</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 5, background: 'rgba(201,168,76,0.12)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.22)' }}>Level {user?.level ?? 1}</span>
                    <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 5, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>{user?.xp ?? 0} XP</span>
                  </div>
                </div>
              </div>
              <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.5)', marginBottom: 10 }}>Profile</p>
              <Row label="Display Name" value={user?.displayName} onPress={() => {}} />
              <Row label="Email" value={user?.email} onPress={() => {}} />
              <Row label="Change Password" onPress={() => {}} />
              <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.5)', marginBottom: 10, marginTop: 20 }}>Legal</p>
              <Row label="Privacy Policy" onPress={() => window.open(SUPPORT.privacy)} />
              <Row label="Terms of Service" onPress={() => window.open(SUPPORT.terms)} />
              <Row label="Delete Account" onPress={() => window.open(SUPPORT.deleteAccount)} danger />
              <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.5)', marginBottom: 10, marginTop: 20 }}>Session</p>
              <button onClick={async () => { await signOut(); router.replace('/login'); }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '14px 16px', borderRadius: 14, background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer' }}>
                <LogOut size={16} style={{ color: '#F87171' }} />
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: '#F87171' }}>Sign Out</span>
              </button>
            </>
          )}

          {tab === 'billing' && (
            <>
              <div style={{ padding: 16, borderRadius: 18, background: 'rgba(13,17,32,0.85)', border: '1px solid rgba(201,168,76,0.18)', marginBottom: 16 }}>
                <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.55)', marginBottom: 6 }}>Current Plan</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: '#fff', textTransform: 'capitalize' }}>{subscription?.planId ?? 'Free'}</p>
                  <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 6, background: subscription?.status === 'active' ? 'rgba(52,211,153,0.12)' : 'rgba(201,168,76,0.12)', color: subscription?.status === 'active' ? '#34D399' : '#C9A84C', border: `1px solid ${subscription?.status === 'active' ? 'rgba(52,211,153,0.25)' : 'rgba(201,168,76,0.25)'}` }}>
                    {subscription?.status ?? 'Free'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => router.push('/office/billing')}
                    style={{ flex: 1, padding: '12px 0', borderRadius: 12, background: 'linear-gradient(135deg,#C9A84C,#9d7c2e)', border: 'none', color: '#060912', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer' }}>
                    Upgrade
                  </button>
                  {subscription && (
                    <button onClick={openPortal}
                      style={{ flex: 1, padding: '12px 0', borderRadius: 12, background: 'transparent', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <ExternalLink size={12} /> Manage
                    </button>
                  )}
                </div>
              </div>
              <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.5)', marginBottom: 10 }}>Support</p>
              <Row label="Contact Support" onPress={() => window.open(`mailto:${SUPPORT.email}`)} />
              <Row label="Help Center" onPress={() => window.open(SUPPORT.help)} />
            </>
          )}

          {tab === 'platforms' && (
            <>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 16 }}>Connect your accounts to enable scheduling and analytics.</p>
              {ACTIVE_PLATFORMS.map((p) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: '#fff' }}>{p.name}</p>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.28)', marginTop: 2 }}>Not connected</p>
                  </div>
                  <button style={{ padding: '7px 14px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer' }}>Connect</button>
                </div>
              ))}
            </>
          )}

          {tab === 'notifications' && (
            <>
              {[
                { key: 'postPublished', label: 'Post Published',  desc: 'When a scheduled post goes live' },
                { key: 'weeklyReport',  label: 'Weekly Report',   desc: 'Analytics summary every Monday' },
                { key: 'aiInsights',    label: 'AI Insights',     desc: 'Optimization recommendations' },
                { key: 'billingAlerts', label: 'Billing Alerts',  desc: 'Payment and renewal reminders' },
                { key: 'newFeatures',   label: 'New Features',    desc: 'Product updates and releases' },
              ].map(({ key, label, desc }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: '#fff' }}>{label}</p>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{desc}</p>
                  </div>
                  <button onClick={() => setNotifs((p) => ({ ...p, [key]: !p[key as keyof typeof notifs] }))}
                    style={{ width: 48, height: 26, borderRadius: 13, background: notifs[key as keyof typeof notifs] ? 'linear-gradient(90deg,#C9A84C,#9d7c2e)' : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.3s', flexShrink: 0 }}>
                    <motion.div animate={{ x: notifs[key as keyof typeof notifs] ? 24 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      style={{ position: 'absolute', top: 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                  </button>
                </div>
              ))}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
