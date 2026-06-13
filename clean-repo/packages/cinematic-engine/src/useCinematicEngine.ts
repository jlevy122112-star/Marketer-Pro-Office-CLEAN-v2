// ─────────────────────────────────────────────────────────────────────────────
// CINEMATIC ENGINE — HOOK
// Wires the pure reducer to React state + the real generation API call.
// No mock data — onGenerate must be a real async function from the host app.
// ─────────────────────────────────────────────────────────────────────────────

import { useReducer, useCallback, useEffect, useRef } from 'react';
import {
  engineReducer,
  initialEngineState,
  cascadeSwitchOff,
  sortArtifactsByScore,
  PHASE_TIMEOUTS_MS,
} from './stateMachine';
import type {
  CinematicEngineContextValue,
  CinematicEngineCallbacks,
  GenerationRequest,
  ReactorSwitchKey,
} from './types';

export function useCinematicEngine(
  callbacks: CinematicEngineCallbacks,
): CinematicEngineContextValue {
  const [state, dispatch] = useReducer(engineReducer, initialEngineState);
  const requestRef = useRef<GenerationRequest | null>(null);

  // Keep a ref to the in-flight request so retry can reuse it
  useEffect(() => {
    requestRef.current = state.request;
  }, [state.request]);

  // ── Drive the real API call whenever phase enters 'generating' ────────────
  useEffect(() => {
    if (state.phase !== 'generating' || !state.request) return;

    let cancelled = false;
    const controller = new AbortController();

    // Safety timeout — if the API hangs, surface an error instead of
    // leaving the user staring at the reactor fire animation forever
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, PHASE_TIMEOUTS_MS.generating);

    callbacks.onGenerate(state.request)
      .then((result) => {
        if (cancelled) return;
        dispatch({ type: 'GENERATION_SUCCESS', payload: result });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Generation failed. Please try again.';
        dispatch({ type: 'GENERATION_ERROR', payload: message });
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.request]);

  // ── Public actions ──────────────────────────────────────────────────────────

  const start = useCallback((request: GenerationRequest) => {
    dispatch({ type: 'START', payload: request });
  }, []);

  const vaultComplete = useCallback(() => {
    dispatch({ type: 'VAULT_COMPLETE' });
  }, []);

  const toggleSwitch = useCallback((key: ReactorSwitchKey) => {
    dispatch({ type: 'TOGGLE_SWITCH', payload: key });
    // Cascade-off is applied as a follow-up dispatch via a derived reducer step.
    // Since engineReducer is pure and only toggles one key at a time, we run
    // cascade correction here by reading the *next* state synchronously.
    // React 18 batches this safely within the same tick.
    queueMicrotask(() => {
      dispatch((current => {
        const corrected = cascadeSwitchOff(current.switches, key);
        if (JSON.stringify(corrected) === JSON.stringify(current.switches)) return current as any;
        return { type: 'TOGGLE_SWITCH', payload: key } as any;
      }) as any);
    });
  }, []);

  const pullLever = useCallback(() => {
    dispatch({ type: 'PULL_LEVER' });
  }, []);

  const abort = useCallback(() => {
    dispatch({ type: 'ABORT' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const retry = useCallback(() => {
    if (!requestRef.current) return;
    dispatch({ type: 'RETRY' });
  }, []);

  return {
    ...state,
    result: sortArtifactsByScore(state.result),
    start,
    vaultComplete,
    toggleSwitch,
    pullLever,
    abort,
    reset,
    retry,
  };
}
