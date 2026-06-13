'use client';

import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Container, Stack, Heading, Text } from '@marketer-pro/ui';
import { colors, space, letterSpacings } from '@marketer-pro/ui';
import { SUPPORT } from '../../lib/constants';

export default function AcceptableUsePage() {
  const navigate = useNavigate();

  return (
    <Container tabBarOffset={false}>
      <div style={{ padding: `${space[4]} ${space[5]} ${space[3]}` }}>
        <button onClick={() => navigate(-1)} aria-label="Go back"
          style={{ color: colors.text.tertiary, background: 'none', border: 'none', cursor: 'pointer', padding: 4, marginBottom: space[4] }}>
          <ArrowLeft size={20} />
        </button>
        <Heading level={2} gold>Acceptable Use Policy</Heading>
        <Text variant="faint" size="sm" style={{ marginTop: 6 }}>Last updated: June 2026</Text>
      </div>
      <Stack gap={20} style={{ padding: `0 ${space[5]} ${space[10]}` }}>
        {[
          { title: 'Permitted Use', body: 'Marketer-Pro may be used for legitimate marketing and content creation purposes for businesses, brands, and individual creators. You must be 18 years or older to use the service.' },
          { title: 'Prohibited Content', body: `You may not use Marketer-Pro to generate or distribute: hate speech or content targeting protected groups, sexually explicit material, content designed to harass or threaten individuals, medical or legal advice presented as professional guidance, misinformation or deliberately false content, spam or unsolicited bulk messaging, or content that violates any applicable law.` },
          { title: 'Platform Compliance', body: 'All content published through Marketer-Pro must comply with the terms of service of the connected social platform (Facebook, Instagram, LinkedIn, X/Twitter, TikTok). Violations of platform terms may result in your social accounts being suspended, for which Marketer-Pro bears no responsibility.' },
          { title: 'AI Content Responsibility', body: 'You are solely responsible for reviewing AI-generated content before publishing. Do not publish content that is inaccurate, misleading, or could harm others. Use the Report Content button on any AI output that appears harmful or objectionable.' },
          { title: 'Enforcement', body: `Violations of this policy may result in immediate account suspension without refund. Repeated violations will result in permanent account termination. Report violations to ${SUPPORT.email}.` },
        ].map(({ title, body }) => (
          <div key={title}>
            <Text variant="gold" size="sm" weight="bold" uppercase style={{ letterSpacing: letterSpacings.wider, marginBottom: 10, display: 'block' }}>{title}</Text>
            <Text variant="tertiary" size="base" style={{ lineHeight: 1.8 }}>{body}</Text>
          </div>
        ))}
      </Stack>
    </Container>
  );
      }          <p className="font-classified text-[9px] tracking-[0.2em] text-slate-600">LAST UPDATED 1 JANUARY 2026</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8 safe-bottom">
        <Section title="What This Is">
          <p>This policy defines what you can and cannot do with Marketer Pro Office and the content you generate using it. Violations may result in account suspension or termination.</p>
        </Section>

        <Section title="Permitted Uses">
          <div className="space-y-2 pt-1">
            <AllowedItem text="Creating and scheduling content for brands you own or are authorised to manage" />
            <AllowedItem text="Generating marketing copy, captions, hashtags, and creative briefs" />
            <AllowedItem text="Publishing to social platforms you own or have explicit permission to post to" />
            <AllowedItem text="Analysing performance metrics for your own campaigns" />
            <AllowedItem text="Collaborating with team members in an Enterprise organisation account" />
          </div>
        </Section>

        <Section title="Prohibited Content">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-classified mb-2">You must not generate or publish content that:</p>
          <div className="space-y-2">
            <ForbiddenItem text="Violates any law or infringes intellectual property, privacy, or other legal rights" />
            <ForbiddenItem text="Constitutes harassment, abuse, threats, or targeted harm" />
            <ForbiddenItem text="Promotes or glorifies violence, self-harm, or harm to others" />
            <ForbiddenItem text="Exploits, harms, or endangers minors in any way" />
            <ForbiddenItem text="Is sexually explicit or pornographic" />
            <ForbiddenItem text="Promotes hatred or discrimination against any group" />
            <ForbiddenItem text="Is intentionally deceptive, impersonates real people or brands without authorisation, or constitutes spam" />
            <ForbiddenItem text="Spreads health misinformation or promotes fraudulent products" />
            <ForbiddenItem text="Violates the terms of service of the social platforms you post to" />
          </div>
        </Section>

        <Section title="Prohibited System Uses">
          <div className="space-y-2">
            <ForbiddenItem text="Attempting to reverse-engineer, decompile, or extract the source code of the app" />
            <ForbiddenItem text="Using bots or automation to abuse the API beyond normal use" />
            <ForbiddenItem text="Attempting to bypass content filters, safety systems, or rate limits" />
            <ForbiddenItem text="Using the Service to train or develop competing AI systems" />
            <ForbiddenItem text="Sharing your account credentials with unauthorised users" />
          </div>
        </Section>

        <Section title="Your Responsibility for AI Content">
          <p>You are solely responsible for reviewing all AI-generated content before publishing it. The AI engine generates suggestions — you are the publisher. We implement content filters but they are not infallible. Ensure all content complies with this policy and applicable platform rules before publishing.</p>
        </Section>

        <Section title="Consequences of Violation">
          <p>Depending on severity, we may issue a warning, remove content, temporarily suspend your account, or permanently terminate your account without refund. Serious violations involving illegal content or child safety will be reported to relevant authorities.</p>
        </Section>

        <Section title="Report a Violation">
          <p>If you encounter content or behaviour that violates this policy: <span className="text-classified">safety@marketerprooffice.com</span></p>
        </Section>

        <Section title="Full Policy">
          <p>The complete Acceptable Use Policy is available at: <span className="text-classified">marketerprooffice.com/legal/acceptable-use</span></p>
        </Section>
      </div>
    </div>
  );
};
