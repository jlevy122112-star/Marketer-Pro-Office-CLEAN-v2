'use client';

import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Container, Stack, Heading, Text, Panel } from '@marketer-pro/ui';
import { colors, fonts, fontSizes, fontWeights, letterSpacings, space } from '@marketer-pro/ui';
import { SUPPORT } from '../../lib/constants';

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Information We Collect',
      body: `We collect information you provide directly: name, email address, and brand details when you create an account. We collect content you generate and social platform connection tokens to enable publishing on your behalf. We collect usage data including features used, content generated, and posts published to improve the service and display your analytics.`,
    },
    {
      title: 'How We Use Your Information',
      body: `We use your information to provide and operate the Marketer-Pro service, process AI content generation requests, publish content to your connected social platforms, and send product and billing notifications you have opted into. We do not sell your personal data to any third party.`,
    },
    {
      title: 'Data Storage and Security',
      body: `Your data is stored in Supabase on AES-256 encrypted databases hosted in secure cloud infrastructure. Authentication tokens for social platforms are encrypted at rest. We employ industry-standard security practices including SOC 2-aligned controls, HTTPS-only communication, and regular security reviews.`,
    },
    {
      title: 'Third-Party Services',
      body: `We use Anthropic Claude for AI content generation, Stripe for payment processing, Supabase for database and authentication, and Railway for backend hosting. Each service has its own privacy policy. Social platform tokens are used exclusively to publish content on your behalf and are never shared with other users.`,
    },
    {
      title: 'Data Retention',
      body: `We retain your data for as long as your account is active. If you delete your account, we remove your personal data within 30 days, with the exception of billing records which are retained for 7 years as required by law. You may export all your data at any time from Settings → Export My Data.`,
    },
    {
      title: 'Your Rights',
      body: `You have the right to access, correct, or delete your personal data at any time. You can export all data from Settings, edit your profile in Settings → Account, delete your account in Settings → Danger Zone, or contact us directly at ${SUPPORT.email} for any data request.`,
    },
    {
      title: 'Children\'s Privacy',
      body: `Marketer-Pro is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with their information, please contact us immediately.`,
    },
    {
      title: 'Contact',
      body: `For privacy questions, data requests, or to exercise your rights, contact us at ${SUPPORT.email}. We respond to all requests within 5 business days.`,
    },
  ];

  return (
    <Container tabBarOffset={false}>
      <div style={{ padding: `${space[4]} ${space[5]} ${space[3]}` }}>
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          style={{ color: colors.text.tertiary, background: 'none', border: 'none', cursor: 'pointer', padding: 4, marginBottom: space[4] }}
        >
          <ArrowLeft size={20} />
        </button>
        <Heading level={2} gold>Privacy Policy</Heading>
        <Text variant="faint" size="sm" style={{ marginTop: 6 }}>
          Last updated: June 2026
        </Text>
      </div>

      <Stack gap={20} style={{ padding: `0 ${space[5]} ${space[10]}` }}>
        <Text variant="tertiary" size="base" style={{ lineHeight: 1.7 }}>
          Marketer-Pro Office Edition ("we", "us", or "our") is committed to protecting your personal information. This policy explains what we collect, how we use it, and your rights.
        </Text>

        {sections.map(({ title, body }) => (
          <div key={title}>
            <Text
              variant="gold"
              size="sm"
              weight="bold"
              uppercase
              style={{ letterSpacing: letterSpacings.wider, marginBottom: 10, display: 'block' }}
            >
              {title}
            </Text>
            <Text variant="tertiary" size="base" style={{ lineHeight: 1.8 }}>
              {body}
            </Text>
          </div>
        ))}
      </Stack>
    </Container>
  );
}
