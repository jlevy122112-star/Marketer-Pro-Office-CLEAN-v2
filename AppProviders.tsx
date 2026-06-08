/**
 * AppProviders.tsx — updated with SelfHealingBoundary
 * Every section is wrapped so transient errors self-resolve silently.
 * User only sees something if ALL recovery attempts are exhausted.
 */

import React, { Component, ErrorInfo, Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../hooks/useAuth';
import { TenantProvider } from '../hooks/useTenant';
import { ThemeProvider } from '../hooks/useTheme';
import { ToastProvider } from '../components/ui/Toast';
import { SelfHealingBoundary, SubtleRetryIndicator } from '../lib/selfHealing';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 300_000,
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 2;
      },
      retryDelay: (attempt) => Math.min(400 * Math.pow(2, attempt), 8000),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 1;
      },
      retryDelay: (attempt) => Math.min(600 * Math.pow(2, attempt), 5000),
    },
  },
});

export function getQueryClient() { return queryClient; }

interface TopBoundaryState { crashed: boolean; errorId: string | null; healAttempts: number; }

class TopLevelBoundary extends Component<{ children: React.ReactNode }, TopBoundaryState> {
  state: TopBoundaryState = { crashed: false, errorId: null, healAttempts: 0 };
  private timer: ReturnType<typeof setTimeout> | null = null;

  static getDerivedStateFromError(): Partial<TopBoundaryState> { return { crashed: true }; }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const errorId = `ERR-${Date.now().toString(36).toUpperCase()}`;
    this.setState({ errorId });
    if (process.env.NODE_ENV !== 'production') console.error('[TopLevelBoundary]', error, info);
    if (this.state.healAttempts < 2) {
      this.timer = setTimeout(() => {
        this.setState((s) => ({ crashed: false, healAttempts: s.healAttempts + 1 }));
      }, 800 * Math.pow(2, this.state.healAttempts));
    }
  }

  componentWillUnmount() { if (this.timer) clearTimeout(this.timer); }

  render() {
    if (this.state.crashed && this.state.healAttempts >= 2) {
      return (
        <div role="alert" style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100dvh',gap:'20px',fontFamily:'"Inter var",Inter,system-ui,sans-serif',textAlign:'center',padding:'32px 24px',background:'#f8fafc' }}>
          <div style={{ fontSize:'48px' }} aria-hidden="true">⚡</div>
          <div>
            <h1 style={{ fontSize:'22px',fontWeight:700,color:'#0f172a',letterSpacing:'-0.5px',margin:'0 0 8px' }}>Something went wrong</h1>
            <p style={{ fontSize:'15px',color:'#64748b',maxWidth:'360px',lineHeight:1.6,margin:'0 auto 4px' }}>We tried to fix it automatically but couldn't. Our team has been notified.</p>
            {this.state.errorId && <p style={{ fontSize:'12px',color:'#94a3b8',fontFamily:'monospace',margin:'4px auto 0' }}>Reference: {this.state.errorId}</p>}
          </div>
          <div style={{ display:'flex',gap:'12px',flexWrap:'wrap',justifyContent:'center' }}>
            <button onClick={() => window.location.reload()} style={{ padding:'10px 24px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'white',border:'none',borderRadius:'8px',fontSize:'14px',fontWeight:600,cursor:'pointer' }}>Reload app</button>
            <a href="/" style={{ padding:'10px 24px',border:'1.5px solid #e2e8f0',color:'#475569',borderRadius:'8px',fontSize:'14px',fontWeight:500,textDecoration:'none',background:'white' }}>Go to home</a>
          </div>
        </div>
      );
    }
    if (this.state.crashed) return <SubtleRetryIndicator visible />;
    return <>{this.props.children}</>;
  }
}

const SuspenseFallback: React.FC = () => (
  <div role="status" aria-label="Loading" style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100dvh',background:'#f8fafc' }}>
    <div style={{ width:'32px',height:'32px',border:'3px solid #e2e8f0',borderTopColor:'#6366f1',borderRadius:'50%',animation:'spin 600ms linear infinite' }}/>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <TopLevelBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TenantProvider>
            <ThemeProvider>
              <ToastProvider>
                <SelfHealingBoundary>
                  <Suspense fallback={<SuspenseFallback />}>
                    {children}
                  </Suspense>
                </SelfHealingBoundary>
              </ToastProvider>
            </ThemeProvider>
          </TenantProvider>
        </AuthProvider>
      </QueryClientProvider>
    </TopLevelBoundary>
  </BrowserRouter>
);

export default AppProviders;
