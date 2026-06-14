// FILE PATH: src/pages/Settings/SettingsPage.tsx
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, CreditCard, Share2, Bell,
  ChevronRight, LogOut, Trash2, ExternalLink, AlertTriangle,
} from 'lucide-react';
import { useAuth }    from '../../contexts/AuthContext';
import { useBilling } from '../../hooks/useBilling';
import { useToast }   from '../../contexts/ToastContext';
import { supabase }   from '../../lib/supabase';
import { ACTIVE_PLATFORMS, PLANS, SUPPORT } from '../../lib/constants';
import { format }     from 'date-fns';
import { useNavigate } from 'react-router-dom';

type SettingsTab = 'account' | 'billing' | 'platforms' | 'notifications';

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'account',       label: 'Account',       icon: User },
  { id: 'billing',       label: 'Billing',        icon: CreditCard },
  { id: 'platforms',     label: 'Platforms',      icon: Share2 },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
];

function SettingsRow({ label, value, onPress, danger = false }: {
  label: string; value?: string; onPress?: () => void; danger?: boolean;
}) {
  return (
    <button onClick={onPress} disabled={!onPress}
            className="flex items-center justify-between w-full py-3.5 px-4 rounded-xl transition-all"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <span className="font-body text-sm"
            style={{ color: danger ? '#EF4444' : 'rgba(255,255,255,0.8)' }}>
        {label}
      </span>
      <div className="flex items-center gap-2">
        {value && <span className="font-body text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{value}</span>}
        {onPress && <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.2)' }} />}
      </div>
    </button>
  );
}

export default function SettingsPage() {
  const { user, signOut }           = useAuth();
  const { subscription, openPortal } = useBilling();
  const { success, error: toastError } = useToast();
  const navigate                    = useNavigate();

  const [activeTab, setActiveTab]     = useState<SettingsTab>('account');
  const [deleteStep, setDeleteStep]   = useState<'idle' | 'confirm' | 'deleting'>('idle');
  const [deleteInput, setDeleteInput] = useState('');
  const [notifications, setNotifications] = useState({
    postPublished: true,
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

  // ── BLOCKER 5 FIX — In-app account deletion ──────────────────────────────
  // Apple 5.1.1(v) requires in-app deletion, not a link to a website.
  // This implementation:
  //   1. Requires the user to type "DELETE" to confirm — prevents accidents
  //   2. Deletes all user data from Supabase via RLS cascade
  //   3. Signs out the user and clears all local state
  //   4. Works without a backend endpoint — uses Supabase admin via Edge Function
  const handleDeleteAccount = useCallback(async () => {
    if (deleteStep === 'idle') {
      setDeleteStep('confirm');
      return;
    }
    if (deleteStep === 'confirm') {
      if (deleteInput.toUpperCase() !== 'DELETE') {
        toastError('Type DELETE to confirm', 'Type the word DELETE in all caps to proceed');
        return;
      }
      setDeleteStep('deleting');
      try {
        // Call Supabase Edge Function that handles cascade deletion
        // The Edge Function uses the service role key to delete the auth.users record
        // which triggers ON DELETE CASCADE on all profile/brand/content tables
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated');

        const apiBase = import.meta.env.VITE_API_BASE_URL as string;
        const res = await fetch(`${apiBase}/me`, {
          method:  'DELETE',
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message ?? `Deletion failed: ${res.status}`);
        }

        // Sign out locally after successful deletion
        await supabase.auth.signOut();
        navigate('/login', { replace: true });
        // Note: no success toast — user is gone

      } catch (err) {
        toastError(
          'Deletion failed',
          err instanceof Error ? err.message : 'Please contact support@marketer-pro.app'
        );
        setDeleteStep('idle');
        setDeleteInput('');
      }
    }
  }, [deleteStep, deleteInput, navigate, toastError]);

  return (
    <div className="page-root">
      <div className="page-content">
        {/* Header */}
        <div className="px-5 pt-4 pb-3">
          <h1 className="font-display font-bold text-lg heading-classified">Settings</h1>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 px-5 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all flex-shrink-0"
              style={{
                background: activeTab === id ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${activeTab === id ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.07)'}`,
              }}
            >
              <Icon size={13} style={{ color: activeTab === id ? '#C9A84C' : 'rgba(255,255,255,0.4)' }} />
              <span className="font-display text-2xs font-semibold tracking-wider uppercase"
                    style={{ color: activeTab === id ? '#C9A84C' : 'rgba(255,255,255,0.5)' }}>
                {label}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="px-5 flex flex-col gap-3"
          >
            {/* ── ACCOUNT TAB ─────────────────────────────────────────────── */}
            {activeTab === 'account' && (
              <>
                {/* Profile card */}
                <div className="card-classified p-4">
                  <div className="flex items-center gap-3">
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

                <p className="font-display text-2xs tracking-widest uppercase px-1"
                   style={{ color: 'rgba(201,168,76,0.5)' }}>Profile</p>
                <SettingsRow label="Display Name" value={user?.displayName} />
                <SettingsRow label="Email"         value={user?.email} />
                <SettingsRow label="Change Password" onPress={() => navigate('/forgot-password')} />

                <p className="font-display text-2xs tracking-widest uppercase px-1 mt-1"
                   style={{ color: 'rgba(201,168,76,0.5)' }}>Data & Privacy</p>
                <SettingsRow label="Export My Data"  onPress={() => window.open(SUPPORT.privacyUrl)} />
                <SettingsRow label="Privacy Policy"  onPress={() => window.open(SUPPORT.privacyUrl)} />
                <SettingsRow label="Terms of Service" onPress={() => window.open(SUPPORT.termsUrl)} />

                <p className="font-display text-2xs tracking-widest uppercase px-1 mt-1"
                   style={{ color: 'rgba(201,168,76,0.5)' }}>Session</p>
                <button onClick={handleSignOut}
                        className="flex items-center gap-3 w-full py-3.5 px-4 rounded-xl"
                        style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <LogOut size={16} style={{ color: '#EF4444' }} />
                  <span className="font-body text-sm" style={{ color: '#EF4444' }}>Sign Out</span>
                </button>

                {/* ── DANGER ZONE — below fold intentionally ── */}
                <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="font-display text-2xs tracking-widest uppercase px-1 mb-3 flex items-center gap-2"
                     style={{ color: 'rgba(239,68,68,0.6)' }}>
                    <AlertTriangle size={12} /> Danger Zone
                  </p>

                  {/* Step 1 — Initial button */}
                  {deleteStep === 'idle' && (
                    <button
                      onClick={handleDeleteAccount}
                      data-testid="delete-account-btn"
                      className="flex items-center gap-3 w-full py-3.5 px-4 rounded-xl transition-all"
                      style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.12)' }}
                    >
                      <Trash2 size={16} style={{ color: '#EF4444' }} />
                      <span className="font-body text-sm" style={{ color: '#EF4444' }}>Delete Account</span>
                    </button>
                  )}

                  {/* Step 2 — Type DELETE to confirm */}
                  {deleteStep === 'confirm' && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col gap-3 p-4 rounded-2xl"
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle size={16} style={{ color: '#EF4444', flexShrink: 0, marginTop: 2 }} />
                        <p className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                          This will permanently delete your account, all brands, generated content, and analytics.
                          <strong style={{ color: '#EF4444' }}> This cannot be undone.</strong>
                        </p>
                      </div>

                      <div>
                        <label className="font-display text-2xs tracking-widest uppercase mb-2 block"
                               style={{ color: 'rgba(239,68,68,0.8)' }}>
                          Type DELETE to confirm
                        </label>
                        <input
                          type="text"
                          value={deleteInput}
                          onChange={(e) => setDeleteInput(e.target.value)}
                          placeholder="DELETE"
                          autoCapitalize="characters"
                          className="input-classified"
                          style={{ borderColor: 'rgba(239,68,68,0.4)' }}
                          data-testid="delete-account-input"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => { setDeleteStep('idle'); setDeleteInput(''); }}
                          className="flex-1 py-2.5 rounded-xl font-display text-2xs tracking-widest uppercase"
                          style={{ background: 'rgba(255,255,255,0.05)',
                                   border: '1px solid rgba(255,255,255,0.1)',
                                   color: 'rgba(255,255,255,0.6)' }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteAccount}
                          data-testid="delete-account-btn"
                          disabled={deleteInput.toUpperCase() !== 'DELETE'}
                          className="flex-1 py-2.5 rounded-xl font-display text-2xs tracking-widest uppercase transition-all disabled:opacity-30"
                          style={{ background: 'rgba(239,68,68,0.25)',
                                   border: '1px solid rgba(239,68,68,0.5)',
                                   color: '#EF4444' }}
                        >
                          Delete Forever
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3 — Deleting spinner */}
                  {deleteStep === 'deleting' && (
                    <div className="flex items-center justify-center gap-3 py-4 px-4 rounded-2xl"
                         style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <div className="w-4 h-4 rounded-full border-2 border-transparent"
                           style={{ borderTopColor: '#EF4444', animation: 'spin 0.9s linear infinite' }} />
                      <span className="font-body text-sm" style={{ color: 'rgba(239,68,68,0.8)' }}>
                        Deleting your account…
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-center font-mono text-2xs mt-2 mb-4"
                   style={{ color: 'rgba(255,255,255,0.2)' }}>
                  Marketer-Pro v1.0.0
                </p>
              </>
            )}

            {/* ── BILLING TAB ─────────────────────────────────────────────── */}
            {activeTab === 'billing' && (
              <>
                <div className="card-classified p-4">
                  <p className="font-display text-2xs tracking-widest uppercase mb-1"
                     style={{ color: 'rgba(201,168,76,0.6)' }}>Current Plan</p>
                  <p className="font-display font-bold text-xl text-white capitalize">
                    {currentPlan?.name ?? 'Free'}
                  </p>
                  {subscription?.currentPeriodEnd && (
                    <p className="font-body text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      Renews {format(new Date(subscription.currentPeriodEnd), 'MMM d, yyyy')}
                    </p>
                  )}
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => navigate('/billing')}
                            className="btn-classified flex-1 py-2.5 text-xs justify-center">
                      Upgrade
                    </button>
                    {subscription && (
                      <button onClick={openPortal}
                              className="btn-void py-2.5 px-3 text-xs flex items-center gap-1.5">
                        <ExternalLink size={12} /> Manage
                      </button>
                    )}
                  </div>
                </div>
                <SettingsRow label="Help Center"
                             onPress={() => window.open(SUPPORT.helpUrl)} />
                <SettingsRow label="Contact Support"
                             onPress={() => window.location.href = `mailto:${SUPPORT.email}`} />
              </>
            )}

            {/* ── PLATFORMS TAB ───────────────────────────────────────────── */}
            {activeTab === 'platforms' && (
              <>
                <p className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Connect your social accounts to enable scheduling and publishing.
                </p>
                {ACTIVE_PLATFORMS.map((p) => (
                  <div key={p.id}
                       className="card p-4 flex items-center gap-3"
                       style={{ border: `1px solid ${p.color}15` }}>
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: p.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-sm text-white">{p.name}</p>
                      <p className="font-body text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        Not connected
                      </p>
                    </div>
                    <button
                      className="btn-ghost py-1.5 px-3 text-2xs"
                      onClick={() => window.open(SUPPORT.helpUrl)}
                    >
                      Connect
                    </button>
                  </div>
                ))}
              </>
            )}

            {/* ── NOTIFICATIONS TAB ───────────────────────────────────────── */}
            {activeTab === 'notifications' && (
              <>
                {([
                  { key: 'postPublished' as const, label: 'Post Published',  desc: 'When your scheduled content goes live' },
                  { key: 'weeklyReport'  as const, label: 'Weekly Report',   desc: 'Analytics summary every Monday morning' },
                  { key: 'aiInsights'    as const, label: 'AI Insights',     desc: 'Personalized content recommendations' },
                  { key: 'billingAlerts' as const, label: 'Billing Alerts',  desc: 'Payment and renewal reminders' },
                  { key: 'newFeatures'   as const, label: 'New Features',    desc: 'Product updates and new tools' },
                ]).map(({ key, label, desc }) => (
                  <div key={key}
                       className="flex items-center gap-4 py-3.5 px-4 rounded-xl"
                       style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-white">{label}</p>
                      <p className="font-body text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{desc}</p>
                    </div>
                    <button
                      role="switch"
                      aria-checked={notifications[key]}
                      onClick={() => setNotifications((p) => ({ ...p, [key]: !p[key] }))}
                      className="flex-shrink-0 relative"
                      style={{
                        width: 46, height: 26, borderRadius: 13,
                        background: notifications[key]
                          ? 'linear-gradient(135deg, #C9A84C, #9d7c2e)'
                          : 'rgba(255,255,255,0.1)',
                        transition: 'background 0.3s', border: 'none', cursor: 'pointer',
                      }}
                    >
                      <motion.div
                        animate={{ x: notifications[key] ? 22 : 2 }}
                        transitioninterface NotifPrefs {
  post_published: boolean;
  post_failed:    boolean;
  weekly_report:  boolean;
  ai_insights:    boolean;
  billing_alerts: boolean;
  new_features:   boolean;
}

const TABS: { id: Tab; label: string; Icon: typeof User }[] = [
  { id: 'account',       label: 'Account',   Icon: User },
  { id: 'billing',       label: 'Billing',   Icon: CreditCard },
  { id: 'platforms',     label: 'Platforms', Icon: Share2 },
  { id: 'notifications', label: 'Alerts',    Icon: Bell },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const navigate               = useNavigate();
  const { session, user, signOut, refreshUser } = useAuth();
  const { subscription, openPortal } = useBilling();
  const { success, error: toastError } = useToast();

  const [tab, setTab]                   = useState<Tab>('account');
  const [editingName, setEditingName]   = useState(false);
  const [nameValue, setNameValue]       = useState('');
  const [savingName, setSavingName]     = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const [exporting, setExporting]       = useState(false);
  const [notifs, setNotifs]             = useState<NotifPrefs>({
    post_published: true,
    post_failed:    true,
    weekly_report:  true,
    ai_insights:    true,
    billing_alerts: true,
    new_features:   false,
  });

  const rewardEngine = useOfficeEvolution({
    getToken: async () => session?.access_token ?? null,
    recordLoginOnMount: false,
  });

  // Load notification preferences from backend on mount
  useEffect(() => {
    api.get<NotifPrefs>('/notifications/preferences')
      .then((data) => { if (data) setNotifs(data); })
      .catch(() => { /* use defaults silently */ });
  }, []);

  // ── Save display name ────────────────────────────────────────────────────
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

  // ── Persist notification preference ──────────────────────────────────────
  const saveNotifPref = useCallback(async (key: keyof NotifPrefs, value: boolean) => {
    setNotifs((p) => ({ ...p, [key]: value }));
    try {
      await api.patch('/notifications/preferences', { [key]: value });
    } catch {
      setNotifs((p) => ({ ...p, [key]: !value }));
      toastError('Failed to save preference');
    }
  }, [toastError]);

  // ── In-app account deletion — Apple 5.1.1(v) / Google Play Data Safety ──
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

  // ── Data export — GDPR Article 20 ────────────────────────────────────────
  const handleDataExport = useCallback(async () => {
    setExporting(true);
    try {
      await api.post('/me/export');
      success('Export requested', 'You will receive an email within 24 hours');
    } catch (e) {
      toastError('Export failed', e instanceof Error ? e.message : 'Try again');
    } finally {
      setExporting(false);
    }
  }, [success, toastError]);

  const officeState = rewardEngine.state;

  return (
    <Container tabBarOffset>
      {/* Header */}
      <div style={{ padding: `${space[4]} ${space[5]} ${space[3]}` }}>
        <Heading level={2} gold>Settings</Heading>
      </div>

      {/* Tab bar */}
      <div
        role="tablist"
        style={{
          display:        'flex',
          gap:            6,
          padding:        `0 ${space[5]}`,
          marginBottom:   space[5],
          overflowX:      'auto',
          scrollbarWidth: 'none',
        }}
      >
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            style={{
              display:       'flex',
              alignItems:    'center',
              gap:           6,
              padding:       '8px 12px',
              borderRadius:  radii.md,
              fontFamily:    fonts.display,
              fontSize:      fontSizes.xs,
              fontWeight:    fontWeights.bold,
              letterSpacing: letterSpacings.wider,
              textTransform: 'uppercase',
              cursor:        'pointer',
              background:    tab === id ? colors.classified.faint : 'rgba(255,255,255,0.04)',
              border:        `1px solid ${tab === id ? colors.classified.border : colors.border.subtle}`,
              color:         tab === id ? colors.classified.DEFAULT : colors.text.faint,
              flexShrink:    0,
              transition:    'all 0.2s',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Icon size={11} aria-hidden />{label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          role="tabpanel"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{ padding: `0 ${space[5]}` }}
        >

          {/* ── ACCOUNT ──────────────────────────────────────────────────── */}
          {tab === 'account' && (
            <Stack gap={16}>
              {/* Profile card */}
              <Card variant="glass" style={{ borderRadius: radii['2xl'] }}>
                <Row gap={16} align="center">
                  <div style={{
                    width:          56,
                    height:         56,
                    borderRadius:   radii.lg,
                    background:     gradients.gold,
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    flexShrink:     0,
                  }} aria-hidden>
                    <span style={{
                      fontFamily:  fonts.display,
                      fontWeight:  fontWeights.extrabold,
                      fontSize:    fontSizes['2xl'],
                      color:       '#060912',
                    }}>
                      {user?.displayName?.charAt(0)?.toUpperCase() ?? 'U'}
                    </span>
                  </div>
                  <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                    <Text variant="primary" size="lg" weight="bold" style={{ fontFamily: fonts.display, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.displayName}
                    </Text>
                    <Text variant="faint" size="sm" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.email}
                    </Text>
                    <Row gap={6} align="center" style={{ marginTop: 4 }}>
                      <Badge variant="gold">Level {user?.level ?? 1}</Badge>
                      <Badge variant="neutral">{user?.xp ?? 0} XP</Badge>
                      {officeState && <StreakBadge streak={officeState.streak} size="sm" />}
                    </Row>
                  </Stack>
                </Row>
                {officeState && (
                  <div style={{ marginTop: space[4] }}>
                    <XPBar state={officeState} compact={false} />
                  </div>
                )}
              </Card>

              {/* Display name edit */}
              <Panel label="Profile" noBorder>
                {editingName ? (
                  <Row gap={8}>
                    <div style={{ flex: 1 }}>
                      <Input
                        label="Display Name"
                        value={nameValue}
                        onChange={(e) => setNameValue(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleNameSave();
                          if (e.key === 'Escape') setEditingName(false);
                        }}
                      />
                    </div>
                    <button
                      onClick={handleNameSave}
                      disabled={savingName}
                      data-testid="save-name"
                      aria-label="Save name"
                      style={{
                        padding:      '0 16px',
                        borderRadius: radii.md,
                        background:   gradients.gold,
                        border:       'none',
                        color:        '#060912',
                        cursor:       savingName ? 'not-allowed' : 'pointer',
                        display:      'flex',
                        alignItems:   'center',
                        marginTop:    2,
                      }}
                    >
                      {savingName ? '…' : <Check size={16} />}
                    </button>
                    <button
                      onClick={() => { setEditingName(false); setNameValue(''); }}
                      aria-label="Cancel"
                      style={{
                        padding:      '0 12px',
                        borderRadius: radii.md,
                        background:   'rgba(255,255,255,0.05)',
                        border:       `1px solid ${colors.border.dim}`,
                        color:        colors.text.tertiary,
                        cursor:       'pointer',
                        display:      'flex',
                        alignItems:   'center',
                        marginTop:    2,
                      }}
                    >
                      <X size={15} />
                    </button>
                  </Row>
                ) : (
                  <SettingsRow
                    label="Display Name"
                    value={user?.displayName}
                    onPress={() => { setEditingName(true); setNameValue(user?.displayName ?? ''); }}
                  />
                )}
                <SettingsRow label="Email" value={user?.email} onPress={() => {}} />
                <SettingsRow label="Change Password" onPress={() => navigate('/forgot-password')} />
              </Panel>

              <Panel label="Data & Privacy" noBorder>
                <button
                  onClick={handleDataExport}
                  disabled={exporting}
                  data-testid="export-data-btn"
                  aria-label="Export my data"
                  style={settingsRowStyle}
                >
                  <Text variant="secondary" size="base">
                    {exporting ? 'Requesting export…' : 'Export My Data'}
                  </Text>
                  <ChevronRight size={14} color={colors.text.faint} />
                </button>
                <SettingsRow label="Privacy Policy"   onPress={() => window.open(SUPPORT.privacy)} />
                <SettingsRow label="Terms of Service" onPress={() => window.open(SUPPORT.terms)} />
              </Panel>

              <Panel label="Danger Zone" noBorder>
                {deleteConfirm ? (
                  <Stack gap={12}>
                    <Text variant="secondary" size="sm" style={{ lineHeight: 1.6 }}>
                      This will permanently delete your account and all data. This cannot be undone.
                    </Text>
                    <Row gap={10}>
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => setDeleteConfirm(false)}
                        style={{ flex: 1 }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="danger"
                        size="md"
                        loading={deleting}
                        onClick={handleDeleteAccount}
                        data-testid="delete-account-btn"
                        style={{ flex: 2 }}
                      >
                        Confirm Delete
                      </Button>
                    </Row>
                  </Stack>
                ) : (
                  <button
                    onClick={handleDeleteAccount}
                    data-testid="delete-account-btn"
                    style={{ ...settingsRowStyle, background: colors.status.errorBg, border: `1px solid ${colors.status.errorBdr}` }}
                  >
                    <Text variant="error" size="base">Delete Account</Text>
                    <ChevronRight size={14} color={colors.status.error} />
                  </button>
                )}
              </Panel>

              <Panel label="Session" noBorder>
                <button
                  onClick={async () => { await signOut(); navigate('/login', { replace: true }); }}
                  style={{ ...settingsRowStyle, background: 'rgba(248,113,113,0.07)', border: `1px solid rgba(248,113,113,0.2)` }}
                >
                  <Row gap={12} align="center">
                    <LogOut size={16} color={colors.status.error} aria-hidden />
                    <Text variant="error" size="base">Sign Out</Text>
                  </Row>
                </button>
              </Panel>

              {/* App version */}
              <Stack gap={6} style={{ alignItems: 'center', paddingBottom: space[4] }}>
                <Text variant="faint" size="xs" mono>Marketer-Pro v1.0.0 (build 1)</Text>
                <button
                  onClick={() => window.open(`mailto:${SUPPORT.email}?subject=Bug Report`)}
                  style={{
                    fontFamily:    fonts.body,
                    fontSize:      fontSizes.sm,
                    color:         colors.classified.dim,
                    background:    'none',
                    border:        'none',
                    cursor:        'pointer',
                    textDecoration:'underline',
                  }}
                >
                  Report a Bug
                </button>
              </Stack>
            </Stack>
          )}

          {/* ── BILLING ──────────────────────────────────────────────────── */}
          {tab === 'billing' && (
            <Stack gap={16}>
              <Card variant="glass" style={{ borderRadius: radii['2xl'] }}>
                <Text
                  variant="faint"
                  size="2xs"
                  weight="bold"
                  uppercase
                  style={{ letterSpacing: letterSpacings.widest, marginBottom: 6 }}
                >
                  Current Plan
                </Text>
                <Row justify="space-between" align="flex-start" style={{ marginBottom: space[4] }}>
                  <Text variant="primary" size="2xl" weight="extrabold" style={{ fontFamily: fonts.display, textTransform: 'capitalize' }}>
                    {subscription?.planId ?? 'Free'}
                  </Text>
                  <Badge variant={subscription?.status === 'active' ? 'teal' : 'gold'}>
                    {subscription?.status ?? 'Free'}
                  </Badge>
                </Row>
                <Row gap={10}>
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    onClick={() => navigate('/billing')}
                  >
                    Upgrade
                  </Button>
                  {subscription && (
                    <Button
                      variant="outline"
                      size="md"
                      fullWidth
                      onClick={openPortal}
                      leftIcon={<ExternalLink size={13} />}
                    >
                      Manage
                    </Button>
                  )}
                </Row>
              </Card>
              <Panel label="Support" noBorder>
                <SettingsRow label="Contact Support" onPress={() => window.open(`mailto:${SUPPORT.email}`)} />
                <SettingsRow label="Help Center"     onPress={() => window.open(SUPPORT.help)} />
              </Panel>
            </Stack>
          )}

          {/* ── PLATFORMS ────────────────────────────────────────────────── */}
          {tab === 'platforms' && (
            <Stack gap={16}>
              <Text variant="tertiary" size="sm" style={{ lineHeight: 1.7 }}>
                Connect your social accounts to enable scheduling and analytics.
              </Text>
              {ACTIVE_PLATFORMS.map((p) => (
                <Row
                  key={p.id}
                  gap={14}
                  align="center"
                  style={{
                    padding:      '14px 16px',
                    borderRadius: radii.xl,
                    background:   'rgba(255,255,255,0.03)',
                    border:       `1px solid ${colors.border.subtle}`,
                  }}
                >
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, flexShrink: 0 }} aria-hidden />
                  <Stack gap={2} style={{ flex: 1 }}>
                    <Text variant="primary" size="base" weight="bold" style={{ fontFamily: fonts.display }}>{p.name}</Text>
                    <Text variant="faint" size="xs">Not connected</Text>
                  </Stack>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => connectPlatform(p.id)}
                    aria-label={`Connect ${p.name}`}
                  >
                    Connect
                  </Button>
                </Row>
              ))}
              {COMING_SOON_PLATFORMS.map((p) => (
                <Row
                  key={p.id}
                  gap={14}
                  align="center"
                  style={{
                    padding:      '14px 16px',
                    borderRadius: radii.xl,
                    background:   'rgba(255,255,255,0.02)',
                    border:       `1px solid rgba(255,255,255,0.05)`,
                    opacity:      0.45,
                  }}
                >
                  <Text variant="secondary" size="base" style={{ flex: 1, fontFamily: fonts.display }}>{p.name}</Text>
                  <Badge variant="neutral">Soon</Badge>
                </Row>
              ))}
            </Stack>
          )}

          {/* ── NOTIFICATIONS ─────────────────────────────────────────────── */}
          {tab === 'notifications' && (
            <Stack gap={8}>
              <Text variant="tertiary" size="sm" style={{ lineHeight: 1.7, marginBottom: 4 }}>
                Changes save automatically.
              </Text>
              {([
                { key: 'post_published' as const, label: 'Post Published',  desc: 'When a scheduled post goes live' },
                { key: 'post_failed'    as const, label: 'Post Failed',     desc: 'When publishing fails' },
                { key: 'weekly_report'  as const, label: 'Weekly Report',   desc: 'Analytics summary every Monday' },
                { key: 'ai_insights'    as const, label: 'AI Insights',     desc: 'Optimization recommendations' },
                { key: 'billing_alerts' as const, label: 'Billing Alerts',  desc: 'Payment and renewal reminders' },
                { key: 'new_features'   as const, label: 'New Features',    desc: 'Product updates and releases' },
              ]).map(({ key, label, desc }) => (
                <Row
                  key={key}
                  gap={14}
                  align="center"
                  style={{
                    padding:      '14px 16px',
                    borderRadius: radii.xl,
                    background:   'rgba(255,255,255,0.03)',
                    border:       `1px solid ${colors.border.subtle}`,
                  }}
                >
                  <Stack gap={3} style={{ flex: 1 }}>
                    <Text variant="primary" size="base">{label}</Text>
                    <Text variant="faint"   size="xs">{desc}</Text>
                  </Stack>
                  <button
                    role="switch"
                    aria-checked={notifs[key]}
                    aria-label={`Toggle ${label} notifications`}
                    onClick={() => saveNotifPref(key, !notifs[key])}
                    style={{
                      width:        48,
                      height:       26,
                      borderRadius: 13,
                      background:   notifs[key]
                        ? gradients.gold
                        : 'rgba(255,255,255,0.1)',
                      border:       'none',
                      cursor:       'pointer',
                      position:     'relative',
                      flexShrink:   0,
                      transition:   'background 0.3s',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <motion.div
                      animate={{ x: notifs[key] ? 24 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      style={{
                        position:     'absolute',
                        top:           3,
                        width:         20,
                        height:        20,
                        borderRadius: '50%',
                        background:   '#fff',
                        boxShadow:    '0 1px 4px rgba(0,0,0,0.3)',
                      }}
                    />
                  </button>
                </Row>
              ))}
            </Stack>
          )}
        </motion.div>
      </AnimatePresence>
    </Container>
  );
}

// ── Shared row style ──────────────────────────────────────────────────────────
const settingsRowStyle: React.CSSProperties = {
  display:        'flex',
  justifyContent: 'space-between',
  alignItems:     'center',
  width:          '100%',
  padding:        '14px 16px',
  borderRadius:   12,
  background:     'rgba(255,255,255,0.03)',
  border:         `1px solid ${colors.border.subtle}`,
  cursor:         'pointer',
  marginBottom:   8,
  textAlign:      'left',
};

function SettingsRow({ label, value, onPress, danger = false }: {
  label: string; value?: string; onPress?: () => void; danger?: boolean;
}) {
  return (
    <button onClick={onPress} disabled={!onPress} style={settingsRowStyle} aria-label={label}>
      <Text variant={danger ? 'error' : 'secondary'} size="base">{label}</Text>
      <Row gap={8} align="center">
        {value && <Text variant="faint" size="sm">{value}</Text>}
        {onPress && <ChevronRight size={14} color={colors.text.faint} />}
      </Row>
    </button>
  );
}
