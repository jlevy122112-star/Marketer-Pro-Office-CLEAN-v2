// ─────────────────────────────────────────────────────────────────────────────
// CINEMATIC ENGINE — STATE MACHINE
// Pure functions. No side effects, no React. Fully unit-testable.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  CinematicPhase,
  CinematicEngineState,
  GenerationRequest,
  GenerationResult,
  ReactorSwitchKey,
  ReactorSwitchState,
  REACTOR_SWITCH_ORDER,
} from './types';
import { REACTOR_SWITCH_ORDER as SWITCH_ORDER } from './types';

// ── Initial state ────────────────────────────────────────────────────────────
export const initialEngineState: CinematicEngineState = {
  phase:    'idle',
  request:  null,
  result:   null,
  error:    null,
  switches: { brand: false, audience: false, ai_core: false },
};

// ── Action types ──────────────────────────────────────────────────────────────
export type EngineAction =
  | { type: 'START';            payload: GenerationRequest }
  | { type: 'VAULT_COMPLETE' }
  | { type: 'TOGGLE_SWITCH';    payload: ReactorSwitchKey }
  | { type: 'PULL_LEVER' }
  | { type: 'GENERATION_SUCCESS'; payload: GenerationResult }
  | { type: 'GENERATION_ERROR';   payload: string }
  | { type: 'ABORT' }
  | { type: 'RESET' }
  | { type: 'RETRY' };

// ── Reducer ───────────────────────────────────────────────────────────────────
export function engineReducer(
  state: CinematicEngineState,
  action: EngineAction,
): CinematicEngineState {
  switch (action.type) {

    case 'START':
      // Desk generator form submitted — begin Act I (Vault Door)
      return {
        ...initialEngineState,
        phase:   'vault',
        request: action.payload,
      };

    case 'VAULT_COMPLETE':
      // Vault Door animation finished — move to Act II (Reactor)
      if (state.phase !== 'vault') return state;
      return {
        ...state,
        phase: 'reactor',
      };

    case 'TOGGLE_SWITCH': {
      if (state.phase !== 'reactor') return state;
      const key = action.payload;
      if (!canToggleSwitch(state.switches, key)) return state;
      return {
        ...state,
        switches: { ...state.switches, [key]: !state.switches[key] },
      };
    }

    case 'PULL_LEVER':
      // Only fires when all three switches armed
      if (state.phase !== 'reactor') return state;
      if (!allSwitchesArmed(state.switches)) return state;
      return {
        ...state,
        phase: 'generating',
      };

    case 'GENERATION_SUCCESS':
      if (state.phase !== 'generating') return state;
      return {
        ...state,
        phase:  'presentation',
        result: action.payload,
        error:  null,
      };

    case 'GENERATION_ERROR':
      if (state.phase !== 'generating') return state;
      return {
        ...state,
        phase: 'error',
        error: action.payload,
      };

    case 'RETRY':
      // Re-attempt generation with the same request — used from error state
      if (state.phase !== 'error' || !state.request) return state;
      return {
        ...state,
        phase: 'generating',
        error: null,
      };

    case 'ABORT':
      // User cancels during Vault Door — return to idle, discard request
      if (state.phase !== 'vault') return state;
      return { ...initialEngineState };

    case 'RESET':
      // User returns to Desk from Presentation Chamber — full reset
      return { ...initialEngineState };

    default:
      return state;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Sequential unlock — a switch can only be toggled if the previous
 * switch in REACTOR_SWITCH_ORDER is currently armed (or it's the first switch).
 * This is the "system initialization" ritual from the audit upgrades.
 */
export function canToggleSwitch(switches: ReactorSwitchState, key: ReactorSwitchKey): boolean {
  const idx = SWITCH_ORDER.indexOf(key);
  if (idx === 0) return true;
  const previousKey = SWITCH_ORDER[idx - 1];
  return switches[previousKey];
}

export function allSwitchesArmed(switches: ReactorSwitchState): boolean {
  return SWITCH_ORDER.every((key) => switches[key]);
}

/**
 * If a switch is turned OFF, any switches "after" it in the sequence
 * must also turn off (cannot have audience armed if brand is not).
 * Call this after toggling to keep state consistent.
 */
export function cascadeSwitchOff(switches: ReactorSwitchState, key: ReactorSwitchKey): ReactorSwitchState {
  const idx = SWITCH_ORDER.indexOf(key);
  const next = { ...switches };
  if (!next[key]) {
    for (let i = idx + 1; i < SWITCH_ORDER.length; i++) {
      next[SWITCH_ORDER[i]] = false;
    }
  }
  return next;
}

/**
 * Sorts generated artifacts by quality score, descending.
 * Best content surfaces first in the Presentation Chamber.
 */
export function sortArtifactsByScore(result: GenerationResult | null): GenerationResult | null {
  if (!result) return result;
  return {
    ...result,
    artifacts: [...result.artifacts].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)),
  };
}

/** Total estimated cinematic duration for a phase — used for timeout safety nets */
export const PHASE_TIMEOUTS_MS: Record<CinematicPhase, number> = {
  idle:         0,
  vault:        2500,   // Vault Door — capped at 2.5s per audit
  reactor:      0,      // User-paced, no timeout
  generating:   30000,  // API call — 30s safety timeout
  presentation: 0,      // User-paced
  error:        0,
};
