// ─────────────────────────────────────────────────────────────────────────────
// CINEMATIC ENGINE — PUBLIC API
// Everything the host app (mobile-client Desk page) imports comes from here.
// ─────────────────────────────────────────────────────────────────────────────

export {
  CinematicEngineProvider,
  useCinematicEngineContext,
} from './CinematicEngineProvider';

export { useCinematicEngine } from './useCinematicEngine';

export {
  engineReducer,
  initialEngineState,
  canToggleSwitch,
  allSwitchesArmed,
  cascadeSwitchOff,
  sortArtifactsByScore,
  PHASE_TIMEOUTS_MS,
} from './stateMachine';

export type {
  CinematicPhase,
  CinematicEngineState,
  CinematicEngineActions,
  CinematicEngineContextValue,
  CinematicEngineCallbacks,
  GenerationRequest,
  GenerationResult,
  GeneratedArtifact,
  ReactorSwitchKey,
  ReactorSwitchState,
  PlatformId,
  ContentType,
  BrandTone,
} from './types';

export { REACTOR_SWITCH_ORDER } from './types';
// ── Add to existing index.ts ─────────────────────────────────────────────────

export { haptic, hapticUnlockSequence } from './haptics';
export type { HapticStyle } from './haptics';

export {
  PLATFORMS,
  ACTIVE_PLATFORMS,
  COMING_SOON_PLATFORMS,
  getPlatformMeta,
  CONTENT_TYPES,
  BRAND_TONES,
  PROMPT_STARTERS,
  PLATFORM_CHAR_LIMITS,
} from './constants';
export type { PlatformMeta } from './constants';

export { default as VaultDoorScene } from './scenes/VaultDoorScene';
export { default as ReactorScene } from './scenes/ReactorScene';
export { default as PresentationChamberScene } from './scenes/PresentationChamberScene';
export { default as GeneratorForm } from './scenes/GeneratorForm';
