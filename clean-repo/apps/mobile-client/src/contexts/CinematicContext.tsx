// FILE PATH: src/contexts/CinematicContext.tsx
// BLOCKER 4 FIX: Added auth token, correct API base URL, abort signal, timeout
import React, { createContext, useContext, useReducer, useCallback, useRef } from 'react';
import type {
  CinematicState, CinematicContext as CinematicCtx,
  GenerationRequest, GenerationResult,
} from '../types';
import { supabase } from '../lib/supabase';

// ── State machine types ────────────────────────────────────────────────────────
type CinematicEvent =
  | { type: 'START_GENERATION'; request: GenerationRequest }
  | { type: 'VAULT_OPENED' }
  | { type: 'REACTOR_ARMED' }
  | { type: 'LEVER_PULLED' }
  | { type: 'GENERATION_COMPLETE'; result: GenerationResult }
  | { type: 'GENERATION_ERROR'; error: string }
  | { type: 'ARTIFACT_SELECTED' }
  | { type: 'RESET' };

interface CinematicStateShape {
  state: CinematicState;
  context: CinematicCtx;
}

function reducer(current: CinematicStateShape, event: CinematicEvent): CinematicStateShape {
  switch (event.type) {
    case 'START_GENERATION':
      return { state: 'vault_intro', context: { request: event.request, startedAt: Date.now() } };
    case 'VAULT_OPENED':
      return { ...current, state: 'reactor_arm' };
    case 'REACTOR_ARMED':
      return { ...current, state: 'reactor_fire' };
    case 'LEVER_PULLED':
      return { ...current, state: 'generating' };
    case 'GENERATION_COMPLETE':
      return { ...current, state: 'presentation', context: { ...current.context, result: event.result } };
    case 'GENERATION_ERROR':
      return { ...current, state: 'error', context: { ...current.context, error: event.error } };
    case 'ARTIFACT_SELECTED':
      return { ...current, state: 'artifact_select' };
    case 'RESET':
      return { state: 'idle', context: {} };
    default:
      return current;
  }
}

// ── Context value ──────────────────────────────────────────────────────────────
interface CinematicContextValue {
  state: CinematicState;
  context: CinematicCtx;
  startGeneration: (request: GenerationRequest) => void;
  onVaultOpened: () => void;
  onReactorArmed: () => void;
  onLeverPulled: () => void;
  onArtifactSelected: () => void;
  reset: () => void;
}

const CinematicContext = createContext<CinematicContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────────
export function CinematicEngineProvider({ children }: { children: React.ReactNode }) {
  const [{ state, context }, dispatch] = useReducer(reducer, { state: 'idle', context: {} });
  const abortRef    = useRef<AbortController | null>(null);
  const timeoutRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startGeneration = useCallback((request: GenerationRequest) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    dispatch({ type: 'START_GENERATION', request });
  }, []);

  const onVaultOpened  = useCallback(() => dispatch({ type: 'VAULT_OPENED' }),   []);
  const onReactorArmed = useCallback(() => dispatch({ type: 'REACTOR_ARMED' }),  []);

  const onLeverPulled = useCallback(() => {
    dispatch({ type: 'LEVER_PULLED' });

    // ── BLOCKER 4 FIX ─────────────────────────────────────────────────────────
    // Before this fix: no auth token, no base URL fallback, no timeout
    // After this fix:  auth token from Supabase session, correct URL, 30s timeout
    const generate = async () => {
      // 1. Get auth token from current session
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? null;

      if (!token) {
        dispatch({ type: 'GENERATION_ERROR', error: 'You must be signed in to generate content. Please sign in and try again.' });
        return;
      }

      // 2. Build the correct URL — VITE_API_BASE_URL is required
      const apiBase = import.meta.env.VITE_API_BASE_URL as string;
      if (!apiBase) {
        dispatch({ type: 'GENERATION_ERROR', error: 'API configuration error. Please contact support.' });
        return;
      }

      // 3. Set a 30-second safety timeout — prevents infinite spinner
      abortRef.current = new AbortController();
      timeoutRef.current = setTimeout(() => {
        abortRef.current?.abort();
      }, 30_000);

      try {
        const res = await fetch(`${apiBase}/content/generate`, {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body:   JSON.stringify(context.request),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          // Parse backend error message if available
          let msg = `Generation failed (${res.status})`;
          try {
            const err = await res.json();
            msg = err.userMessage ?? err.message ?? msg;
          } catch { /* ignore parse error */ }
          throw new Error(msg);
        }

        const result: GenerationResult = await res.json();

        // Supabase returns data wrapped — handle both shapes
        const finalResult = (result as any).data ?? result;
        dispatch({ type: 'GENERATION_COMPLETE', result: finalResult });

      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          dispatch({
            type:  'GENERATION_ERROR',
            error: 'Generation timed out. Check your internet connection and try again.',
          });
        } else {
          dispatch({
            type:  'GENERATION_ERROR',
            error: err instanceof Error ? err.message : 'Generation failed. Please try again.',
          });
        }
      } finally {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    };

    generate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.request]);

  const onArtifactSelected = useCallback(() => dispatch({ type: 'ARTIFACT_SELECTED' }), []);

  const reset = useCallback(() => {
    // Abort any in-flight generation
    abortRef.current?.abort();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    dispatch({ type: 'RESET' });
  }, []);

  return (
    <CinematicContext.Provider value={{
      state, context,
      startGeneration,
      onVaultOpened,
      onReactorArmed,
      onLeverPulled,
      onArtifactSelected,
      reset,
    }}>
      {children}
    </CinematicContext.Provider>
  );
}

export function useCinematic() {
  const ctx = useContext(CinematicContext);
  if (!ctx) throw new Error('useCinematic must be used within CinematicEngineProvider');
  return ctx;
}
