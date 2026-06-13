'use client';

import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Stack, Row, Card, Heading, Text } from '@marketer-pro/ui';
import { colors, fonts, fontSizes, fontWeights, letterSpacings, space, radii } from '@marketer-pro/ui';

const HUB_TOOLS = [
  { icon: '✍️', title: 'Caption Writer',       desc: 'Write optimized captions for any platform' },
  { icon: '🔑', title: 'Hashtag Generator',    desc: 'Find trending and niche hashtags for your content' },
  { icon: '🎨', title: 'Visual Prompt Builder', desc: 'Create DALL-E prompts for your AI images' },
  { icon: '📊', title: 'A/B Headline Tester',  desc: 'Compare two headlines and pick the winner' },
  { icon: '📅', title: 'Best Time Calculator', desc: 'Optimal posting times for your audience' },
  { icon: '🔁', title: 'Content Repurposer',   desc: 'Turn one post into five platform variants' },
];

export default function CreatorHubScene() {
  const navigate = useNavigate();

  return (
    <div style={{ position: 'fixed', inset: 0, background: colors.void[900], display: 'flex', flexDirection: 'column', paddingTop: 'var(--sat,0px)' }}>
      <Row gap={12} align="center" style={{ padding: `${space[4]} ${space[5]} ${space[3]}` }}>
        <button onClick={() => navigate(-1)} aria-label="Back" style={{ color: colors.text.tertiary, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><ArrowLeft size={20} /></button>
        <Heading level={2} gold style={{ flex: 1 }}>Creator Hub</Heading>
        <span style={{ fontSize: 24 }} aria-hidden>🎨</span>
      </Row>

      <div style={{ flex: 1, overflowY: 'auto', padding: `0 ${space[5]} ${space[8]}`, WebkitOverflowScrolling: 'touch' }}>
        <Text variant="tertiary" size="base" style={{ lineHeight: 1.7, marginBottom: space[5] }}>
          Specialized AI tools to enhance your content strategy.
        </Text>
        <Stack gap={10}>
          {HUB_TOOLS.map((tool) => (
            <button
              key={tool.title}
              aria-label={tool.title}
              style={{
                display:       'flex',
                alignItems:    'center',
                gap:           14,
                padding:       '14px 16px',
                borderRadius:  radii.xl,
                background:    'rgba(255,255,255,0.03)',
                border:        `1px solid ${colors.border.subtle}`,
                cursor:        'pointer',
                textAlign:     'left',
                transition:    'all 0.2s',
                width:         '100%',
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: radii.lg, background: colors.classified.ghost, border: `1px solid ${colors.classified.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }} aria-hidden>
                {tool.icon}
              </div>
              <div style={{ flex: 1 }}>
                <Text variant="primary" size="base" weight="bold" style={{ fontFamily: fonts.display, marginBottom: 3 }}>{tool.title}</Text>
                <Text variant="faint" size="xs">{tool.desc}</Text>
              </div>
              <span style={{ color: colors.classified.dim, fontSize: 18 }} aria-hidden>›</span>
            </button>
          ))}
        </Stack>

        <div style={{ marginTop: space[8], padding: space[4], borderRadius: radii.xl, background: colors.classified.ghost, border: `1px solid ${colors.classified.border}`, textAlign: 'center' }}>
          <Text variant="faint" size="2xs" weight="bold" uppercase style={{ letterSpacing: letterSpacings.widest, marginBottom: 8, display: 'block' }}>More Tools Coming</Text>
          <Text variant="faint" size="sm" style={{ lineHeight: 1.6 }}>New Creator Hub tools are added with each update. Unlock more tools as you level up.</Text>
        </div>
      </div>
    </div>
  );
}
