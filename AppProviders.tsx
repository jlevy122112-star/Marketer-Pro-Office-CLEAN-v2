/**
 * AppProviders.tsx
 * Composes all application-level React context providers.
 *
 * Architecture rules:
 * - Providers ordered by dependency: auth → tenant → theme → query → toast
 * - No business logic here — pure composition
 * - Error boundary wraps everything to catch catastrophic failures
 * - Suspense boundary prevents blank screens during lazy loads
 */

import React, { Component, ErrorInfo, Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../hooks/useAuth';
import { TenantProvider } from '../hooks/useTenant';
import { ThemeProvider } from '../hooks/useTheme';
import { ToastProvider } from '../components/ui/Toast';

// ─── Query client (tuned for SaaS performance) ───────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale after 60s — balances freshness with request volume
      staleTime: 60_000,
      // Keep unused data in cache for 5 minutes
      gcTime: 300_000,
      // Retry once on transient failures, not on 4xx
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 1;
      },
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

// ─── Error Boundary ───────────────────────────────────────────────────────────

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

class AppErrorBoundary extends Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null, errorId: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorId: `ERR-${Date.now().toString(36).toUpperCase()}`,
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production, send to error tracking (Sentry, etc.)
    if (process.env.NODE_ENV === 'production') {
      // TODO: captureException(error, { extra: info.componentStack })
    } else {
      console.error('[AppErrorBoundary]', error, info);
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return <CriticalErrorScreen errorId={this.state.errorId} />;
  }
}

// ─── Critical error screen (never a blank page) ───────────────────────────────

const CriticalErrorScreen: React.FC<{ errorId: string | null }> = ({ errorId }) => (
  <div
    role="alert"
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100dvh',
      gap: '20px',
      fontFamily: '"Inter var", Inter, system-ui, sans-serif',
      textAlign: 'center',
      padding: '32px 24px',
      background: '#f8fafc',
    }}
  >
    <div style={{ fontSize: '48px' }} aria-hidden="true">⚡</div>
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.5px', margin: '0 0 8px' }}>
        Something went wrong
      </h1>
      <p style={{ fontSize: '15px', color: '#64748b', maxWidth: '380px', lineHeight: 1.6, margin: '0 auto 4px' }}>
        We hit an unexpected error. Our team has been notified and is looking into it.
      </p>
      {errorId && (
        <p style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace', margin: '0 auto' }}>
          Error ID: {errorId}
        </p>
      )}
    </div>
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: '10px 24px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Reload app
      </button>
      <a
        href="/"
        style={{
          padding: '10px 24px',
          border: '1.5px solid #e2e8f0',
          color: '#475569',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 500,
          textDecoration: 'none',
          background: 'white',
        }}
      >
        Go to home
      </a>
    </div>
  </div>
);

// ─── Suspense fallback (lightweight, branded) ─────────────────────────────────

const SuspenseFallback: React.FC = () => (
  <div
    role="status"
    aria-label="Loading"
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100dvh',
      background: '#f8fafc',
    }}
  >
    <div
      style={{
        width: '32px',
        height: '32px',
        border: '3px solid #e2e8f0',
        borderTopColor: '#6366f1',
        borderRadius: '50%',
        animation: 'spin 600ms linear infinite',
      }}
    />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ─── AppProviders ─────────────────────────────────────────────────────────────

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Wraps the entire app with required providers in correct dependency order:
 *
 * BrowserRouter         → routing (must be outermost for hooks to work in children)
 * AppErrorBoundary      → catch catastrophic failures, never blank screen
 * QueryClientProvider   → server state (auth and tenant need this available)
 * AuthProvider          → current user session
 * TenantProvider        → workspace/org context (depends on auth)
 * ThemeProvider         → brand theming (depends on tenant for brand colors)
 * ToastProvider         → global notifications (needs to be near root for portals)
 * Suspense              → lazy-loaded routes and components
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => (
  <BrowserRouter>
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TenantProvider>
            <ThemeProvider>
              <ToastProvider>
                <Suspense fallback={<SuspenseFallback />}>
                  {children}
                </Suspense>
              </ToastProvider>
            </ThemeProvider>
          </TenantProvider>
        </AuthProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  </BrowserRouter>
);

export default AppProviders;
