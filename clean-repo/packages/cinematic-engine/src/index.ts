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
