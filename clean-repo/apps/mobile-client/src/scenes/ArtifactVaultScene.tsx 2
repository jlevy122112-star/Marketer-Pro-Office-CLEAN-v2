'use client';

// ─────────────────────────────────────────────────────────────────────────────
// ARTIFACT VAULT SCENE
// Library of all saved and published content.
// Fetches real data from /content endpoint. Filter by platform and status.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search } from 'lucide-react';
import {
  Container, Stack, Row, Card, Heading, Text, Badge, Chip,
} from '@marketer-pro/ui';
import { colors, fonts, fontSizes, fontWeights, letterSpacings, space, radii } from '@marketer-pro/ui';
import { ACTIVE_PLATFORMS } from '@marketer-pro/cinematic-engine';
import { api } from '../lib/api';

type StatusFilter = 'all' | 'published' | 'scheduled' | 'draft';

interface ContentItem {
  id:          string;
  platform:    string;
  copy:        string;
  hashtags:    string[];
  status:      StatusFilter;
  score?:      number;
  publishedAt?: string;
  scheduledFor?: string;
  createdAt:   string;
}

const PLATFORM_COLORS: Record<string, string> = {
  facebook:  '#1877F2',
  instagram: '#E4405F',
  twitter:   '#000000',
  linkedin:  '#0A66C2',
  tiktok:    '#FF0050',
};

export default function ArtifactVaultScene() {
  const navigate = useNavigate();
  const [items, setItems]           = useState<ContentItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [search, setSearch]         = useState('');
  const [platform, setPlatform]     = useState<string>('all');
  const [status, setStatus]         = useState<StatusFilter>('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (platform !== 'all') params.set('platform', platform);
      if (status   !== 'all') params.set('status',   status);
      const data = await api.get<ContentItem[]>(`/content?${params}`);
      setItems(data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load vault');
    } finally {
      setLoading(false);
    }
  }, [platform, status]);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter((item) =>
    search
      ? item.copy.toLowerCase().includes(search.toLowerCase()) ||
        item.hashtags.some((h) => h.toLowerCase().includes(search.toLowerCase()))
      : true,
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: colors.void[900], display: 'flex', flexDirection: 'column', paddingTop: 'var(--sat,0px)' }}>

      {/* Header */}
      <Row gap={12} align="center" style={{ padding: `${space[4]} ${space[5]} ${space[3]}` }}>
        <button onClick={() => navigate(-1)} aria-label="Back"
          style={{ color: colors.text.tertiary, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <Heading level={2} gold>Artifact Vault</Heading>
          <Text variant="faint" size="xs" style={{ marginTop: 2 }}>
            {loading ? '…' : `${filtered.length} items`}
          </Text>
        </div>
        <span style={{ fontSize: 24 }} aria-hidden>🗄️</span>
      </Row>

      {/* Search */}
      <div style={{ padding: `0 ${space[5]}`, marginBottom: space[3] }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} color={colors.text.faint} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} aria-hidden />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search artifacts…"
            aria-label="Search artifacts"
            style={{
              width:        '100%',
              padding:      '11px 14px 11px 38px',
              borderRadius: radii.lg,
              background:   'rgba(255,255,255,0.04)',
              border:       `1px solid ${colors.border.subtle}`,
              color:        colors.text.primary,
              fontFamily:   fonts.body,
              fontSize:     fontSizes.base,
              outline:      'none',
              boxSizing:    'border-box',
            }}
          />
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, padding: `0 ${space[5]}`, marginBottom: space[4], overflowX: 'auto', scrollbarWidth: 'none' }}>
        <Chip active={platform === 'all'} onClick={() => setPlatform('all')}>All</Chip>
        {ACTIVE_PLATFORMS.map((p) => (
          <Chip key={p.id} active={platform === p.id} color={p.color} onClick={() => setPlatform(p.id)}>
            {p.name}
          </Chip>
        ))}
      </div>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: 6, padding: `0 ${space[5]}`, marginBottom: space[4], overflowX: 'auto', scrollbarWidth: 'none' }}>
        {(['all','published','scheduled','draft'] as StatusFilter[]).map((s) => (
          <Chip key={s} active={status === s} onClick={() => setStatus(s)} style={{ textTransform: 'capitalize' }}>
            {s}
          </Chip>
        ))}
      </div>

      {/* Content list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: `0 ${space[5]} ${space[5]}`, WebkitOverflowScrolling: 'touch' }}>
        {loading ? (
          <Stack gap={10}>
            {[1,2,3,4].map((i) => <Card key={i} loading style={{ height: 100 }} />)}
          </Stack>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text variant="error" size="base">{error}</Text>
            <button onClick={load} style={{ marginTop: 12, color: colors.classified.DEFAULT, background: 'none', border: 'none', cursor: 'pointer', fontFamily: fonts.display, fontSize: fontSizes.sm, fontWeight: fontWeights.bold, letterSpacing: letterSpacings.wider, textTransform: 'uppercase' }}>
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }} aria-hidden>🗄️</div>
            <Text variant="faint" size="xs" weight="bold" uppercase style={{ letterSpacing: letterSpacings.widest }}>
              {search ? 'No results found' : 'Vault is empty'}
            </Text>
            <Text variant="faint" size="sm" style={{ marginTop: 8 }}>
              {search ? 'Try a different search term' : 'Generate and save content to fill your vault'}
            </Text>
          </div>
        ) : (
          <Stack gap={10}>
            {filtered.map((item, i) => {
              const color = PLATFORM_COLORS[item.platform] ?? colors.classified.DEFAULT;
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card accent={color} padding="14px" style={{ borderRadius: radii.xl }}>
                    <Row justify="space-between" align="center" style={{ marginBottom: 8 }}>
                      <Row gap={8} align="center">
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} aria-hidden />
                        <Text variant="faint" size="2xs" weight="bold" uppercase style={{ letterSpacing: letterSpacings.widest }}>
                          {item.platform}
                        </Text>
                      </Row>
                      <Row gap={6} align="center">
                        {typeof item.score === 'number' && (
                          <Badge variant={item.score >= 80 ? 'teal' : 'gold'}>{item.score}</Badge>
                        )}
                        <Badge variant={item.status === 'published' ? 'teal' : item.status === 'scheduled' ? 'gold' : 'neutral'}>
                          {item.status}
                        </Badge>
                      </Row>
                    </Row>
                    <Text variant="secondary" size="base" style={{ lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: item.hashtags.length > 0 ? 8 : 0 }}>
                      {item.copy}
                    </Text>
                    {item.hashtags.length > 0 && (
                      <Text variant="teal" size="xs" mono style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.hashtags.slice(0, 5).map((h) => `#${h}`).join(' ')}
                      </Text>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </Stack>
        )}
      </div>
    </div>
  );
}
