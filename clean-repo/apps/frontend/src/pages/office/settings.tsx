'use client';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, CreditCard, Share2, Bell,
  LogOut, ChevronRight, ExternalLink, Check, X,
} from 'lucide-react';
import { useAuth } from '@/modules/auth/useAuth';
import { useBilling } from '@/modules/api/useBilling';
import { useToast } from '@/components/common/Toast';
import { api } from '@/lib/api';
import { ACTIVE_PLATFORMS, SUPPORT } from '@/lib/constants';

type Tab = 'account' | 'billing' | 'platforms' | 'notifications';

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: 'account',       label: 'Account',   Icon: User },
  { id: 'billing',       label: 'Billing',   Icon: CreditCard },
  { id: 'platforms',     label: 'Platforms', Icon: Share2 },
  { id: 'notifications', label: 'Alerts',    Icon: Bell },
];

interface NotifPrefs {
  postPublished: boolean;
  postFailed:    boolean;
  weeklyReport:  boolean;
  aiInsights:    boolean;
  billingAlerts: boolean;
  newFeatures:   boolean;
}

export default function SettingsPage() {
  const { user, signOut, refreshUser } = useAuth();
  const { subscription, openPortal }   = useBilling();
  const { success, error: toastError } = useToast();
  const router = useRouter();

  const [tab, setTab]                   = useState<Tab>('account');
  const [editingName, setEditingName]   = useState(false);
  const [nameValue, setNameValue]       = useState('');
  const [savingName, setSavingName]     = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const [exporting, setExporting]       = useState(false);
  const [notifs, setNotifs]             = useState<NotifPrefs>({
    postPublished: true,
    postFailed:    true,
    weeklyReport:  true,
    aiInsights:    true,
    billingAlerts: true,
    newFeatures:   false,
  });

  // Load notification preferences from backend on mount
  useEffect(() => {
    api.get<NotifPrefs>('/notifications/preferences')
      .then((data) => {
        if (data) setNotifs(data);
      })
      .catch(() => { /* use defaults */ });
  }, []);

  // ── Save display name ─────────────────────────────────────────────────────
  const handleNameSave = useCallback(async () => {
    if (!nameValue.trim() || nameValue === user?.displayName) {
      setEditingName(false);
      return;
    }
    setSavingName(true);
    try {
      await api.patch('/me', { displayName: nameValue.trim() });
      await refreshUser();
      setEditingName(false);
      success('Name updated');
    } catch (e) {
      toastError('Failed to update name', e instanceof Error ? e.message : undefined);
    } finally {
      setSavingName(false);
    }
  }, [nameValue, user?.displayName, refreshUser, success, toastError]);

  // ── Connect platform via OAuth ────────────────────────────────────────────
  const connectPlatform = useCallback(async (platformId: string) => {
    try {
      const data = await api.post<{ authUrl: string }>(`/integrations/${platformId}/connect`);
      window.location.href = data.authUrl;
    } catch (e) {
      toastError('Connection failed', e instanceof Error ? e.message : 'Try again');
    }
  }, [toastError]);

  // ── Persist notification preference to backend ────────────────────────────
  const saveNotifPref = useCallback(async (key: keyof NotifPrefs, value: boolean) => {
    setNotifs((p) => ({ ...p, [key]: value }));
    try {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      await api.patch('/notifications/preferences', { [snakeKey]: value });
    } catch {
      setNotifs((p) => ({ ...p, [key]: !value }));
      toastError('Failed to save preference');
    }
  }, [toastError]);

  // ── In-app account deletion — Apple 5.1.1(v) / Google Play Data Safety ───
  const handleDeleteAccount = useCallback(async () => {
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    setDeleting(true);
    try {
      await api.delete('/me');
      await signOut();
      router.replace('/login');
    } catch (e) {
      toastError('Deletion failed', e instanceof Error ? e.message : 'Contact support');
      setDeleting(false);
      setDeleteConfirm(false);
    }
  }, [deleteConfirm, signOut, router, toastError]);

  // ── Data export — GDPR Article 20 ─────────────────────────────────────────
  const handleDataExport = useCallback(async () => {
    setExporting(true);
    try {
      await api.post('/me/export');
      success('Export requested', 'You will receive an email with your data within 24 hours');
    } catch (e) {
      toastError('Export failed', e instanceof Error ? e.message : 'Try again');
    } finally {
      setExporting(false);
    }
  }, [success, toastError]);

  function Row({
    label, value, onPress, danger = false,
  }: { label: string; value?: string; onPress?: () => void; danger?: boolean }) {
    return (
      <button
        onClick={onPress}
        disabled={!onPress}
        aria-label={label}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '14px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', cursor: onPress ? 'pointer' : 'default', marginBottom: 8 }}>
        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: danger ? '#F87171' : 'rgba(255,255,255,0.8)' }}>
          {label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {value && <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{value}</span>}
          {onPress && <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.2)' }} />}
        </div>
      </button>
    );
  }

  function SectionHead({ title }: { title: string }) {
    return (
      <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.5)', marginBottom: 10, marginTop: 20 }}>
        {title}
      </p>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#060912', display: 'flex', flexDirection: 'column', paddingTop: 'var(--sat,0px)' }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80, WebkitOverflowScrolling: 'touch' }}>

        <div style={{ padding: '16px 20px 10px' }}>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, background: 'linear-gradient(135deg,#C9A84C,#E8C54E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Settings
          </h1>
        </div>

        {/* Tab bar */}
        <div role="tablist" style={{ display: 'flex', gap: 6, padding: '0 20px', marginBottom: 20, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, fontFamily: "'Syne',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', background: tab === id ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${tab === id ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.08)'}`, color: tab === id ? '#C9A84C' : 'rgba(255,255,255,0.4)', flexShrink: 0, transition: 'all 0.2s' }}>
              <Icon size={11} />{label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} role="tabpanel" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ padding: '0 20px' }}>

            {/* ── ACCOUNT ── */}
            {tab === 'account' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 18, background: 'rgba(13,17,32,0.85)', border: '1px solid rgba(201,168,76,0.18)', marginBottom: 4 }}>
                  <div style={{ width: 54, height: 54, borderRadius: 15, background: 'linear-gradient(135deg,#C9A84C,#9d7c2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    aria-hidden="true">
                    <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: '#060912' }}>
                      {user?.displayName?.charAt(0)?.toUpperCase() ?? 'U'}
                    </span>
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, color: '#fff' }}>
                      {user?.displayName}
                    </p>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                      {user?.email}
                    </p>
                    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                      <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 5, background: 'rgba(201,168,76,0.12)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.22)' }}>
                        Level {user?.level ?? 1}
                      </span>
                      <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 5, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>
                        {user?.xp ?? 0} XP
                      </span>
                    </div>
                  </div>
                </div>

                <SectionHead title="Profile" />

                {/* Display name inline edit — fully functional */}
                {editingName ? (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      autoFocus
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleNameSave(); if (e.key === 'Escape') setEditingName(false); }}
                      aria-label="Display name"
                      style={{ flex: 1, padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.4)', color: '#fff', fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                    />
                    <button onClick={handleNameSave} disabled={savingName}
                      data-testid="save-name"
                      aria-label="Save display name"
                      style={{ padding: '12px 16px', borderRadius: 12, background: 'linear-gradient(135deg,#C9A84C,#9d7c2e)', border: 'none', color: '#060912', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: savingName ? 'not-allowed' : 'pointer', opacity: savingName ? 0.6 : 1 }}>
                      {savingName ? '…' : <Check size={14} />}
                    </button>
                    <button onClick={() => { setEditingName(false); setNameValue(user?.displayName ?? ''); }}
                      aria-label="Cancel name edit"
                      style={{ padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <Row label="Display Name" value={user?.displayName} onPress={() => { setEditingName(true); setNameValue(user?.displayName ?? ''); }} />
                )}

                <Row label="Email Address" value={user?.email} onPress={() => {}} />
                <Row label="Change Password" onPress={() => router.push('/forgot-password')} />

                <SectionHead title="Data & Privacy" />

                {/* Data export — GDPR Article 20 */}
                <button onClick={handleDataExport} disabled={exporting}
                  data-testid="export-data-btn"
                  aria-label="Export my data"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '14px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', cursor: exporting ? 'not-allowed' : 'pointer', marginBottom: 8, opacity: exporting ? 0.6 : 1 }}>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                    {exporting ? 'Requesting export…' : 'Export My Data'}
                  </span>
                  <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.2)' }} />
                </button>

                <Row label="Privacy Policy" onPress={() => window.open(SUPPORT.privacy)} />
                <Row label="Terms of Service" onPress={() => window.open(SUPPORT.terms)} />

                <SectionHead title="Danger Zone" />

                {/* In-app account deletion — Apple 5.1.1(v) */}
                {deleteConfirm ? (
                  <div style={{ padding: 16, borderRadius: 16, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', marginBottom: 8 }}>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 12, lineHeight: 1.6 }}>
                      This will permanently delete your account and all data. This cannot be undone.
                    </p>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => setDeleteConfirm(false)}
                        style={{ flex: 1, padding: '12px 0', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>
                        Cancel
                      </button>
                      <button onClick={handleDeleteAccount} disabled={deleting}
                        data-testid="delete-account-btn"
                        aria-label="Permanently delete account"
                        style={{ flex: 2, padding: '12px 0', borderRadius: 12, background: '#F87171', border: 'none', color: '#fff', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.6 : 1 }}>
                        {deleting ? 'Deleting…' : 'Confirm Delete'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={handleDeleteAccount}
                    data-testid="delete-account-btn"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '14px 16px', borderRadius: 14, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.18)', cursor: 'pointer', marginBottom: 8 }}>
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: '#F87171' }}>Delete Account</span>
                    <ChevronRight size={14} style={{ color: 'rgba(248,113,113,0.4)' }} />
                  </button>
                )}

                <SectionHead title="Session" />
                <button onClick={async () => { await signOut(); router.replace('/login'); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '14px 16px', borderRadius: 14, background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer' }}>
                  <LogOut size={16} style={{ color: '#F87171' }} />
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: '#F87171' }}>Sign Out</span>
                </button>
              </>
            )}

            {/* ── BILLING ── */}
            {tab === 'billing' && (
              <>
                <div style={{ padding: 16, borderRadius: 18, background: 'rgba(13,17,32,0.85)', border: '1px solid rgba(201,168,76,0.18)', marginBottom: 4 }}>
                  <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.55)', marginBottom: 6 }}>
                    Current Plan
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: '#fff', textTransform: 'capitalize' }}>
                      {subscription?.planId ?? 'Free'}
                    </p>
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
                <SectionHead title="Support" />
                <Row label="Contact Support" onPress={() => window.open(`mailto:${SUPPORT.email}`)} />
                <Row label="Help Center"      onPress={() => window.open(SUPPORT.help)} />
              </>
            )}

            {/* ── PLATFORMS ── */}
            {tab === 'platforms' && (
              <>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 16 }}>
                  Connect your social accounts to enable scheduling and analytics.
                </p>
                {ACTIVE_PLATFORMS.map((p) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 8 }}>
                                </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
