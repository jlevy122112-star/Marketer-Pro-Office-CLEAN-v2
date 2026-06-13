'use client';

// ─────────────────────────────────────────────────────────────────────────────
// AUTH GUARD
// Wraps protected routes. Redirects to /login if not authenticated.
// Redirects to /onboarding if auth but onboarding not complete.
// ─────────────────────────────────────────────────────────────────────────────

import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingScreen } from './LoadingScreen';

interface AuthGuardProps {
  children:           ReactNode;
  requireAuth?:       boolean;
  requireOnboarding?: boolean;
}

export function AuthGuard({
  children,
  requireAuth       = true,
  requireOnboarding = true,
}: AuthGuardProps) {
  const { session, user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (requireAuth && !session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAuth && requireOnboarding && user && !user.onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  if (session && location.pathname === '/login') {
    return <Navigate to="/desk" replace />;
  }

  return <>{children}</>;
}
