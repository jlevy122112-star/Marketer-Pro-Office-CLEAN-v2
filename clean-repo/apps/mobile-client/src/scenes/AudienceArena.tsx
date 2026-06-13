'use client';

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stack, Row, Card, Heading, Text, Input, Button } from '@marketer-pro/ui';
import { colors, fonts, fontSizes, fontWeights, letterSpacings, space, radii, gradients } from '@marketer-pro/ui';
import { useToast } from '../contexts/ToastContext';
import { api }      from '../lib/api';

interface AudienceSegment { id: string; name: string; description: string; ageRange: string; interests: string[]; }

export default function AudienceArena() {
  const navigate   = useNavigate();
  const { success, error: toastError } = useToast();
  const [segments, setSegments]   = useState<AudienceSegment[]>([]);
  const [loading, setLoading]     = useState(true);
  const [adding, setAdding]       = useState(false);
  const [newName, setNewName]     = useState('');
  const [newDesc, setNewDesc]     = useState('');
  const [saving, setSaving]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setSegments(await api.get<AudienceSegment[]>('/brands/audience-segments') ?? []); }
    catch { setSegments([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = useCallback(async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const seg = await api.post<AudienceSegment>('/brands/audience-segments', { name: newName.trim(), description: newDesc.trim(), ageRange: '', interests: [] });
      setSegments((p) => [seg, ...p]);
      setNewName(''); setNewDesc(''); setAdding(false);
      success('Audience segment added');
    } catch (e) { toastError('Failed to add segment'); }
    finally { setSaving(false); }
  }, [newName, newDesc, success, toastError]);

  const handleDelete = useCallback(async (id: string) => {
    setSegments((p) => p.filter((s) => s.id !== id));
    try { await api.delete(`/brands/audience-segments/${id}`); }
    catch { load(); }
  }, [load]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: colors.void[900], display: 'flex', flexDirection: 'column', paddingTop: 'var(--sat,0px)' }}>
      <Row gap={12} align="center" style={{ padding: `${space[4]} ${space[5]} ${space[3]}` }}>
        <button onClick={() => navigate(-1)} aria-label="Back" style={{ color: colors.text.tertiary, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><ArrowLeft size={20} /></button>
        <Heading level={2} gold style={{ flex: 1 }}>Audience Arena</Heading>
        <button onClick={() => setAdding(true)} aria-label="Add segment"
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: radii.lg, background: `linear-gradient(135deg,${colors.classified.DEFAULT},${colors.classified.dark})`, border: 'none', color: '#060912', fontFamily: fonts.display, fontWeight: fontWeights.bold, fontSize: fontSizes.xs, letterSpacing: letterSpacings.wider, textTransform: 'uppercase', cursor: 'pointer' }}>
          <Plus size={13} /> Add
        </button>
      </Row>

      <div style={{ flex: 1, overflowY: 'auto', padding: `0 ${space[5]} ${space[8]}`, WebkitOverflowScrolling: 'touch' }}>
        <Text variant="tertiary" size="base" style={{ lineHeight: 1.7, marginBottom: space[5] }}>Define your audience segments so the AI targets the right people with the right message.</Text>

        <AnimatePresence>
          {adding && (
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <Card variant="glass" style={{ marginBottom: space[4] }}>
                <Stack gap={12}>
                  <Input label="Segment Name" value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus />
                  <Input label="Description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
                  <Row gap={10}>
                    <Button variant="secondary" size="md" onClick={() => setAdding(false)} style={{ flex: 1 }}>Cancel</Button>
                    <Button variant="primary" size="md" loading={saving} onClick={handleAdd} style={{ flex: 2 }}>Save Segment</Button>
                  </Row>
                </Stack>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <Stack gap={10}>{[1,2,3].map((i) => <Card key={i} loading style={{ height: 80 }} />)}</Stack>
        ) : segments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }} aria-hidden>🎯</div>
            <Text variant="faint" size="xs" weight="bold" uppercase style={{ letterSpacing: letterSpacings.widest }}>No segments yet</Text>
            <Text variant="faint" size="sm" style={{ marginTop: 8 }}>Add your first audience segment to guide AI content generation</Text>
          </div>
        ) : (
          <Stack gap={10}>
            {segments.map((seg, i) => (
              <motion.div key={seg.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Card padding="14px" style={{ borderRadius: radii.xl }}>
                  <Row justify="space-between" align="flex-start">
                    <div style={{ flex: 1 }}>
                      <Text variant="primary" size="base" weight="bold" style={{ fontFamily: fonts.display, marginBottom: 4 }}>{seg.name}</Text>
                      {seg.description && <Text variant="tertiary" size="sm" style={{ lineHeight: 1.5 }}>{seg.description}</Text>}
                    </div>
                    <button onClick={() => handleDelete(seg.id)} aria-label={`Delete ${seg.name}`}
                      style={{ color: colors.text.faint, background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
                      <Trash2 size={15} />
                    </button>
                  </Row>
                </Card>
              </motion.div>
            ))}
          </Stack>
        )}
      </div>
    </div>
  );
}
