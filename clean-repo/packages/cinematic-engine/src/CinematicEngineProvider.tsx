'use client';

// ─────────────────────────────────────────────────────────────────────────────
// CINEMATIC ENGINE — PROVIDER
// Wraps the Desk page. Renders the active scene based on engine phase.
// Scenes are lazy-loaded to keep the Desk bundle small.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, Suspense, lazy, type ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useCinematicEngine } from './useCinematicEngine';
import type {
  CinematicEngineContextValue,
  CinematicEngineCallbacks,
} from './types';

const VaultDoorScene          = lazy(() => import('./scenes/VaultDoorScene'));
const ReactorScene             = lazy(() => import('./scenes/ReactorScene'));
const PresentationChamberScene = lazy(() => import('./scenes/PresentationChamberScene'));

const CinematicEngineContext = createContext<CinematicEngineContextValue | null>(null);

export function useCinematicEngineContext(): CinematicEngineContextValue {
  const ctx = useContext(CinematicEngineContext);
  if (!ctx) {
    throw new Error('useCinematicEngineContext must be used within CinematicEngineProvider');
  }
  return ctx;
}

interface CinematicEngineProviderProps extends CinematicEngineCallbacks {
  children: ReactNode;
}

/**
 * SceneFallback — shown while a lazy scene chunk loads.
 * Matches the void background so there's no flash of white.
 */
function SceneFallback() {
  return (
    <div
      role="status"
      aria-label="Loading"
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: '#060912',
      }}
    />
  );
}

export function CinematicEngineProvider({
  children,
  onGenerate,
  onArtifactSave,
  onSchedule,
  onReportContent,
}: CinematicEngineProviderProps) {
  const engine = useCinematicEngine({ onGenerate, onArtifactSave, onSchedule, onReportContent });

  return (
    <CinematicEngineContext.Provider value={engine}>
      {children}

      {/* Overlay scenes — render on top of the Desk based on phase */}
      <AnimatePresence mode="wait">
        {engine.phase === 'vault' && (
          <Suspense fallback={<SceneFallback />} key="vault">
            <VaultDoorScene
              onComplete={engine.vaultComplete}
              onAbort={engine.abort}
            />
          </Suspense>
        )}

        {(engine.phase === 'reactor' || engine.phase === 'generating') && (
          <Suspense fallback={<SceneFallback />} key="reactor">
            <ReactorScene
              switches={engine.switches}
              isGenerating={engine.phase === 'generating'}
              onToggleSwitch={engine.toggleSwitch}
              onPullLever={engine.pullLever}
            />
          </Suspense>
        )}

        {(engine.phase === 'presentation' || engine.phase === 'error') && (
          <Suspense fallback={<SceneFallback />} key="presentation">
            <PresentationChamberScene
              result={engine.result}
              error={engine.error}
              onReturn={engine.reset}
              onRetry={engine.retry}
              onSave={onArtifactSave}
              onSchedule={onSchedule}
              onReport={onReportContent}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </CinematicEngineContext.Provider>
  );
}
