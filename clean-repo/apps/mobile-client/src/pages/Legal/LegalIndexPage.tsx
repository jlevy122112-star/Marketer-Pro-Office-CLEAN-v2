'use client';

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Container, Stack, Heading, Text, Row } from '@marketer-pro/ui';
import { colors, fonts, space, radii, gradients } from '@marketer-pro/ui';
import { SUPPORT } from '../../lib/constants';

const LEGAL_LINKS = [
  { label: 'Privacy Policy',       path: '/legal/privacy',         icon: '🔒' },
  { label: 'Terms of Use',         path: '/legal/terms',           icon: '📋' },
  { label: 'Acceptable Use',       path: '/legal/acceptable-use',  icon: '✅' },
  { label: 'Cookie Policy',        path: '/legal/cookies',         icon: '🍪' },
];

export default function LegalIndexPage() {
  const navigate = useNavigate();

  return (
    <Container tabBarOffset={false}>
      <div style={{ padding: `${space[4]} ${space[5]} ${space[3]}` }}>
        <button onClick={() => navigate(-1)} aria-label="Go back"
          style={{ color: colors.text.tertiary, background: 'none', border: 'none', cursor: 'pointer', padding: 4, marginBottom: space[4] }}>
          <ArrowLeft size={20} />
        </button>
        <Heading level={2} gold>Legal</Heading>
      </div>

      <Stack gap={8} style={{ padding: `0 ${space[5]} ${space[10]}` }}>
        {LEGAL_LINKS.map(({ label, path, icon }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            aria-label={label}
            style={{
              display:       'flex',
              alignItems:    'center',
              gap:           14,
              padding:       '16px',
              borderRadius:  radii.xl,
              background:    'rgba(255,255,255,0.03)',
              border:        `1px solid ${colors.border.subtle}`,
              cursor:        'pointer',
              width:         '100%',
              textAlign:     'left',
              transition:    'all 0.2s',
            }}
          >
            <span style={{ fontSize: 22, flexShrink: 0 }} aria-hidden>{icon}</span>
            <Text variant="secondary" size="base" weight="semibold" style={{ flex: 1, fontFamily: fonts.display }}>
              {label}
            </Text>
            <ChevronRight size={16} color={colors.text.faint} />
          </button>
        ))}

        <div style={{ marginTop: space[6], padding: space[4], borderRadius: radii.xl, background: colors.classified.ghost, border: `1px solid ${colors.classified.border}` }}>
          <Text variant="faint" size="xs" weight="bold" uppercase style={{ letterSpacing: '0.3em', marginBottom: 8, display: 'block' }}>
            Questions?
          </Text>
          <Text variant="tertiary" size="sm" style={{ lineHeight: 1.7 }}>
            Contact us at{' '}
            <span
              onClick={() => window.open(`mailto:${SUPPORT.email}`)}
              style={{ color: colors.classified.DEFAULT, cursor: 'pointer', textDecoration: 'underline' }}
            >
              {SUPPORT.email}
            </span>
          </Text>
        </div>
      </Stack>
    </Container>
  );
            }
