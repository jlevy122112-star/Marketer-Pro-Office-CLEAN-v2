import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Bell, Shield, CreditCard, Link2, Palette, HelpCircle,
  LogOut, ChevronRight, Check, Loader2, ExternalLink, Trash2,
  Instagram, Facebook, Linkedin,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProgression } from '../contexts/ProgressionContext';

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
  { id: 'profile',      label: 'Profile',       icon: User      },
  { id: 'integrations', label: 'Integrations',  icon: Link2     },
  { id: 'billing',      label: 'Billing',       icon: CreditCard },
  { id: 'notifications',label: 'Notifications', icon: Bell      },
  { id: 'security',     label: 'Security',      icon: Shield    },
] as const;

type TabId = typeof TABS[number]['id'];

// ─── Profile Tab ──────────────────────────────────────────────────────────────
const ProfileTab = () => {
  const { user, logout, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name }),
      });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-classified/30 to-reactor/20 border border-classified/20 flex items-center justify-center">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover rounded-2xl" />
          ) : (
            <span className="font-display text-3xl text-classified">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </span>
          )}
        </div>
        <div className="text-center">
          <p className="font-heading font-semibold text-slate-200">{user?.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-3">
        <SettingsField label="Display name">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full h-11 px-3 rounded-xl bg-desk-800 border border-white/[0.08] text-slate-200 text-sm focus:outline-none focus:border-classified/40 transition-colors"
          />
        </SettingsField>
        <SettingsField label="Email">
          <input
            value={user?.email ?? ''}
            disabled
            className="w-full h-11 px-3 rounded-xl bg-desk-800/50 border border-white/[0.04] text-slate-500 text-sm cursor-not-allowed"
          />
        </SettingsField>
        <SettingsField label="Plan">
          <div className="flex items-center justify-between h-11 px-3 rounded-xl bg-desk-800 border border-white/[0.08]">
            <span className="text-sm text-slate-300 capitalize">{user?.plan ?? 'free'}</span>
            <span className="text-xs text-classified font-mono font-medium uppercase tracking-wider">
              {user?.plan === 'pro' ? 'Pro' : user?.plan === 'enterprise' ? 'Enterprise' : 'Upgrade'}
            </span>
          </div>
        </SettingsField>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || name === user?.name}
        className="w-full h-11 rounded-xl bg-classified disabled:opacity-40 flex items-center justify-center gap-2 font-heading font-semibold text-sm text-void-900 tracking-wider uppercase transition-all active:scale-[0.98]"
        style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #9d7c2e 100%)' }}
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
        {saved ? 'Saved' : 'Save Changes'}
      </button>

      <div className="pt-4 border-t border-white/[0.06]">
        <button
          onClick={logout}
          className="w-full flex items-center justify-between h-11 px-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:border hover:border-red-500/20 transition-all"
        >
          <span className="flex items-center gap-2 text-sm font-body">
            <LogOut className="w-4 h-4" />
            Sign out
          </span>
        </button>
      </div>
    </div>
  );
};

// ─── Integrations Tab ─────────────────────────────────────────────────────────
const PLATFORMS = [
  { id: 'meta',       label: 'Instagram & Facebook', Icon: Instagram, color: '#e1306c' },
  { id: 'tiktok',     label: 'TikTok',               Icon: ({ className }: { className: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.75a8.2 8.2 0 0 0 4.77 1.52V6.8a4.85 4.85 0 0 1-1-.11z"/>
    </svg>
  ), color: '#010101' },
  { id: 'linkedin',   label: 'LinkedIn',             Icon: Linkedin, color: '#0a66c2' },
  { id: 'googleads',  label: 'Google Ads',           Icon: ({ className }: { className: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  ), color: '#4285f4' },
] as const;

const IntegrationsTab = () => {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<string, boolean>>({});

  const handleConnect = async (provider: string) => {
    setConnecting(provider);
    try {
      const res = await fetch(`/api/integrations/${provider}/connect`, { credentials: 'include' });
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (provider: string) => {
    await fetch(`/api/integrations/${provider}/disconnect`, {
      method: 'DELETE',
      credentials: 'include',
    });
    setStatuses(prev => ({ ...prev, [provider]: false }));
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 font-body pb-1">
        Connect your social platforms to enable publishing and analytics sync.
      </p>
      {PLATFORMS.map(({ id, label, Icon, color }) => {
        const connected = statuses[id] ?? false;
        const isConnecting = connecting === id;
        return (
          <div
            key={id}
            className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${color}20`, border: `1px solid ${color}30` }}
            >
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-body text-slate-200">{label}</p>
              <p className="text-2xs text-slate-600 mt-0.5">
                {connected ? 'Connected' : 'Not connected'}
              </p>
            </div>
            {connected ? (
              <button
                onClick={() => handleDisconnect(id)}
                className="text-xs text-red-400 hover:text-red-300 font-mono tracking-wider transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => handleConnect(id)}
                disabled={isConnecting}
                className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-classified/30 text-classified text-xs font-mono font-medium tracking-wider hover:bg-classified/10 transition-all disabled:opacity-50"
              >
                {isConnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <ExternalLink className="w-3 h-3" />}
                Connect
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Billing Tab ─────────────────────────────────────────────────────────────
const BillingTab = () => {
  const { user } = useAuth();
  const isPro = user?.plan === 'pro' || user?.plan === 'enterprise';

  return (
    <div className="space-y-4">
      {/* Current plan */}
      <div className="p-4 rounded-xl border border-classified/20 bg-classified/5">
        <div className="flex items-center justify-between mb-3">
          <span className="font-heading font-semibold text-slate-200">Current Plan</span>
          <span className="px-2.5 py-1 rounded-lg bg-classified/20 text-classified text-xs font-mono font-medium uppercase tracking-wider">
            {user?.plan ?? 'Free'}
          </span>
        </div>
        {!isPro && (
          <p className="text-xs text-slate-500 font-body">
            Upgrade to Pro for unlimited generations, all social integrations, and advanced analytics.
          </p>
        )}
      </div>

      {/* Plans */}
      {!isPro && (
        <div className="space-y-2">
          {[
            { name: 'Pro', price: '$29', period: '/month', features: ['Unlimited AI generations', 'All 4 social platforms', 'Advanced analytics', 'Priority support'] },
            { name: 'Enterprise', price: '$99', period: '/month', features: ['Everything in Pro', 'Unlimited brands', 'Team members', 'Custom AI training', 'Dedicated support'] },
          ].map(plan => (
            <div key={plan.name} className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-heading font-semibold text-slate-200">{plan.name}</p>
                  <p className="text-xs text-slate-500">{plan.features[0]}</p>
                </div>
                <div className="text-right">
                  <span className="font-display text-xl text-classified">{plan.price}</span>
                  <span className="text-xs text-slate-500">{plan.period}</span>
                </div>
              </div>
              <button className="w-full h-10 rounded-xl border border-classified/30 text-classified text-xs font-mono font-medium tracking-wider hover:bg-classified/10 transition-all">
                Upgrade to {plan.name}
              </button>
            </div>
          ))}
        </div>
      )}

      {isPro && (
        <div className="space-y-2">
          <SettingsRow label="Next billing date" value="July 1, 2026" />
          <SettingsRow label="Payment method" value="Visa •••• 4242" />
          <button className="w-full flex items-center justify-between h-11 px-3 rounded-xl border border-white/[0.06] text-slate-400 hover:border-white/[0.12] hover:text-slate-300 transition-all text-sm">
            <span>Manage subscription</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Notifications Tab ────────────────────────────────────────────────────────
const NotificationsTab = () => {
  const [prefs, setPrefs] = useState({
    postPublished: true,
    weeklyDigest: true,
    achievementUnlocked: true,
    teamActivity: false,
    marketingTips: false,
  });

  const toggle = (key: keyof typeof prefs) =>
    setPrefs(p => ({ ...p, [key]: !p[key] }));

  const items: { key: keyof typeof prefs; label: string; description: string }[] = [
    { key: 'postPublished',        label: 'Post published',           description: 'When a scheduled post goes live' },
    { key: 'weeklyDigest',         label: 'Weekly digest',            description: 'Performance summary every Monday' },
    { key: 'achievementUnlocked',  label: 'Achievement unlocked',     description: 'XP milestones and badge awards' },
    { key: 'teamActivity',         label: 'Team activity',            description: 'When team members publish content' },
    { key: 'marketingTips',        label: 'Marketing tips',           description: 'Actionable tips from Marketer Pro' },
  ];

  return (
    <div className="space-y-1">
      {items.map(item => (
        <div key={item.key} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.02] transition-colors">
          <div className="flex-1">
            <p className="text-sm font-body text-slate-200">{item.label}</p>
            <p className="text-2xs text-slate-600 mt-0.5">{item.description}</p>
          </div>
          <button
            onClick={() => toggle(item.key)}
            className={`relative w-10 h-6 rounded-full transition-all duration-200 flex-shrink-0 ${
              prefs[item.key] ? 'bg-classified' : 'bg-white/10'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                prefs[item.key] ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  );
};

// ─── Security Tab ─────────────────────────────────────────────────────────────
const SecurityTab = () => {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChangePassword = async () => {
    if (newPw !== confirmPw) { setError('Passwords do not match'); return; }
    if (newPw.length < 8) { setError('Password must be at least 8 characters'); return; }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message ?? 'Failed to update password');
      }
      setSuccess(true);
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <p className="text-xs text-slate-500 font-body pb-1">Change your account password.</p>
        {['Current password', 'New password', 'Confirm new password'].map((label, i) => (
          <SettingsField key={label} label={label}>
            <input
              type="password"
              value={[currentPw, newPw, confirmPw][i]}
              onChange={e => [setCurrentPw, setNewPw, setConfirmPw][i](e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-desk-800 border border-white/[0.08] text-slate-200 text-sm focus:outline-none focus:border-classified/40 transition-colors"
            />
          </SettingsField>
        ))}
        {error && <p className="text-xs text-red-400 px-1">{error}</p>}
        {success && <p className="text-xs text-green-400 px-1 flex items-center gap-1"><Check className="w-3 h-3" /> Password updated</p>}
        <button
          onClick={handleChangePassword}
          disabled={saving || !currentPw || !newPw || !confirmPw}
          className="w-full h-11 rounded-xl flex items-center justify-center gap-2 font-heading font-semibold text-sm text-void-900 tracking-wider uppercase disabled:opacity-40 transition-all active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #9d7c2e 100%)' }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Update Password
        </button>
      </div>

      <div className="pt-4 border-t border-white/[0.06] space-y-2">
        <p className="text-xs text-slate-600 font-heading tracking-widest uppercase">Danger Zone</p>
        <button className="w-full flex items-center justify-between h-11 px-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all">
          <span className="flex items-center gap-2 text-sm font-body">
            <Trash2 className="w-4 h-4" />
            Delete account
          </span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ─── Helper components ────────────────────────────────────────────────────────
const SettingsField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-2xs font-heading tracking-widest text-slate-500 uppercase px-1">{label}</label>
    {children}
  </div>
);

const SettingsRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between h-11 px-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
    <span className="text-sm text-slate-500">{label}</span>
    <span className="text-sm text-slate-300">{value}</span>
  </div>
);

// ─── Main SettingsPage ────────────────────────────────────────────────────────
export const SettingsPage = () => {
  const { tab: tabParam } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const { progression } = useProgression();
  const [activeTab, setActiveTab] = useState<TabId>((tabParam as TabId) ?? 'profile');

  const TAB_CONTENT: Record<TabId, React.ReactNode> = {
    profile:       <ProfileTab />,
    integrations:  <IntegrationsTab />,
    billing:       <BillingTab />,
    notifications: <NotificationsTab />,
    security:      <SecurityTab />,
  };

  return (
    <div className="flex flex-col h-screen bg-void-900 safe-top">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-void-900/80 backdrop-blur-md">
        <div>
          <h1 className="font-display text-xl tracking-[0.2em] text-classified">SETTINGS</h1>
          <p className="font-classified text-[10px] tracking-[0.2em] text-slate-600">
            LV.{progression?.level ?? 1} · {progression?.totalXp?.toLocaleString() ?? 0} XP
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 px-3 py-2 border-b border-white/[0.06] overflow-x-auto scrollbar-none">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setActiveTab(id); navigate(`/settings/${id}`, { replace: true }); }}
            className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-heading whitespace-nowrap tracking-wider transition-all ${
              activeTab === id
                ? 'bg-classified/15 text-classified border border-classified/20'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {TAB_CONTENT[activeTab]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
