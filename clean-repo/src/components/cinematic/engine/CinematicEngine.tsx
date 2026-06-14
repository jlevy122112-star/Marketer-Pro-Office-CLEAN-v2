// FILE PATH: src/components/cinematic/engine/CinematicEngine.tsx
import { AnimatePresence } from 'framer-motion';
import { useCinematic } from '../../../contexts/CinematicContext';
import { VaultDoorScene } from '../scenes/VaultDoorScene';
import { ReactorScene } from '../scenes/ReactorScene';
import { PresentationChamberScene } from '../scenes/PresentationChamberScene';
import type { GeneratedArtifact } from '../../../types';

interface CinematicEngineProps {
  onArtifactUse: (artifact: GeneratedArtifact) => void;
  onSchedule:    (artifact: GeneratedArtifact) => void;
}

export function CinematicEngine({ onArtifactUse, onSchedule }: CinematicEngineProps) {
  const { state, context, onVaultOpened, onLeverPulled, reset } = useCinematic();

  if (state === 'idle') return null;

  return (
    <AnimatePresence mode="wait">
      {/* ── Act I — Vault Door ──────────────────────────────────────
          FIX: was also checking 'vault_open' which the reducer never emits.
          The reducer goes: vault_intro → (VAULT_OPENED) → reactor_arm
          So only check 'vault_intro' here. */}
      {state === 'vault_intro' && (
        <VaultDoorScene
          key="vault"
          onComplete={onVaultOpened}
          autoTrigger={true}
          autoTriggerDelay={2000}
        />
      )}

      {/* ── Act II — Reactor ────────────────────────────────────────
          FIX: was checking 'reactor_arm' || 'reactor_fire' but the reducer
          emits reactor_arm → (REACTOR_ARMED) → reactor_fire → (LEVER_PULLED) → generating
          Both states correctly show the reactor. ReactorScene handles
          the internal armed/lever state itself. */}
      {(state === 'reactor_arm' || state === 'reactor_fire') && (
        <ReactorScene
          key="reactor"
          onComplete={onLeverPulled}
          onAbort={reset}
        />
      )}

      {/* ── Act III — Presentation Chamber ─────────────────────────
          Shows during generation AND after result arrives. */}
      {(state === 'generating'
        || state === 'presentation'
        || state === 'artifact_select'
        || state === 'error') && (
        <PresentationChamberScene
          key="chamber"
          result={context.result}
          isGenerating={state === 'generating'}
          error={context.error}
          onArtifactUse={onArtifactUse}
          onSchedule={onSchedule}
          onReturn={reset}
        />
      )}
    </AnimatePresence>
  );
}
