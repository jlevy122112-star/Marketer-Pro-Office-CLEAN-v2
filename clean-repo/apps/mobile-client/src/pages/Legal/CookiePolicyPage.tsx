'use client';

import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Container, Stack, Heading, Text } from '@marketer-pro/ui';
import { colors, space, letterSpacings } from '@marketer-pro/ui';
import { SUPPORT } from '../../lib/constants';

export default function CookiePolicyPage() {
  const navigate = useNavigate();

  return (
    <Container tabBarOffset={false}>
      <div style={{ padding: `${space[4]} ${space[5]} ${space[3]}` }}>
        <button onClick={() => navigate(-1)} aria-label="Go back"
          style={{ color: colors.text.tertiary, background: 'none', border: 'none', cursor: 'pointer', padding: 4, marginBottom: space[4] }}>
          <ArrowLeft size={20} />
        </button>
        <Heading level={2} gold>Cookie Policy</Heading>
        <Text variant="faint" size="sm" style={{ marginTop: 6 }}>Last updated: June 2026</Text>
      </div>
      <Stack gap={20} style={{ padding: `0 ${space[5]} ${space[10]}` }}>
        {[
          { title: 'What Are Cookies', body: 'Cookies are small text files stored on your device that help us maintain your session and preferences. As a mobile app, Marketer-Pro uses app storage (AsyncStorage / Capacitor Preferences) rather than browser cookies for most functions.' },
          { title: 'What We Store Locally', body: 'We store your authentication session token locally to keep you logged in between sessions. We store your last-selected brand and notification preferences locally for performance. We do not use advertising cookies or tracking pixels.' },
          { title: 'Analytics', body: 'We use anonymous usage analytics to understand how the app is used and improve it. This data does not contain personal identifiers. You can opt out of analytics in Settings → Notifications.' },
          { title: 'Third Parties', body: 'Stripe may use cookies when you visit the billing portal (a Stripe-hosted page). Social platforms you connect to have their own cookie policies which govern your use of those platforms.' },
          { title: 'Control', body: `You can clear all locally stored app data by deleting and reinstalling the app, or by using the Export and Delete Account flow in Settings. Contact ${SUPPORT.email} for questions.` },
        ].map(({ title, body }) => (
          <div key={title}>
            <Text variant="gold" size="sm" weight="bold" uppercase style={{ letterSpacing: letterSpacings.wider, marginBottom: 10, display: 'block' }}>{title}</Text>
            <Text variant="tertiary" size="base" style={{ lineHeight: 1.8 }}>{body}</Text>
          </div>
        ))}
      </Stack>
    </Container>
  );
      }    { tech: 'onboarding_complete', purpose: 'Prevents onboarding from repeating',                     duration: 'Persistent' },
  ];

  const functionalRows: TableRow[] = [
    { tech: 'desk_layout_prefs', purpose: 'Remembers panel open/closed state',                        duration: 'Persistent' },
    { tech: 'calendar_view_month', purpose: 'Remembers last viewed month',                            duration: 'Session'    },
    { tech: 'artifact_filter',   purpose: 'Remembers last selected artifact filter',                  duration: 'Session'    },
    { tech: 'theme_preference',  purpose: 'Stores your selected office theme',                        duration: 'Persistent' },
  ];

  const analyticsRows: TableRow[] = [
    { tech: 'anon_session_id',   purpose: 'Aggregates feature usage anonymously',                     duration: 'Session only' },
    { tech: 'feature_counts',    purpose: 'Counts how often features are used (aggregated)',           duration: '90 days'      },
  ];

  return (
    <div className="min-h-screen bg-void-900 safe-top">
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-void-900/95 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <p className="font-display text-base tracking-[0.15em] text-classified">COOKIE POLICY</p>
          <p className="font-classified text-[9px] tracking-[0.2em] text-slate-600">LAST UPDATED 1 JANUARY 2026</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8 safe-bottom">
        <Section title="What We Use">
          <p>Marketer Pro Office uses local storage and secure session tokens — not traditional browser cookies — to make the app function. We do not use third-party advertising cookies or cross-site tracking.</p>
        </Section>

        <Section title="Strictly Necessary">
          <p>Required for the app to work. Cannot be disabled.</p>
          <PolicyTable rows={necessaryRows} />
        </Section>

        <Section title="Functional">
          <p>Improve your experience by remembering preferences. Cleared on logout or by going to Settings → Account → Clear App Data.</p>
          <PolicyTable rows={functionalRows} />
        </Section>

        <Section title="Anonymous Analytics">
          <p>Help us understand how the app is used. No data is linked to your identity. Disable at Settings → Privacy → Analytics.</p>
          <PolicyTable rows={analyticsRows} />
        </Section>

        <Section title="What We Do Not Use">
          <p>We do not use advertising cookies, cross-app tracking identifiers (IDFA / AAID), social media pixels, or browser fingerprinting. We do not share any tracking data with advertising networks.</p>
        </Section>

        <Section title="Your Choices">
          <p>Clear all local data: <strong className="text-slate-300">Settings → Account → Clear App Data</strong></p>
          <p>Sign out all devices: <strong className="text-slate-300">Settings → Security → Sign Out All Devices</strong></p>
          <p>Disable analytics: <strong className="text-slate-300">Settings → Privacy → Analytics</strong></p>
        </Section>

        <Section title="Contact">
          <p>For questions about this policy: <span className="text-classified">privacy@marketerprooffice.com</span></p>
        </Section>
      </div>
    </div>
  );
};
