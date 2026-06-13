'use client';

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT FORGE SCENE
// The cinematic generation flow in department mode.
// Wraps the CinematicEngineProvider with a full-screen scene entry.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CinematicEngineProvider, GeneratorForm } from '@marketer-pro/cinematic-engine';
import { Container, Heading, Row } from '@marketer-pro/ui';
import { colors, space } from '@marketer-pro/ui';
import { useBrandContext }  from '../contexts/BrandContext';
import { useToast }          from '../contexts/ToastContext';
import { api }               from '../lib/api';
import type { GenerationRequest, GenerationResult, GeneratedArtifact } from '@marketer-pro/cinematic-engine';

export default function ContentForgeScene() {
  const navigate          = useNavigate();
  const { activeBrand }   = useBrandContext();
  const { success }       = useToast();

  const handleGenerate = useCallback(async (req: GenerationRequest): Promise<GenerationResult> => {
    return api.post<GenerationResult>('/content/generate', req);
  }, []);

  const handleSave = useCallback((artifact: GeneratedArtifact) => {
    success('Saved to Artifact Vault');
  }, [success]);

  const handleSchedule = useCallback(async (artifact: GeneratedArtifact, scheduledFor: string) => {
    await api.post('/content/schedule', { artifactId: artifact.id, platform: artifact.platform, content: artifact.copy, scheduledFor });
    success('Post scheduled');
  }, [success]);

  const handleReport = useCallback(async (artifact: GeneratedArtifact, reason: string) => {
    await api.post('/content/report', { artifactId: artifact.id, reason, platform: artifact.platform });
  }, []);

  return (
    <CinematicEngineProvider
      onGenerate={handleGenerate}
      onArtifactSave={handleSave}
      onSchedule={handleSchedule}
      onReportContent={handleReport}
    >
      <div style={{ position: 'fixed', inset: 0, background: colors.void[900], display: 'flex', flexDirection: 'column', paddingTop: 'var(--sat,0px)' }}>
        <Row gap={12} align="center" style={{ padding: `${space[4]} ${space[5]} ${space[3]}` }}>
          <button onClick={() => navigate(-1)} aria-label="Back" style={{ color: colors.text.tertiary, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><ArrowLeft size={20} /></button>
          <Heading level={2} gold style={{ flex: 1 }}>Content Forge</Heading>
          <span style={{ fontSize: 24 }} aria-hidden>⚡</span>
        </Row>
        <div style={{ flex: 1, overflowY: 'auto', padding: `0 ${space[5]}`, WebkitOverflowScrolling: 'touch' }}>
          <GeneratorForm
            brandId={activeBrand?.id ?? 'default'}
            defaultTone={activeBrand?.tone ?? 'professional'}
          />
        </div>
      </div>
    </CinematicEngineProvider>
  );
}
