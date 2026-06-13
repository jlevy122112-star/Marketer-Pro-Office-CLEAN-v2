'use client';

// ─────────────────────────────────────────────────────────────────────────────
// DESK PAGE — Main Create Tab
// The command center. Generator form + department grid + recent artifacts.
// Wired to CinematicEngineProvider and RewardEngine.
// Real API calls only — no mock data.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, LayoutGrid, BookOpen } from 'lucide-react';

import { CinematicEngineProvider }   from '@marketer-pro/cinematic-engine';
import { GeneratorForm }              from '@marketer-pro/cinematic-engine';
import {
  useOfficeEvolution,
  LevelUpCelebration,
  AchievementToast,
  XPBar,
  StreakBadge,
  DepartmentGrid,
} from '@marketer-pro/reward-engine';
import {
  Container,
  Stack,
  Row,
  Card,
  Heading,
  Text,
  Badge,
  Panel,
} from '@marketer-pro/ui';
import { colors, fonts, fontSizes, fontWeights, letterSpacings, space } from '@marketer-pro/ui';

import { useAuth }             from '../contexts/AuthContext';
import { useBrandContext }     from '../contexts/BrandContext';
import { useProgressionContext } from '../contexts/ProgressionContext';
import { api }                 from '../lib/api';

import type {
  GenerationRequest,
  GenerationResult,
  GeneratedArtifact,
} from '@marketer-pro/cinematic-engine';
import type { Department, Achievement } from '@marketer-pro/reward-engine';

// ── Sub-view types ────────────────────────────────────────────────────────────
type DeskView = 'create' | 'departments' | 'vault';

// ─────────────────────────────────────────────────────────────────────────────
export default function DeskPage() {
  const { session }    = useAuth();
  const { activeBrand } = useBrandContext();
  const progression    = useProgressionContext();

  const [view, setView]         = useState<DeskView>('create');
  const [savedArtifacts, setSavedArtifacts] = useState<GeneratedArtifact[]>([]);
  const [levelUpData, setLevelUpData]       = useState<{ level: number; depts: Department[] } | null>(null);
  const [pendingAchievement, setPendingAchievement] = useState<Achievement | null>(null);

  // ── Reward engine ────────────────────────────────────────────────────────
  const rewardEngine = useOfficeEvolution({
    getToken: async () => session?.access_token ?? null,
    recordLoginOnMount: false, // AuthContext handles login recording
    onLevelUp: (newLevel, unlockedDepartments) => {
      setLevelUpData({ level: newLevel, depts: unlockedDepartments });
    },
    onAchievement: (achievement) => {
      setPendingAchievement(achievement);
    },
    onStreakMilestone: (days) => {
      // Toast is handled by the achievement system for streaks
      console.info(`[DeskPage] Streak milestone: ${days} days`);
    },
  });

  // ── Real generation API call — passed to cinematic engine ────────────────
  const handleGenerate = useCallback(async (
    request: GenerationRequest,
  ): Promise<GenerationResult> => {
    const result = await api.post<GenerationResult>('/content/generate', request);
    // Record XP event after successful generation
    await rewardEngine.recordContentGenerated();
    return result;
  }, [rewardEngine]);

  // ── Artifact save ────────────────────────────────────────────────────────
  const handleArtifactSave = useCallback((artifact: GeneratedArtifact) => {
    setSavedArtifacts((prev) => {
      const exists = prev.some((a) => a.id === artifact.id);
      if (exists) return prev;
      return [artifact, ...prev];
    });
    rewardEngine.recordArtifactSaved();
  }, [rewardEngine]);

  // ── Schedule post ────────────────────────────────────────────────────────
  const handleSchedule = useCallback(async (
    artifact: GeneratedArtifact,
    scheduledFor: string,
  ) => {
    await api.post('/content/schedule', {
      artifactId:   artifact.id,
      platform:     artifact.platform,
      content:      artifact.copy,
      hashtags:     artifact.hashtags,
      altText:      artifact.altText,
      scheduledFor,
    });
    await rewardEngine.recordPostScheduled();
  }, [rewardEngine]);

  // ── Report content — Apple 1.2 / Google AI Policy ────────────────────────
  const handleReportContent = useCallback(async (
    artifact: GeneratedArtifact,
    reason: string,
  ) => {
    await api.post('/content/report', {
      artifactId: artifact.id,
      reason,
      platform:   artifact.platform,
    });
  }, []);

  // ── Navigate into a department scene ─────────────────────────────────────
  const handleEnterDepartment = useCallback((dept: Department) => {
    // Navigation handled by AppRouter
    // Each department maps to a scene in apps/mobile-client/src/scenes/
    window.dispatchEvent(new CustomEvent('navigate-scene', { detail: dept.scene }));
  }, []);

  const officeState = rewardEngine.state;

  return (
    <CinematicEngineProvider
      onGenerate={handleGenerate}
      onArtifactSave={handleArtifactSave}
      onSchedule={handleSchedule}
      onReportContent={handleReportContent}
    >
      <Container tabBarOffset>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div style={{ padding: `${space[4]} ${space[5]} ${space[3]}` }}>
          <Row justify="space-between" align="flex-start">
            <div>
              <Heading level={2} gold>
                {view === 'create'      ? 'Digital Office'
                : view === 'departments' ? 'Departments'
                : 'Artifact Vault'}
              </Heading>
              <Text variant="faint" size="sm" style={{ marginTop: 3 }}>
                {activeBrand?.name
                  ? `${activeBrand.name} · CMO Level ${officeState?.level ?? 1}`
                  : `CMO Level ${officeState?.level ?? 1}`}
              </Text>
            </div>
            <Row gap={10} align="center">
              {officeState && (
                <StreakBadge streak={officeState.streak} size="sm" />
              )}
              <XPBar state={officeState} compact />
            </Row>
          </Row>
        </div>

        {/* ── View switcher ───────────────────────────────────────────────── */}
        <div style={{
          display:    'flex',
          gap:        8,
          padding:    `0 ${space[5]}`,
          marginBottom: space[5],
          overflowX:  'auto',
          scrollbarWidth: 'none',
        }}>
          {([
            { id: 'create'      as const, label: 'Create',      Icon: Zap },
            { id: 'departments' as const, label: 'Departments',  Icon: LayoutGrid },
            { id: 'vault'       as const, label: 'Vault',        Icon: BookOpen },
          ]).map(({ id, label, Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={view === id}
              onClick={() => setView(id)}
              style={{
                display:       'flex',
                alignItems:    'center',
                gap:           6,
                padding:       '8px 12px',
                borderRadius:  12,
                fontFamily:    fonts.display,
                fontSize:      fontSizes.xs,
                fontWeight:    fontWeights.bold,
                letterSpacing: letterSpacings.wider,
                textTransform: 'uppercase',
                cursor:        'pointer',
                background:    view === id ? colors.classified.faint : 'rgba(255,255,255,0.04)',
                border:        `1px solid ${view === id ? colors.classified.border : colors.border.subtle}`,
                color:         view === id ? colors.classified.DEFAULT : colors.text.faint,
                flexShrink:    0,
                transition:    'all 0.2s',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <Icon size={12} aria-hidden />
              {label}
            </button>
          ))}
        </div>

        {/* ── Main content ────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">

          {/* CREATE VIEW */}
          {view === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ padding: `0 ${space[5]}`, display: 'flex', flexDirection: 'column', gap: space[4] }}
            >
              {/* KPI grid — real data from progression + analytics */}
              <KPIGrid officeState={officeState} />

              {/* Generator form */}
              <GeneratorForm
                brandId={activeBrand?.id ?? 'default'}
                defaultTone={activeBrand?.tone ?? 'professional'}
              />
            </motion.div>
          )}

          {/* DEPARTMENTS VIEW */}
          {view === 'departments' && (
            <motion.div
              key="departments"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ padding: `0 ${space[5]}` }}
            >
              {rewardEngine.loading ? (
                <Stack gap={8}>
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} loading style={{ height: 72 }} />
                  ))}
                </Stack>
              ) : officeState ? (
                <DepartmentGrid
                  departments={officeState.departments}
                  onEnter={handleEnterDepartment}
                />
              ) : null}
            </motion.div>
          )}

          {/* VAULT VIEW — saved artifacts */}
          {view === 'vault' && (
            <motion.div
              key="vault"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ padding: `0 ${space[5]}` }}
            >
              {savedArtifacts.length === 0 ? (
                <VaultEmptyState />
              ) : (
                <Stack gap={10}>
                  {savedArtifacts.map((artifact) => (
                    <ArtifactCard key={artifact.id} artifact={artifact} />
                  ))}
                </Stack>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Container>

      {/* Level-up celebration overlay */}
      <AnimatePresence>
        {levelUpData && (
          <LevelUpCelebration
            level={levelUpData.level}
            unlockedDepartments={levelUpData.depts}
            onDismiss={() => setLevelUpData(null)}
          />
        )}
      </AnimatePresence>

      {/* Achievement toast */}
      <AchievementToast
        achievement={pendingAchievement}
        onDismiss={() => setPendingAchievement(null)}
      />
    </CinematicEngineProvider>
  );
}

// ── KPI Grid ──────────────────────────────────────────────────────────────────
// Shows real stats from the progression state — no fake numbers
function KPIGrid({ officeState }: { officeState: ReturnType<typeof useOfficeEvolution>['state'] }) {
  const stats = [
    {
      label: 'Total Posts',
      value: officeState?.totalPosts != null ? String(officeState.totalPosts) : '—',
      sub:   'published',
      color: colors.classified.DEFAULT,
    },
    {
      label: 'Generations',
      value: officeState?.totalGenerations != null ? String(officeState.totalGenerations) : '—',
      sub:   'all time',
      color: colors.reactor.DEFAULT,
    },
    {
      label: 'Streak',
      value: officeState?.streak.currentStreak != null ? `${officeState.streak.currentStreak}d` : '—',
      sub:   'current',
      color: '#FBBF24',
    },
    {
      label: 'Level',
      value: officeState?.level != null ? String(officeState.level) : '—',
      sub:   'current rank',
      color: '#60A5FA',
    },
  ];

  return (
    <div style={{
      display:             'grid',
      gridTemplateColumns: '1fr 1fr',
      gap:                 10,
    }}>
      {stats.map((s) => (
        <Card
          key={s.label}
          accent={s.color}
          padding="14px"
          style={{ borderRadius: 16 }}
        >
          <Text
            variant="faint"
            size="2xs"
            weight="bold"
            uppercase
            style={{ letterSpacing: letterSpacings.widest, marginBottom: 6 }}
          >
            {s.label}
          </Text>
          <Text
            variant="primary"
            size="2xl"
            weight="extrabold"
            style={{ fontFamily: fonts.display, lineHeight: 1 }}
          >
            {s.value}
          </Text>
          <Text variant="faint" size="xs" style={{ marginTop: 3 }}>
            {s.sub}
          </Text>
        </Card>
      ))}
    </div>
  );
}

// ── Vault empty state ─────────────────────────────────────────────────────────
function VaultEmptyState() {
  return (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      gap:            16,
      padding:        '48px 24px',
      borderRadius:   20,
      background:     'rgba(255,255,255,0.02)',
      border:         `1px dashed ${colors.border.subtle}`,
      textAlign:      'center',
    }}>
      <div style={{
        width:          52,
        height:         52,
        borderRadius:   15,
        background:     colors.classified.ghost,
        border:         `1px dashed ${colors.classified.border}`,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize:       24,
      }} aria-hidden>
        🗄️
      </div>
      <div>
        <Text variant="faint" size="xs" weight="bold" uppercase style={{ letterSpacing: letterSpacings.widest, marginBottom: 6 }}>
          Vault is empty
        </Text>
        <Text variant="faint" size="sm" style={{ maxWidth: 220, lineHeight: 1.6 }}>
          Generate content and tap Save to store your best artifacts here.
        </Text>
      </div>
    </div>
  );
}

// ── Artifact Card ─────────────────────────────────────────────────────────────
function ArtifactCard({ artifact }: { artifact: GeneratedArtifact }) {
  const PLATFORM_COLORS: Record<string, string> = {
    facebook:  '#1877F2',
    instagram: '#E4405F',
    twitter:   '#000000',
    linkedin:  '#0A66C2',
    tiktok:    '#FF0050',
  };
  const color = PLATFORM_COLORS[artifact.platform] ?? colors.classified.DEFAULT;

  return (
    <Card accent={color} padding="14px" style={{ borderRadius: 16 }}>
      <Row justify="space-between" align="center" style={{ marginBottom: 8 }}>
        <Row gap={8} align="center">
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: color,
          }} aria-hidden />
          <Text
            variant="faint"
            size="2xs"
            weight="bold"
            uppercase
            style={{ letterSpacing: letterSpacings.widest }}
          >
            {artifact.platform}
          </Text>
        </Row>
        {typeof artifact.score === 'number' && (
          <Badge variant={artifact.score >= 80 ? 'teal' : 'gold'}>
            {artifact.score}
          </Badge>
        )}
      </Row>
      <Text
        variant="secondary"
        size="base"
        style={{
          lineHeight:        1.55,
          display:           '-webkit-box',
          WebkitLineClamp:   3,
          WebkitBoxOrient:   'vertical',
          overflow:          'hidden',
          marginBottom:      artifact.hashtags.length > 0 ? 8 : 0,
        }}
      >
        {artifact.copy}
      </Text>
      {artifact.hashtags.length > 0 && (
        <Text
          variant="teal"
          size="xs"
          mono
          style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {artifact.hashtags.slice(0, 5).map((h) => `#${h}`).join(' ')}
        </Text>
      )}
    </Card>
  );
}
