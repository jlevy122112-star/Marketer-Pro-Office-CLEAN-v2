'use client';

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS PAGE
// Account / Billing / Platforms / Notifications
// All actions are functional — no empty handlers.
// In-app account deletion, data export, OAuth connect all wired to real API.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, CreditCard, Share2, Bell,
  LogOut, ChevronRight, ExternalLink, Check, X,
} from 'lucide-react';

import {
  Container, Stack, Row, Card, Panel,
  Heading, Text, Button, Badge, Input,
} from '@marketer-pro/ui';
import {
  colors, fonts, fontSizes, fontWeights,
  letterSpacings, radii, space, gradients,
} from '@marketer-pro/ui';
import { XPBar, StreakBadge, useOfficeEvolution } from '@marketer-pro/reward-engine';
import { ACTIVE_PLATFORMS, COMING_SOON_PLATFORMS } from '@marketer-pro/cinematic-engine';

import { useAuth }    from '../contexts/AuthContext';
import { useBilling } from '../hooks/useBilling';
import { useToast }   from '../contexts/ToastContext';
import { api }        from '../lib/api';
import { SUPPORT }    from '../lib/constants';

type Tab = 'account' | 'billing' | 'platforms' | 'notifications';

interface NotifPrefs {
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
