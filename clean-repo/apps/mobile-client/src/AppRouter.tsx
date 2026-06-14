'use client';

// ─────────────────────────────────────────────────────────────────────────────
// APP ROUTER
// Defines every route in the mobile client.
// Auth guard prevents unauthenticated access to protected routes.
// Lazy loads all scenes and pages for smaller initial bundle.
// ─────────────────────────────────────────────────────────────────────────────
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage  = lazy(() => import('./pages/ResetPasswordPage'));
import { Suspense, lazy, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { AppProviders }   from './contexts/AppProviders';
import { AuthGuard }      from './components/AuthGuard';
import { LoadingScreen }  from './components/LoadingScreen';
import { TabBar }         from './components/TabBar';
import { OfflineBanner }  from '@marketer-pro/ui';

// ── Eagerly loaded (on critical path) ────────────────────────────────────────
import LoginPage      from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';

// ── Lazily loaded (tab pages) ─────────────────────────────────────────────────
const DeskPage     = lazy(() => import('./pages/DeskPage'));
const PlanPage     = lazy(() => import('./pages/PlanPage'));
const AnalyzePage  = lazy(() => import('./pages/AnalyzePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const BillingPage  = lazy(() => import('./pages/BillingPage'));
const HelpPage     = lazy(() => import('./pages/HelpCenterPage'));

// ── Scenes (department rooms) ─────────────────────────────────────────────────
const ArtifactVaultScene   = lazy(() => import('./scenes/ArtifactVaultScene'));
const ObservatoryScene     = lazy(() => import('./scenes/ObservatoryScene'));
const SchedulerTowerScene  = lazy(() => import('./scenes/SchedulerTowerScene'));
const BrandIdentityChamber = lazy(() => import('./scenes/BrandIdentityChamber'));
const AudienceArena        = lazy(() => import('./scenes/AudienceArena'));
const ContentForgeScene    = lazy(() => import('./scenes/ContentForgeScene'));
const CreatorHubScene      = lazy(() => import('./scenes/CreatorHubScene'));

// ── Legal ─────────────────────────────────────────────────────────────────────
const LegalIndexPage    = lazy(() => import('./pages/Legal/LegalIndexPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/Legal/PrivacyPolicyPage'));
const TermsOfUsePage    = lazy(() => import('./pages/Legal/TermsOfUsePage'));
const AcceptableUsePage = lazy(() => import('./pages/Legal/AcceptableUsePage'));
const CookiePolicyPage  = lazy(() => import('./pages/Legal/CookiePolicyPage'));

// ── Not found ─────────────────────────────────────────────────────────────────
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// ─────────────────────────────────────────────────────────────────────────────
// TAB LAYOUT — wraps all four main tabs with the persistent TabBar
// ─────────────────────────────────────────────────────────────────────────────
function TabLayout() {
  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      height:        '100dvh',
      overflow:      'hidden',
      background:    '#060912',
    }}>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <Outlet />
      </div>
      <TabBar />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE LAYOUT — fullscreen, no tab bar, back button provided by scene
// ─────────────────────────────────────────────────────────────────────────────
function SceneLayout() {
  return (
    <div style={{
      position:   'fixed',
      inset:       0,
      background:  '#060912',
      overflow:   'hidden',
      zIndex:      50,
    }}>
      <Outlet />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE NAVIGATOR
// Listens for the custom 'navigate-scene' event dispatched by DeskPage
// when a user taps a department card.
// ─────────────────────────────────────────────────────────────────────────────
function SceneNavigator() {
  useEffect(() => {
    const handler = (e: Event) => {
      const scene = (e as CustomEvent<string>).detail;
      if (scene) window.location.hash = `/scenes/${scene}`;
    };
    window.addEventListener('navigate-scene', handler);
    return () => window.removeEventListener('navigate-scene', handler);
  }, []);
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// FULL SUSPENSE FALLBACK
// ─────────────────────────────────────────────────────────────────────────────
function PageFallback() {
  return (
    <div style={{
      position:        'fixed',
      inset:            0,
      background:       '#060912',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
    }}>
      <div
        role="status"
        aria-label="Loading"
        style={{
          width:        36,
          height:       36,
          borderRadius: '50%',
          border:       '2px solid transparent',
          borderTopColor: '#C9A84C',
          animation:    'spin 0.9s linear infinite',
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// APP ROUTER — ROOT
// ─────────────────────────────────────────────────────────────────────────────
export function AppRouter() {
  return (
    <BrowserRouter>
      <AppProviders>
        <SceneNavigator />
        <OfflineBanner />

        {/* Global spin keyframe */}
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes shimmer {
            0%   { background-position: -200% 0; }
            100% { background-position:  200% 0; }
          }
          @keyframes gradientShift {
            0%,100% { background-position: 0% 50%; }
            50%     { background-position: 100% 50%; }
          }
          :root {
            --sat: env(safe-area-inset-top, 0px);
            --sab: env(safe-area-inset-bottom, 0px);
            --sal: env(safe-area-inset-left, 0px);
            --sar: env(safe-area-inset-right, 0px);
          }
          * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
          html, body, #root { width: 100%; height: 100%; overflow: hidden; background: #060912; }
          body { font-family: 'DM Sans', sans-serif; color: #fff; -webkit-font-smoothing: antialiased; }
          ::-webkit-scrollbar { width: 3px; }
          ::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.25); border-radius: 2px; }
        `}</style>

        <Suspense fallback={<PageFallback />}>
          <Routes>

            {/* ── Public routes ── */}
            <Route path="/login"      element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password"  element={<ResetPasswordPage />} />
            <Route path="/onboarding" element={
              <AuthGuard requireAuth requireOnboarding={false}>
                <OnboardingPage />
              </AuthGuard>
            } />

            {/* ── Legal (public — no auth needed) ── */}
            <Route path="/legal"               element={<LegalIndexPage />} />
            <Route path="/legal/privacy"       element={<PrivacyPolicyPage />} />
            <Route path="/legal/terms"         element={<TermsOfUsePage />} />
            <Route path="/legal/acceptable-use" element={<AcceptableUsePage />} />
            <Route path="/legal/cookies"       element={<CookiePolicyPage />} />

            {/* ── Tab layout (requires auth + onboarding complete) ── */}
            <Route element={
              <AuthGuard requireAuth requireOnboarding>
                <TabLayout />
              </AuthGuard>
            }>
              <Route index                element={<Navigate to="/desk" replace />} />
              <Route path="/desk"         element={<DeskPage />} />
              <Route path="/plan"         element={<PlanPage />} />
              <Route path="/analyze"      element={<AnalyzePage />} />
              <Route path="/settings"     element={<SettingsPage />} />
              <Route path="/billing"      element={<BillingPage />} />
              <Route path="/help"         element={<HelpPage />} />
            </Route>

            {/* ── Scene routes (fullscreen, requires auth) ── */}
            <Route element={
              <AuthGuard requireAuth requireOnboarding>
                <SceneLayout />
              </AuthGuard>
            }>
              <Route path="/scenes/artifact-vault"  element={<ArtifactVaultScene />} />
              <Route path="/scenes/observatory"      element={<ObservatoryScene />} />
              <Route path="/scenes/scheduler-tower"  element={<SchedulerTowerScene />} />
              <Route path="/scenes/brand-identity"   element={<BrandIdentityChamber />} />
              <Route path="/scenes/audience-arena"   element={<AudienceArena />} />
              <Route path="/scenes/content-forge"    element={<ContentForgeScene />} />
              <Route path="/scenes/creator-hub"      element={<CreatorHubScene />} />
            </Route>

            {/* ── Catch all ── */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AppProviders>
    </BrowserRouter>
  );
}
