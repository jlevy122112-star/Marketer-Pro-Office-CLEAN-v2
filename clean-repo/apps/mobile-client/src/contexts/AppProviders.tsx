'use client';

// ─────────────────────────────────────────────────────────────────────────────
// APP PROVIDERS
// Single wrapper that composes all context providers in correct order.
// Import order matters: Auth → Brand → Progression → Toast
// ─────────────────────────────────────────────────────────────────────────────

import { type ReactNode } from 'react';
import { AuthProvider }        from './AuthContext';
import { BrandProvider }       from './BrandContext';
import { ProgressionProvider } from './ProgressionContext';
import { ToastProvider }       from './ToastContext';

interface AppProvidersProps { children: ReactNode; }

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <BrandProvider>
        <ProgressionProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ProgressionProvider>
      </BrandProvider>
    </AuthProvider>
  );
}
