import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { CinematicEngineProvider } from './contexts/CinematicContext';
import { AuthGuard } from './components/auth/AuthGuard';
import { TabBar } from './components/common/TabBar';
import { LoadingScreen } from './components/common/LoadingScreen';

const LoginPage       = lazy(() => import('./pages/Auth/LoginPage'));
const SignUpPage      = lazy(() => import('./pages/Auth/SignUpPage'));
const OnboardingPage  = lazy(() => import('./pages/Onboarding/OnboardingPage'));
const DeskPage        = lazy(() => import('./pages/Desk/DeskPage'));
const PlanPage        = lazy(() => import('./pages/Plan/PlanPage'));
const AnalyzePage     = lazy(() => import('./pages/Analyze/AnalyzePage'));
const SettingsPage    = lazy(() => import('./pages/Settings/SettingsPage'));
const BillingPage     = lazy(() => import('./pages/Settings/BillingPage'));
const NotFoundPage    = lazy(() => import('./pages/NotFoundPage'));

function TabBarLayout() {
  return (
    <CinematicEngineProvider>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
        <TabBar />
      </div>
    </CinematicEngineProvider>
  );
}

function AppShell() {
  return (
    <div className="page-root">
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/login"   element={<LoginPage />} />
          <Route path="/signup"  element={<SignUpPage />} />
          <Route element={<AuthGuard />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route element={<TabBarLayout />}>
              <Route path="/create"   element={<DeskPage />} />
              <Route path="/plan"     element={<PlanPage />} />
              <Route path="/analyze"  element={<AnalyzePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/billing"  element={<BillingPage />} />
            </Route>
          </Route>
          <Route path="/"  element={<Navigate to="/create" replace />} />
          <Route path="*"  element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppShell />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
APPEOF