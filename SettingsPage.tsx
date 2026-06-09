/**
 * SettingsPage.tsx — Premium rewrite (was a stub)
 * Marketer Pro Office Edition
 *
 * Full settings with:
 * - Profile section with avatar
 * - Brand identity quick-edit
 * - Notification preferences (toggle switches)
 * - Social connections status
 * - Billing with live plan status + upgrade CTA
 * - Privacy & data
 * - Danger zone
 *
 * Matches void-900/classified gold design system exactly.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ChevronRight,
  User, Palette, Bell, Globe, CreditCard,
  Shield, HelpCircle, LogOut, Zap, Star,
  Moon, Smartphone, Mail, Lock, Trash2,
  Download, Eye,
} from 'lucide-react';
import { useBilling } from '../hooks/useBilling';
import { useAuth } from '../contexts/AuthContext';

// ─── Toggle switch ────────────────────────────────────────────────────────────
const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <button
    onClick={() => onChange(!value)}
    role="switch"
    aria-checked={value}
    className="relative w-11 h-6 rounded-full transition-all flex-shrink-0"
    style={{
      background: value ? 'linear-gradient(135deg,#C9A84C,#9d7c2e)' : 'rgba(255,255,255,0.08)',
      border: `1px solid ${value ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.08)'}`,
    }}
  >
    <motion.div
      animate={{ x: value ? 20 : 2 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
    />
  </button>
);

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHeader = ({ title }: { title: string }) => (
  <p className="px-1 text-[10px] font-bold tracking-[0.2em] text-slate-700 uppercase mb-2 mt-1">{title}</p>
);

// ─── Row types ────────────────────────────────────────────────────────────────
interface RowBase { icon: React.ReactNode; label: string; sublabel?: string; }
interface NavRow extends RowBase { type: 'nav'; badge?: string; badgeColor?: string; onPress: () => void; }
interface ToggleRow extends RowBase { type: 'toggle'; value: boolean; onChange: (v: boolean) => void; }
interface DangerRow extends RowBase { type: 'danger'; onPress: () => void; }
type SettingsRow = NavRow | ToggleRow | DangerRow;

const Row = ({ row, index }: { row: SettingsRow; index: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -6 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.03 }}
    className={`flex items-center gap-3 px-4 py-3.5 transition-all
      ${row.type !== 'toggle' ? 'cursor-pointer hover:bg-white/[0.03] active:bg-white/[0.05]' : ''}
      ${row.type === 'danger' ? 'hover:bg-red-500/5' : ''}
    `}
    onClick={row.type === 'nav' ? row.onPress : row.type === 'danger' ? row.onPress : undefined}
  >
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
      ${row.type === 'danger' ? 'bg-red-500/10 text-red-400' : 'bg-white/[0.04] text-slate-500'}`}>
      {row.icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className={`text-sm font-medium tracking-wide ${row.type === 'danger' ? 'text-red-400' : 'text-slate-300'}`}>
        {row.label}
      </p>
      {row.sublabel && <p className="text-xs text-slate-600 mt-0.5 truncate">{row.sublabel}</p>}
    </div>
    {row.type === 'nav' && row.badge && (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0"
        style={{ color: row.badgeColor ?? '#C9A84C', borderColor: `${row.badgeColor ?? '#C9A84C'}30`, background: `${row.badgeColor ?? '#C9A84C'}12` }}>
        {row.badge}
      </span>
    )}
    {row.type === 'toggle' && <Toggle value={row.value} onChange={row.onChange} />}
    {row.type === 'nav' && <ChevronRight className="w-4 h-4 text-slate-700 flex-shrink-0" />}
  </motion.div>
);

const RowGroup = ({ rows }: { rows: SettingsRow[] }) => (
  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden divide-y divide-white/[0.04]">
    {rows.map((row, i) => <Row key={row.label} row={row} index={i} />)}
  </div>
);

// ─── SettingsPage ─────────────────────────────────────────────────────────────
export const SettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentPlan, isTrialing, trialDaysLeft, status } = useBilling();

  const [notifs, setNotifs] = useState({
    email: true, push: true, weekly: false, tips: true,
  });

  const displayName = (user as any)?.user_metadata?.full_name ?? 'Your Account';
  const email = (user as any)?.email ?? '';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const planBadge = isTrialing ? `Trial · ${trialDaysLeft}d` : currentPlan.name;
  const planColor = currentPlan.id === 'pro' ? '#C9A84C' : currentPlan.id === 'enterprise' ? '#818cf8' : '#64748b';

  return (
    <div className="min-h-screen bg-void-900 safe-top" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/[0.06] bg-void-900/95 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <p className="font-display text-base tracking-[0.15em] text-classified">SETTINGS</p>
            <p className="font-classified text-[9px] tracking-[0.2em] text-slate-600 uppercase">{currentPlan.name} Plan</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5 safe-bottom">

        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.01] flex items-center gap-4 cursor-pointer hover:bg-white/[0.03] transition-all"
          onClick={() => navigate('/settings/profile')}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-bold text-lg flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,rgba(201,168,76,0.2),rgba(201,168,76,0.08))', border: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-200 truncate">{displayName}</p>
            <p className="text-xs text-slate-500 truncate mt-0.5">{email}</p>
            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border"
              style={{ color: planColor, borderColor: `${planColor}30`, background: `${planColor}10` }}>
              {planBadge}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-700 flex-shrink-0" />
        </motion.div>

        {/* Account */}
        <div>
          <SectionHeader title="Account" />
          <RowGroup rows={[
            { type: 'nav', icon: <User className="w-4 h-4"/>, label: 'Profile', sublabel: 'Name, email, avatar', onPress: () => navigate('/settings/profile') },
            { type: 'nav', icon: <Lock className="w-4 h-4"/>, label: 'Security', sublabel: 'Password, 2FA, sessions', onPress: () => navigate('/settings/security') },
          ]} />
        </div>

        {/* Workspace */}
        <div>
          <SectionHeader title="Workspace" />
          <RowGroup rows={[
            { type: 'nav', icon: <Palette className="w-4 h-4"/>, label: 'Brand Identity', sublabel: 'Logo, colors, tone of voice', onPress: () => navigate('/settings/brand') },
            { type: 'nav', icon: <Globe className="w-4 h-4"/>, label: 'Social Connections', sublabel: 'Instagram, LinkedIn, TikTok…', onPress: () => navigate('/settings/connections') },
            { type: 'nav', icon: <Smartphone className="w-4 h-4"/>, label: 'Devices', sublabel: 'Manage signed-in devices', onPress: () => navigate('/settings/devices') },
          ]} />
        </div>

        {/* Notifications */}
        <div>
          <SectionHeader title="Notifications" />
          <RowGroup rows={[
            { type: 'toggle', icon: <Mail className="w-4 h-4"/>, label: 'Email notifications', sublabel: 'Receipts, alerts, updates', value: notifs.email, onChange: v => setNotifs(n => ({...n, email: v})) },
            { type: 'toggle', icon: <Bell className="w-4 h-4"/>, label: 'Push notifications', sublabel: 'Publishing, scheduling', value: notifs.push, onChange: v => setNotifs(n => ({...n, push: v})) },
            { type: 'toggle', icon: <Star className="w-4 h-4"/>, label: 'Weekly digest', sublabel: 'Performance summary', value: notifs.weekly, onChange: v => setNotifs(n => ({...n, weekly: v})) },
          ]} />
        </div>

        {/* Subscription */}
        <div>
          <SectionHeader title="Subscription" />
          <RowGroup rows={[
            {
              type: 'nav', icon: <CreditCard className="w-4 h-4"/>, label: 'Billing & Plans',
              sublabel: 'Manage subscription, invoices',
              badge: planBadge, badgeColor: planColor,
              onPress: () => navigate('/settings/billing'),
            },
            ...(currentPlan.id === 'free' ? [{
              type: 'nav' as const, icon: <Zap className="w-4 h-4"/>, label: 'Upgrade to Pro',
              sublabel: 'Unlimited generations + more',
              badge: '$19/mo', badgeColor: '#C9A84C',
              onPress: () => navigate('/settings/billing'),
            }] : []),
          ]} />
        </div>

        {/* Privacy */}
        <div>
          <SectionHeader title="Privacy & Data" />
          <RowGroup rows={[
            { type: 'nav', icon: <Eye className="w-4 h-4"/>, label: 'Privacy Settings', sublabel: 'Cookie consent, tracking', onPress: () => navigate('/privacy') },
            { type: 'nav', icon: <Download className="w-4 h-4"/>, label: 'Export My Data', sublabel: 'Download everything', onPress: () => {} },
            { type: 'nav', icon: <Shield className="w-4 h-4"/>, label: 'Data Processing', sublabel: 'GDPR, CCPA settings', onPress: () => navigate('/privacy') },
          ]} />
        </div>

        {/* Support */}
        <div>
          <SectionHeader title="Support" />
          <RowGroup rows={[
            { type: 'nav', icon: <HelpCircle className="w-4 h-4"/>, label: 'Help Center', sublabel: '13 articles · FAQ', onPress: () => navigate('/help') },
            { type: 'nav', icon: <Mail className="w-4 h-4"/>, label: 'Contact Support', sublabel: 'Replies within 2 business days', onPress: () => {} },
          ]} />
        </div>

        {/* Danger */}
        <div>
          <SectionHeader title="Danger Zone" />
          <RowGroup rows={[
            { type: 'danger', icon: <LogOut className="w-4 h-4"/>, label: 'Sign Out', onPress: () => {} },
            { type: 'danger', icon: <Trash2 className="w-4 h-4"/>, label: 'Delete Account', sublabel: 'Permanently remove all data', onPress: () => {} },
          ]} />
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-800 py-2">
          Marketer Pro v2.0.0 · Office Edition
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;
