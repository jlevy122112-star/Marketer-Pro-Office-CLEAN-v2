'use client';

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Stack, Row, Heading, Text, Input, Button } from '@marketer-pro/ui';
import { colors, fonts, fontSizes, fontWeights, letterSpacings, space, radii } from '@marketer-pro/ui';
import { BRAND_TONES } from '@marketer-pro/cinematic-engine';
import { useBrandContext } from '../contexts/BrandContext';
import { useToast }        from '../contexts/ToastContext';
import { api }             from '../lib/api';
import type { BrandTone } from '@marketer-pro/cinematic-engine';

interface BrandData { id: string; name: string; industry: string; tone: BrandTone; targetAudience: string; }

export default function BrandIdentityChamber() {
  const navigate              = useNavigate();
  const { activeBrand, setActiveBrand } = useBrandContext();
  const { success, error: toastError }  = useToast();
  const [name, setName]           = useState('');
  const [industry, setIndustry]   = useState('');
  const [tone, setTone]           = useState<BrandTone>('professional');
  const [audience, setAudience]   = useState('');
  const [saving, setSaving]       = useState(false);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!activeBrand?.id) { setLoading(false); return; }
    api.get<BrandData>(`/brands/${activeBrand.id}`)
      .then((b) => { setName(b.name); setIndustry(b.industry); setTone(b.tone as BrandTone); setAudience(b.targetAudience); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeBrand?.id]);

  const handleSave = useCallback(async () => {
    if (!activeBrand?.id || !name.trim()) return;
    setSaving(true);
    try {
      await api.patch(`/brands/${activeBrand.id}`, { name: name.trim(), industry, tone, targetAudience: audience });
      setActiveBrand({ ...activeBrand, name: name.trim(), tone });
      success('Brand updated');
    } catch (e) {
      toastError('Save failed', e instanceof Error ? e.message : undefined);
    } finally { setSaving(false); }
  }, [activeBrand, name, industry, tone, audience, setActiveBrand, success, toastError]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: colors.void[900], display: 'flex', flexDirection: 'column', paddingTop: 'var(--sat,0px)' }}>
      <Row gap={12} align="center" style={{ padding: `${space[4]} ${space[5]} ${space[3]}` }}>
        <button onClick={() => navigate(-1)} aria-label="Back" style={{ color: colors.text.tertiary, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><ArrowLeft size={20} /></button>
        <Heading level={2} gold style={{ flex: 1 }}>Brand Identity</Heading>
        <span style={{ fontSize: 24 }} aria-hidden>🏛️</span>
      </Row>

      <div style={{ flex: 1, overflowY: 'auto', padding: `0 ${space[5]} ${space[8]}`, WebkitOverflowScrolling: 'touch' }}>
        {loading ? (
          <Stack gap={12}>{[80,80,200,80].map((h,i) => <div key={i} style={{ height: h, borderRadius: radii.xl, background: 'rgba(255,255,255,0.04)' }} />)}</Stack>
        ) : (
          <Stack gap={20}>
            <Text variant="tertiary" size="base" style={{ lineHeight: 1.7 }}>Define your brand voice so the AI generates content that sounds like you, every time.</Text>
            <Input label="Brand Name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="organization" />
            <Input label="Industry" value={industry} onChange={(e) => setIndustry(e.target.value)} />
            <Input label="Target Audience" value={audience} onChange={(e) => setAudience(e.target.value)} />
            <div>
              <Text variant="faint" size="2xs" weight="bold" uppercase style={{ letterSpacing: letterSpacings.widest, marginBottom: 10, display: 'block' }}>Brand Tone</Text>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {BRAND_TONES.map((t) => (
                  <button key={t.id} onClick={() => setTone(t.id)} aria-pressed={tone === t.id}
                    style={{ textAlign: 'left', padding: '12px 14px', borderRadius: radii.lg, background: tone === t.id ? colors.classified.ghost : 'rgba(255,255,255,0.03)', border: `1px solid ${tone === t.id ? colors.classified.border : colors.border.subtle}`, cursor: 'pointer', transition: 'all 0.2s' }}>
                    <Text variant={tone === t.id ? 'gold' : 'primary'} size="sm" weight="bold" style={{ display: 'block', marginBottom: 3 }}>{t.label}</Text>
                  </button>
                ))}
              </div>
            </div>
            <Button variant="primary" size="lg" fullWidth loading={saving} onClick={handleSave} leftIcon={<Save size={15} />}>
              Save Brand Identity
            </Button>
          </Stack>
        )}
      </div>
    </div>
  );
}
