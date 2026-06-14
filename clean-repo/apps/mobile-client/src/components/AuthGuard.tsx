// FILE PATH: src/components/auth/AuthGuard.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingScreen } from '../common/LoadingScreen';

export function AuthGuard() {
  const { session, loading, user } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" state={{ from: location }} replace />;

  // FIX: was checking !user.displayName which trapped Apple Sign In users
  // who legitimately skip the display name field.
  // Now correctly checks onboardingComplete which OnboardingPage sets on finish.
  if (user && !user.onboardingComplete && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
  if (session && location.pathname === '/login') {
    return <Navigate to="/desk" replace />;
  }

  return <>{children}</>;
}
