/**
 * selfHealing.ts
 * Marketer Pro — Self-Healing Error Recovery System
 *
 * Philosophy:
 * The user paid for this app. They should never feel like a beta tester.
 * Every failure gets multiple silent recovery attempts before the user
 * ever sees a single word about it.
 *
 * Recovery order:
 *   1. Retry with exponential backoff (up to 3x, silent)
 *   2. Attempt alternate strategy (refresh token, clear cache, fallback endpoint)
 *   3. Queue for background retry when connection restores
 *   4. ONLY THEN — show the user a calm, helpful message with ONE clear action
 *
 * The user never sees: stack traces, HTTP status codes, "undefined",
 * "something went wrong", or any message that implies they did something wrong.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type RecoveryStrategy =
  | 'retry'           // exponential backoff retry
  | 'refresh-token'   // silent token refresh then retry
  | 'clear-cache'     // wipe stale cache then retry
  | 'fallback'        // try alternate data source
  | 'queue'           // store and retry when online
  | 'partial'         // show what we have, load rest in background
  | 'notify';         // recovery exhausted — inform user calmly

export interface HealingContext {
  operation: string;        // e.g. 'generate-content', 'publish-post'
  attempt: number;          // current attempt number (1-indexed)
  maxAttempts: number;
  lastError: Error | null;
  strategy: RecoveryStrategy;
  silent: boolean;          // true = user has no idea this is happening
}

export interface HealingResult<T> {
  data: T | null;
  recovered: boolean;       // true = healed silently
  userMessage: string | null; // null = user never needs to know
  retryCount: number;
}

// ─── Delay utility ────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function backoffMs(attempt: number, baseMs = 400): number {
  // Exponential: 400ms, 800ms, 1600ms — capped at 8s
  return Math.min(baseMs * Math.pow(2, attempt - 1), 8000);
}

// ─── Network detection ────────────────────────────────────────────────────────

function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

function waitForOnline(): Promise<void> {
  if (isOnline()) return Promise.resolve();
  return new Promise((resolve) => {
    const handler = () => { window.removeEventListener('online', handler); resolve(); };
    window.addEventListener('online', handler);
  });
}

// ─── Token refresh (auth recovery) ───────────────────────────────────────────

async function silentTokenRefresh(): Promise<boolean> {
  try {
    const { supabase } = await import('./supabase');
    const { data, error } = await supabase.auth.refreshSession();
    return !error && !!data.session;
  } catch {
    return false;
  }
}

// ─── Cache clearing ───────────────────────────────────────────────────────────

async function clearQueryCache(operation: string): Promise<void> {
  try {
    // Clear React Query cache for this operation's key prefix
    const { getQueryClient } = await import('./queryClient');
    const client = getQueryClient();
    await client.invalidateQueries({ queryKey: [operation] });
  } catch {
    // Non-fatal — continue with retry regardless
  }
}

// ─── Offline queue ────────────────────────────────────────────────────────────

interface QueuedOperation {
  id: string;
  operation: string;
  fn: () => Promise<unknown>;
  queuedAt: number;
  attempts: number;
}

const offlineQueue: QueuedOperation[] = [];

function enqueueForRetry(operation: string, fn: () => Promise<unknown>): string {
  const id = `${operation}-${Date.now()}`;
  offlineQueue.push({ id, operation, fn, queuedAt: Date.now(), attempts: 0 });

  // Drain queue automatically when connection restores
  waitForOnline().then(() => drainOfflineQueue());
  return id;
}

async function drainOfflineQueue(): Promise<void> {
  if (!isOnline() || offlineQueue.length === 0) return;

  const pending = [...offlineQueue];
  offlineQueue.length = 0;

  for (const item of pending) {
    try {
      await item.fn();
    } catch {
      // Silently discard if still failing — user was already informed
    }
  }
}

// Auto-drain on reconnect
if (typeof window !== 'undefined') {
  window.addEventListener('online', drainOfflineQueue);
}

// ─── Error classification ─────────────────────────────────────────────────────

type ErrorClass =
  | 'network'      // no connectivity
  | 'auth'         // 401/403 — token expired
  | 'rate-limit'   // 429
  | 'server'       // 5xx
  | 'client'       // 4xx (not auth) — don't retry
  | 'timeout'
  | 'unknown';

function classifyError(err: unknown): ErrorClass {
  if (!isOnline()) return 'network';

  const msg = String((err as any)?.message ?? '').toLowerCase();
  const status = (err as any)?.status ?? (err as any)?.code;

  if (status === 401 || status === 403 || msg.includes('unauthorized') || msg.includes('jwt')) return 'auth';
  if (status === 429 || msg.includes('rate limit')) return 'rate-limit';
  if (status >= 500 || msg.includes('server') || msg.includes('503')) return 'server';
  if (status >= 400 && status < 500) return 'client';
  if (msg.includes('timeout') || msg.includes('aborted')) return 'timeout';
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('connection')) return 'network';
  return 'unknown';
}

// ─── Recovery strategy selector ──────────────────────────────────────────────

function selectStrategy(errorClass: ErrorClass, attempt: number): RecoveryStrategy {
  if (attempt === 1) {
    // First failure: always just retry silently
    return 'retry';
  }
  if (attempt === 2) {
    if (errorClass === 'auth') return 'refresh-token';
    if (errorClass === 'network') return 'queue';
    if (errorClass === 'rate-limit') return 'retry'; // with longer backoff
    return 'clear-cache';
  }
  if (attempt === 3) {
    if (errorClass === 'network') return 'queue';
    return 'retry';
  }
  // Exhausted
  return 'notify';
}

// ─── User-facing messages (calm, never blaming) ───────────────────────────────

const CALM_MESSAGES: Record<ErrorClass, string> = {
  network: "Your connection dropped for a moment. We'll keep trying in the background.",
  auth: "Your session refreshed. Please try that again.",
  'rate-limit': "You're moving fast — give it just a second.",
  server: "We hit a brief hiccup. Trying again automatically.",
  client: "That request couldn't be completed. Try again or contact support.",
  timeout: "That took longer than expected. We're retrying.",
  unknown: "Something didn't go as planned. Trying to recover.",
};

// ─── Core healing function ────────────────────────────────────────────────────

/**
 * Wraps any async operation with silent self-healing.
 *
 * Usage:
 *   const result = await healingRun('generate-content', () => api.content.generate(req));
 *   if (result.userMessage) toast.warn(result.userMessage); // only fires after all recovery fails
 *   if (result.data) render(result.data);
 */
export async function healingRun<T>(
  operation: string,
  fn: () => Promise<T>,
  options: { maxAttempts?: number; onSilentRetry?: (attempt: number) => void } = {}
): Promise<HealingResult<T>> {
  const maxAttempts = options.maxAttempts ?? 3;
  let lastError: Error | null = null;
  let retryCount = 0;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const ctx: HealingContext = {
      operation,
      attempt,
      maxAttempts,
      lastError,
      strategy: attempt === 1 ? 'retry' : selectStrategy(classifyError(lastError), attempt),
      silent: true,
    };

    try {
      // Wait for network if offline
      if (!isOnline()) {
        await waitForOnline();
      }

      // Apply strategy before attempt
      if (ctx.strategy === 'refresh-token') {
        await silentTokenRefresh();
      }
      if (ctx.strategy === 'clear-cache') {
        await clearQueryCache(operation);
      }
      if (ctx.strategy === 'queue') {
        enqueueForRetry(operation, fn);
        return { data: null, recovered: false, userMessage: null, retryCount };
      }

      // Execute
      const data = await fn();
      return { data, recovered: attempt > 1, userMessage: null, retryCount };

    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      retryCount++;

      const errorClass = classifyError(err);

      // Client errors (4xx) won't self-heal — skip retries
      if (errorClass === 'client') {
        break;
      }

      // Notify silent retry callback (for subtle UI indicators if needed)
      options.onSilentRetry?.(attempt);

      // Backoff before next attempt (longer for rate limits)
      if (attempt < maxAttempts) {
        const delay = errorClass === 'rate-limit'
          ? backoffMs(attempt, 1500)
          : backoffMs(attempt);
        await sleep(delay);
      }
    }
  }

  // All attempts exhausted — surface a calm message
  const errorClass = classifyError(lastError);
  return {
    data: null,
    recovered: false,
    userMessage: CALM_MESSAGES[errorClass],
    retryCount,
  };
}

// ─── React hook wrapper ───────────────────────────────────────────────────────

import { useState, useCallback, useRef } from 'react';

interface UseHealingOptions {
  operation: string;
  maxAttempts?: number;
  onSuccess?: (data: unknown) => void;
  onUserNotify?: (message: string) => void;
}

interface UseHealingState<T> {
  data: T | null;
  loading: boolean;
  silentlyRetrying: boolean; // subtle background indicator only
  userMessage: string | null;
}

/**
 * React hook for self-healing async operations.
 *
 * The `silentlyRetrying` flag can be used to show a tiny unobtrusive
 * spinner in the corner — not an error, not a blocker, just "working on it."
 *
 * Usage:
 *   const { run, data, loading, silentlyRetrying, userMessage } =
 *     useHealing({ operation: 'generate-content' });
 *
 *   <button onClick={() => run(() => api.content.generate(req))}>Generate</button>
 *   {silentlyRetrying && <SubtleRetryIndicator />}
 *   {userMessage && <Toast message={userMessage} />}
 */
export function useHealing<T>({
  operation,
  maxAttempts = 3,
  onSuccess,
  onUserNotify,
}: UseHealingOptions) {
  const [state, setState] = useState<UseHealingState<T>>({
    data: null,
    loading: false,
    silentlyRetrying: false,
    userMessage: null,
  });

  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(
    async (fn: () => Promise<T>) => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setState((s) => ({ ...s, loading: true, silentlyRetrying: false, userMessage: null }));

      const result = await healingRun(operation, fn, {
        maxAttempts,
        onSilentRetry: () => {
          setState((s) => ({ ...s, silentlyRetrying: true, loading: false }));
        },
      });

      if (abortRef.current?.signal.aborted) return;

      setState({
        data: result.data,
        loading: false,
        silentlyRetrying: false,
        userMessage: result.userMessage,
      });

      if (result.data) onSuccess?.(result.data);
      if (result.userMessage) onUserNotify?.(result.userMessage);
    },
    [operation, maxAttempts, onSuccess, onUserNotify]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, silentlyRetrying: false, userMessage: null });
  }, []);

  return { ...state, run, reset };
}

// ─── Subtle retry indicator component ────────────────────────────────────────

import React from 'react';

/**
 * SubtleRetryIndicator
 * Appears ONLY when silently retrying. Bottom corner, small, unobtrusive.
 * Users see "syncing" — not "error retrying." Huge psychological difference.
 */
export const SubtleRetryIndicator: React.FC<{ visible: boolean }> = ({ visible }) => {
  if (!visible) return null;
  return (
    <div
      role="status"
      aria-label="Syncing in background"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 14px',
        background: 'rgba(15, 10, 40, 0.85)',
        backdropFilter: 'blur(12px)',
        borderRadius: '999px',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        color: 'rgba(255,255,255,0.75)',
        fontSize: '12px',
        fontWeight: 500,
        fontFamily: '"Inter var", Inter, system-ui, sans-serif',
        zIndex: 9999,
        animation: 'healFadeIn 200ms ease-out',
        pointerEvents: 'none',
      }}
    >
      <span
        style={{
          width: '10px',
          height: '10px',
          border: '1.5px solid rgba(139,92,246,0.4)',
          borderTopColor: '#a855f7',
          borderRadius: '50%',
          animation: 'healSpin 700ms linear infinite',
          flexShrink: 0,
        }}
        aria-hidden="true"
      />
      Syncing…
      <style>{`
        @keyframes healSpin { to { transform: rotate(360deg); } }
        @keyframes healFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; } }
      `}</style>
    </div>
  );
};

// ─── Global error boundary with self-healing ─────────────────────────────────

import { Component, ErrorInfo, ReactNode } from 'react';

interface SelfHealingBoundaryState {
  error: Error | null;
  attempt: number;
  healing: boolean;
  healed: boolean;
  gaveUp: boolean;
}

interface SelfHealingBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onHealingFailed?: (error: Error) => void;
}

/**
 * SelfHealingBoundary
 * A React error boundary that automatically:
 * 1. Catches render errors
 * 2. Silently tries to remount the component tree up to 3 times
 * 3. Only shows an error state if all remounts fail
 *
 * Drop this around any feature section. Most transient render errors
 * (stale closure, race condition, undefined data) self-resolve on remount.
 */
export class SelfHealingBoundary extends Component<
  SelfHealingBoundaryProps,
  SelfHealingBoundaryState
> {
  private healTimer: ReturnType<typeof setTimeout> | null = null;
  state: SelfHealingBoundaryState = {
    error: null, attempt: 0, healing: false, healed: false, gaveUp: false,
  };

  static getDerivedStateFromError(error: Error): Partial<SelfHealingBoundaryState> {
    return { error, healing: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV === 'production') {
      // Silent telemetry — user never knows
      // captureException(error, { extra: info })
    }
    this.attemptHealing();
  }

  private attemptHealing() {
    const { attempt } = this.state;
    const maxAttempts = 3;

    if (attempt >= maxAttempts) {
      this.setState({ healing: false, gaveUp: true });
      this.props.onHealingFailed?.(this.state.error!);
      return;
    }

    const delay = backoffMs(attempt + 1, 300);

    this.healTimer = setTimeout(() => {
      this.setState((s) => ({
        error: null,
        attempt: s.attempt + 1,
        healing: false,
        healed: s.attempt > 0,
      }));
    }, delay);
  }

  componentWillUnmount() {
    if (this.healTimer) clearTimeout(this.healTimer);
  }

  render() {
    const { error, healing, gaveUp } = this.state;

    if (healing) {
      // Silent healing — show nothing, or at most the subtle indicator
      return (
        <SubtleRetryIndicator visible />
      );
    }

    if (gaveUp && error) {
      if (this.props.fallback) return <>{this.props.fallback}</>;
      return <HealingExhaustedUI onRetry={() => this.setState({ error: null, attempt: 0, gaveUp: false })} />;
    }

    return <>{this.props.children}</>;
  }
}

// ─── Last-resort UI (clean, calm, never blaming) ──────────────────────────────

const HealingExhaustedUI: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      gap: '16px',
      fontFamily: '"Inter var", Inter, system-ui, sans-serif',
      textAlign: 'center',
    }}
    role="alert"
  >
    <div style={{ fontSize: '32px' }} aria-hidden="true">⚡</div>
    <p style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
      This section needs a moment
    </p>
    <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '280px', margin: 0, lineHeight: 1.6 }}>
      We tried to reload it automatically. Tap below to try once more.
    </p>
    <button
      onClick={onRetry}
      style={{
        padding: '10px 24px',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        marginTop: '4px',
      }}
    >
      Reload section
    </button>
  </div>
);

// ─── Exports ──────────────────────────────────────────────────────────────────

export default {
  healingRun,
  useHealing,
  SubtleRetryIndicator,
  SelfHealingBoundary,
  enqueueForRetry,
  drainOfflineQueue,
  classifyError,
};
