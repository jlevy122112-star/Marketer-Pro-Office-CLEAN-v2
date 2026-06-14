// FILE PATH: src/pages/Settings/SettingsPage.tsx
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, CreditCard, Share2, Bell, ChevronRight, LogOut, Trash2,
  ExternalLink, Check, X, AlertTriangle, ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useBilling } from '../../hooks/useBilling';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../lib/api';
import { ACTIVE_PLATFORMS, PLANS, SUPPORT } from '../../lib/constants';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

type Tab = 'account' | 'billing' | 'platforms' | 'notifications';

const TABS: { id: Tab; label: string; sub: string; icon: React.ElementType }[] = [
  { id: 'account',       label: 'Account',   sub: 'Profile & security',  icon: User },
  { id: 'billing',       label: 'Billing',   sub: 'Plans & payments',    icon: CreditCard },
  { id: 'platforms',     label: 'Platforms', sub: 'Connect accounts',    icon: Share2 },
  { id: 'notifications', label: 'Alerts',    sub: 'Notification prefs',  icon: Bell },
];

interface PlatformConnection {
  platform: string;
  connected: boolean;
  handle?: string;
  expired?: boolean;
}

function SettingsRow({ label, value, onPress, danger = false }: {
  label: string; value?: string; onPress?: () => void; danger?: boolean;
}) {
  return (
    <button onClick={onPress} disabled={!onPress}
            className="flex items-center justify-between w-full py-3.5 px-4 rounded-xl transition-all text-left"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <span className="font-body text-sm" style={{ color: danger ? '#EF4444' : 'rgba(255,255,255,0.8)' }}>{label}</span>
      <div className="flex items-center gap-2">
        {value && <span className="font-body text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{value}</span>}
        {onPress && <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.2)' }} />}
      </div>
    </button>
  );
}

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { subscription, openPortal } = useBilling();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab]     = useState<Tab>('account');
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue]     = useState('');
  const [savingName, setSavingName]   = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [exporting, setExporting]     = useState(false);
  const [showDataStored, setShowDataStored] = useState(false);
  const [platformConns, setPlatformConns] = useState<PlatformConnection[]>(
    ACTIVE_PLATFORMS.map((p) => ({ platform: p.id, connected: false }))
  );
  const [notifications, setNotifications] = useState({
    postPublished: true,
    postFailed:    true,
    weeklyReport:  true,
    aiInsights:    true,
    billingAlerts: true,
    newFeatures:   false,
  });

  const currentPlan = PLANS.find((p) => p.id === (subscription?.planId ?? 'free'));

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  const handleSaveName = useCallback(async () => {
    if (!nameValue.trim()) { setEditingName(false); return; }
    setSavingName(true);
    try {
      await api.patch('/me', { displayName: nameValue.trim() });
      success('Name updated');
      setEditingName(false);
    } catch (e) {
      toastError('Failed to update', e instanceof Error ? e.message : 'Try again');
    } finally { setSavingName(false); }
  }, [nameValue, success, toastError]);

  // In-app account deletion — Apple 5.1.1(v) / Google Play Data Safety
  const handleDeleteAccount = useCallback(async () => {
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    setDeleting(true);
    try {
      await api.delete('/me');
      await signOut();
      navigate('/login', { replace: true });
    } catch (e) {
      toastError('Deletion failed', e instanceof Error ? e.message : 'Contact support');
      setDeleting(false);
      setDeleteConfirm(false);
    }
  }, [deleteConfirm, signOut, navigate, toastError]);

  const handleDataExport = useCallback(async () => {
    setExporting(true);
    try {
      await api.post('/me/export');
      success('Export requested', 'You\'ll receive an email within 24 hours');
    } catch (e) {
      toastError('Export failed', e instanceof Error ? e.message : 'Try again');
    } finally { setExporting(false); }
  }, [success, toastError]);

  async function toggleNotif(key: keyof typeof notifications) {
    const next = { ...notifications, [key]: !notifications[key] };
    setNotifications(next);
    await api.patch('/notifications/preferences', { [key]: next[key] }).catch(() => {
      setNotifications(notifications); // revert on failure
    });
  }

  // Three-state platform connect
  function getPlatformState(id: string) {
    const conn = platformConns.find((c) => c.platform === id);
    if (!conn) return 'never';
    if (conn.connected && !conn.expired) return 'connected';
    if (conn.expired) return 'expired';
    return 'never';
  }

  async function connectPlatform(id: string) {
    try {
      const { authUrl } = await api.post<{ authUrl: string }>(`/integrations/${id}/connect`);
      window.location.href = authUrl;
    } catch (e) {
      toastError('Connection failed', e instanceof Error ? e.message : 'Try again');
    }
  }

  return (
    <div className="page-root">
      <div className="page-content">
        {/* Header */}
        <div className="px-5 pt-4 pb-3">
          <h1 className="font-display font-bold text-lg heading-classified">Settings</h1>
        </div>

        {/* Tab bar with subtitles */}
        <div className="flex gap-1 px-5 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(({ id, label, sub, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex flex-col items-center px-3 py-2 rounded-xl transition-all flex-shrink-0"
              style={{
                background: activeTab === id ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${activeTab === id ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.07)'}`,
                minWidth: 80,
              }}
            >
              <Icon size={14} style={{ color: activeTab === id ? '#C9A84C' : 'rgba(255,255,255,0.4)', marginBottom: 4 }} />
              <span className="font-display text-2xs font-semibold tracking-wider uppercase"
                    style={{ color: activeTab === id ? '#C9A84C' : 'rgba(255,255,255,0.5)' }}>{label}</span>
              <span className="font-body text-2xs mt-0.5" style={{ color: 'rgba(255,255,255,0.25)', fontSize: '9px' }}>{sub}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="px-5 flex flex-col gap-3">

            {/* ── ACCOUNT ── */}
            {activeTab === 'account' && (
              <>
                {/* Profile card */}
                <div className="card-classified p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                         style={{ background: 'linear-gradient(135deg, #C9A84C, #9d7c2e)' }}>
                      <span className="font-display font-bold text-xl" style={{ color: '#080B14' }}>
                        {user?.displayName?.charAt(0)?.toUpperCase() ?? 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-base text-white truncate">
                        {user?.displayName ?? 'User'}
                      </p>
                      <p className="font-body text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {user?.email}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="badge-classified">Level {user?.level ?? 1}</span>
                        <span className="font-mono text-2xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          {user?.xp ?? 0} XP
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile section */}
                <p className="font-display text-2xs tracking-widest uppercase px-1" style={{ color: 'rgba(201,168,76,0.5)' }}>
                  Profile
                </p>
                {editingName ? (
                  <div className="flex gap-2">
                    <input value={nameValue} onChange={(e) => setNameValue(e.target.value)}
                           autoFocus className="input-classified flex-1"
                           onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }} />
                    <button onClick={handleSaveName} disabled={savingName}
                            data-testid="save-name"
                            className="btn-classified px-3 py-2.5 disabled:opacity-50">
                      {savingName ? '…' : <Check size={16} />}
                    </button>
                    <button onClick={() => setEditingName(false)}
                            className="px-3 py-2.5 rounded-xl"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <SettingsRow label="Display Name" value={user?.displayName} onPress={() => { setEditingName(true); setNameValue(user?.displayName ?? ''); }} />
                )}
                <SettingsRow label="Email" value={user?.email} />
                <SettingsRow label="Change Password" onPress={() => navigate('/forgot-password')} />

                {/* Data & Privacy */}
                <p className="font-display text-2xs tracking-widest uppercase px-1 mt-1" style={{ color: 'rgba(201,168,76,0.5)' }}>
                  Data & Privacy
                </p>

                {/* "Data We Store" expandable */}
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                  <button
                    onClick={() => setShowDataStored(!showDataStored)}
                    className="flex items-center justify-between w-full py-3.5 px-4"
                    style={{ background: 'rgba(255,255,255,0.02)' }}
                  >
                    <span className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>Data We Store</span>
                    <ChevronDown size={14}
                      style={{ color: 'rgba(255,255,255,0.3)', transform: showDataStored ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>
                  <AnimatePresence>
                    {showDataStored && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                  className="px-4 pb-4">
                        {['Email address', 'Brand settings', 'Generated content', 'Platform tokens (encrypted)', 'Usage analytics (anonymous)'].map((item) => (
                          <div key={item} className="flex items-center gap-2 py-1">
                            <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(201,168,76,0.5)' }} />
                            <p className="font-body text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{item}</p>
                          </div>
                        ))}
                        <a href={SUPPORT.privacyUrl} target="_blank" rel="noreferrer"
                           className="font-body text-xs mt-2 block" style={{ color: 'rgba(201,168,76,0.6)', textDecoration: 'none' }}>
                          Full Privacy Policy →
                        </a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button onClick={handleDataExport} disabled={exporting}
                        className="w-full flex items-center justify-between py-3.5 px-4 rounded-xl transition-all"
                        data-testid="export-data-btn"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {exporting ? 'Requesting export…' : 'Export My Data'}
                  </span>
                  <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.2)' }} />
                </button>

                <SettingsRow label="Privacy Policy"   onPress={() => window.open(SUPPORT.privacyUrl)} />
                <SettingsRow label="Terms of Service" onPress={() => window.open(SUPPORT.termsUrl)} />
                <SettingsRow label="Help Center"       onPress={() => window.open(SUPPORT.helpUrl)} />

                {/* Session */}
                <p className="font-display text-2xs tracking-widest uppercase px-1 mt-1" style={{ color: 'rgba(201,168,76,0.5)' }}>
                  Session
                </p>
                <button onClick={handleSignOut}
                        className="flex items-center gap-3 w-full py-3.5 px-4 rounded-xl transition-all"
                        style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <LogOut size={16} style={{ color: '#EF4444' }} />
                  <span className="font-body text-sm" style={{ color: '#EF4444' }}>Sign Out</span>
                </button>

                {/* DANGER ZONE — below fold intentionally */}
                <div className="mt-6 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="font-display text-2xs tracking-widest uppercase px-1 mb-3 flex items-center gap-2"
                     style={{ color: 'rgba(239,68,68,0.6)' }}>
                    <AlertTriangle size={12} />
                    Danger Zone
                  </p>

                  {deleteConfirm ? (
                    <div className="flex flex-col gap-3 p-4 rounded-xl"
                         style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <p className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                        This will permanently delete your account and all data. This cannot be undone.
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => setDeleteConfirm(false)}
                                className="flex-1 py-2.5 rounded-xl font-display text-xs tracking-widest uppercase"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                          Cancel
                        </button>
                        <button onClick={handleDeleteAccount} disabled={deleting}
                                data-testid="delete-account-btn"
                                className="flex-2 py-2.5 px-4 rounded-xl font-display text-xs tracking-widest uppercase"
                                style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#EF4444' }}>
                          {deleting ? 'Deleting…' : 'Confirm Delete'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={handleDeleteAccount}
                            data-testid="delete-account-btn"
                            className="flex items-center gap-3 w-full py-3.5 px-4 rounded-xl transition-all"
                            style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.12)' }}>
                      <Trash2 size={16} style={{ color: '#EF4444' }} />
                      <span className="font-body text-sm" style={{ color: '#EF4444' }}>Delete Account</span>
                    </button>
                  )}
                </div>

                {/* App version */}
                <p className="text-center font-mono text-2xs mt-3 mb-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  Marketer-Pro v1.0.0 (build 1)
                </p>
              </>
            )}

            {/* ── BILLING ── */}
            {activeTab === 'billing' && (
              <>
                <div className="card-classified p-4">
                  <p className="font-display text-2xs tracking-widest uppercase mb-1" style={{ color: 'rgba(201,168,76,0.6)' }}>
                    Current Plan
                  </p>
                  <p className="font-display font-bold text-xl text-white capitalize">
                    {currentPlan?.name ?? 'Free'}
                  </p>
                  <p className="font-body text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {subscription?.status === 'active' ? 'Active' :
                     subscription?.status === 'trialing' ? `Trial ends ${format(new Date(subscription.trialEnd!), 'MMM d')}` :
                     'Free plan'}
                  </p>
                  {subscription?.currentPeriodEnd && (
                    <p className="font-body text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      Renews {format(new Date(subscription.currentPeriodEnd), 'MMM d, yyyy')}
                    </p>
                  )}
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => navigate('/billing')} className="btn-classified flex-1 py-2.5 text-xs justify-center">
                      Upgrade
                    </button>
                    {subscription && (
                      <button onClick={openPortal} className="btn-void py-2.5 px-3 text-xs flex items-center gap-1.5">
                        <ExternalLink size={12} /> Manage
                      </button>
                    )}
                  </div>
                </div>
                <SettingsRow label="Contact Support" onPress={() => window.location.href = `mailto:${SUPPORT.email}`} />
                <SettingsRow label="Help Center"     onPress={() => window.open(SUPPORT.helpUrl)} />
              </>
            )}

            {/* ── PLATFORMS — three-state ── */}
            {activeTab === 'platforms' && (
              <>
                <p className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Connect your social accounts to enable scheduling and analytics.
                </p>
                {ACTIVE_PLATFORMS.map((p) => {
                  const state = getPlatformState(p.id);
                  const conn  = platformConns.find((c) => c.platform === p.id);
                  return (
                    <div key={p.id} className="card p-4 flex items-center gap-3"
                         style={{ border: `1px solid ${p.color}15` }}>
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: p.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-semibold text-sm text-white">{p.name}</p>
                        <p className="font-body text-xs mt-0.5" style={{
                          color: state === 'connected' ? 'rgba(110,231,183,0.8)' :
                                 state === 'expired'   ? 'rgba(239,68,68,0.8)' :
                                 'rgba(255,255,255,0.3)' }}>
                          {state === 'connected' && conn?.handle ? `@${conn.handle}` :
                           state === 'expired'   ? 'Reconnect required' :
                           'Not connected'}
                        </p>
                      </div>
                      {/* Three-state button */}
                      {state === 'connected' ? (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg"
                             style={{ background: 'rgba(110,231,183,0.1)', border: '1px solid rgba(110,231,183,0.25)' }}>
                          <Check size={11} style={{ color: '#6EE7B7' }} />
                          <span className="font-display text-2xs tracking-widest uppercase" style={{ color: '#6EE7B7' }}>Connected</span>
                        </div>
                      ) : (
                        <button onClick={() => connectPlatform(p.id)}
                                className="btn-ghost py-1.5 px-3 text-2xs"
                                style={{ borderColor: state === 'expired' ? 'rgba(239,68,68,0.4)' : undefined,
                                         color:       state === 'expired' ? '#EF4444' : undefined }}>
                          {state === 'expired' ? 'Reconnect' : 'Connect'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </>
            )}

            {/* ── NOTIFICATIONS — rewritten descriptions ── */}
            {activeTab === 'notifications' && (
              <>
                <p className="font-body text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Changes save automatically.
                </p>
                {([
                  { key: 'postPublished' as const, label: 'Post Published',  desc: 'Know the moment your content goes live' },
                  { key: 'postFailed'    as const, label: 'Post Failed',     desc: 'Catch publishing errors before your audience notices' },
                  { key: 'weeklyReport'  as const, label: 'Weekly Report',   desc: 'Get personalized insights every Monday morning' },
                  { key: 'aiInsights'    as const, label: 'AI Insights',     desc: 'Receive optimization tips based on your performance' },
                  { key: 'billingAlerts' as const, label: 'Billing Alerts',  desc: 'Never miss a payment or renewal' },
                  { key: 'newFeatures'   as const, label: 'New Features',    desc: 'Be first to know about new tools and departments' },
                ]).map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center gap-4 py-3.5 px-4 rounded-xl"
                       style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-white">{label}</p>
                      <p className="font-body text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{desc}</p>
                    </div>
                    <button
                      role="switch"
                      aria-checked={notifications[key]}
                      onClick={() => toggleNotif(key)}
                      className="flex-shrink-0 relative"
                      style={{ width: 46, height: 26, borderRadius: 13,
                               background: notifications[key] ? 'linear-gradient(135deg, #C9A84C, #9d7c2e)' : 'rgba(255,255,255,0.1)',
                               transition: 'background 0.3s', border: 'none', cursor: 'pointer' }}
                    >
                      <motion.div
                        animate={{ x: notifications[key] ? 22 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        style={{ position: 'absolute', top: 3, width: 20, height: 20, borderRadius: '50%',
                                 background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
                      />
                    </button>
                  </div>
                ))}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
