/**
 * SettingsPage.tsx
 * Marketer Pro — Full Settings replacing the "Phase 5 — Coming Soon" stub.
 *
 * Sections:
 *   Account · Brand · Notifications · Integrations · Billing · Privacy · Support
 *
 * Design: matches void-900/classified/font-display system exactly.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ChevronRight,
  User, Palette, Bell, Globe, CreditCard,
  Shield, HelpCircle, LogOut, Star,
  Moon, Sun, Smartphone, Mail,
} from 'lucide-react';
import { useBilling } from '../hooks/useBilling';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SettingsRow {
  icon: React.ReactNode;
  label: string;
  value?: string;
  badge?: string;
  badgeStyle?: string;
  danger?: boolean;
  onPress: () => void;
}

interface SettingsSection {
  title: string;
  rows: SettingsRow[];
}

// ─── Section component ────────────────────────────────────────────────────────

const SettingsSection: React.FC<{ section: SettingsSection; index: number }> = ({ section, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="space-y-1"
  >
    <p className="px-1 text-[10px] font-classified tracking-[0.2em] text-slate-700 uppercase mb-2">
      {section.title}
    </p>
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden divide-y divide-white/[0.04]">
      {section.rows.map((row, i) => (
        <motion.button
          key={row.label}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.05 + i * 0.03 }}
          onClick={row.onPress}
          className={`
            w-full flex items-center gap-3 px-4 py-3.5
            hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors text-left
            ${row.danger ? 'hover:bg-red-500/5' : ''}
          `}
        >
          <div className={`
            w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
            ${row.danger
              ? 'bg-red-500/10 text-red-400'
              : 'bg-white/[0.04] text-slate-500'}
          `}>
            {row.icon}
          </div>

          <div className="flex-1 min-w-0">
            <p className={`
              text-sm font-heading tracking-wide
              ${row.danger ? 'text-red-400' : 'text-slate-300'}
            `}>
              {row.label}
            </p>
            {row.value && (
              <p className="text-xs text-slate-600 font-body mt-0.5 truncate">{row.value}</p>
            )}
          </div>

          {row.badge && (
            <span className={`
              px-2 py-0.5 rounded text-[9px] font-classified tracking-widest uppercase border flex-shrink-0
              ${row.badgeStyle ?? 'text-slate-500 border-slate-500/20 bg-slate-500/5'}
            `}>
              {row.badge}
            </span>
          )}

          {!row.danger && (
            <ChevronRight className="w-4 h-4 text-slate-700 flex-shrink-0" />
          )}
        </motion.button>
      ))}
    </div>
  </motion.div>
);

// ─── SettingsPage ─────────────────────────────────────────────────────────────

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentPlan, status, isTrialing, trialDaysLeft } = useBilling();

  const planBadgeStyle =
    currentPlan.id === 'pro'
      ? 'text-classified border-classified/20 bg-classified/5'
      : currentPlan.id === 'enterprise'
      ? 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5'
      : 'text-slate-500 border-slate-500/20 bg-slate-500/5';

  const planBadgeLabel = isTrialing
    ? `Trial · ${trialDaysLeft}d`
    : currentPlan.name;

  const sections: SettingsSection[] = [
    {
      title: 'Account',
      rows: [
        {
          icon: <User className="w-4 h-4" />,
          label: 'Profile',
          value: 'Name, email, avatar',
          onPress: () => navigate('/settings/profile'),
        },
        {
          icon: <Shield className="w-4 h-4" />,
          label: 'Security',
          value: 'Password, 2FA',
          onPress: () => navigate('/settings/security'),
        },
        {
          icon: <Bell className="w-4 h-4" />,
          label: 'Notifications',
          value: 'Email, push, digest',
          onPress: () => navigate('/settings/notifications'),
        },
      ],
    },
    {
      title: 'Workspace',
      rows: [
        {
          icon: <Palette className="w-4 h-4" />,
          label: 'Brand Identity',
          value: 'Logo, colors, tone',
          onPress: () => navigate('/settings/brand'),
        },
        {
          icon: <Globe className="w-4 h-4" />,
          label: 'Social Connections',
          value: 'Instagram, LinkedIn, TikTok…',
          onPress: () => navigate('/settings/connections'),
        },
        {
          icon: <Smartphone className="w-4 h-4" />,
          label: 'Devices',
          value: 'Manage signed-in devices',
          onPress: () => navigate('/settings/devices'),
        },
      ],
    },
    {
      title: 'Subscription',
      rows: [
        {
          icon: <CreditCard className="w-4 h-4" />,
          label: 'Billing & Plans',
          value: 'Manage subscription, invoices',
          badge: planBadgeLabel,
          badgeStyle: planBadgeStyle,
          onPress: () => navigate('/settings/billing'),
        },
        ...(currentPlan.id === 'free' ? [{
          icon: <Star className="w-4 h-4" />,
          label: 'Upgrade to Pro',
          value: 'Unlimited generations + more',
          badge: '$19/mo',
          badgeStyle: 'text-classified border-classified/20 bg-classified/5',
          onPress: () => navigate('/settings/billing'),
        }] : []),
      ],
    },
    {
      title: 'Support',
      rows: [
        {
          icon: <HelpCircle className="w-4 h-4" />,
          label: 'Help Center',
          value: '13 articles · FAQ',
          onPress: () => navigate('/help'),
        },
        {
          icon: <Mail className="w-4 h-4" />,
          label: 'Contact Support',
          value: 'Replies within 2 business days',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Danger Zone',
      rows: [
        {
          icon: <LogOut className="w-4 h-4" />,
          label: 'Sign Out',
          danger: true,
          onPress: () => {},
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-void-900 safe-top">

      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/[0.06] bg-void-900/95 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <p className="font-display text-base tracking-[0.15em] text-classified">SETTINGS</p>
            <p className="font-classified text-[9px] tracking-[0.2em] text-slate-600">
              {currentPlan.name.toUpperCase()} PLAN
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-5 safe-bottom">
        {sections.map((section, i) => (
          <SettingsSection key={section.title} section={section} index={i} />
        ))}

        {/* App version footer */}
        <p className="text-center text-[10px] text-slate-800 font-body pb-2">
          Marketer Pro v2.0.0 · Office Edition
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;
