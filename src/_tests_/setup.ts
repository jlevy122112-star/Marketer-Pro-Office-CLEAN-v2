import '@testing-library/jest-dom';
import { vi } from 'vitest';

// ── Capacitor (not available in jsdom) ─────────────────────────────────────
vi.mock('@capacitor/haptics', () => ({
  Haptics: {
    impact:       vi.fn().mockResolvedValue(undefined),
    notification: vi.fn().mockResolvedValue(undefined),
    vibrate:      vi.fn().mockResolvedValue(undefined),
  },
  ImpactStyle:    { Light: 'LIGHT', Medium: 'MEDIUM', Heavy: 'HEAVY' },
  NotificationType: { Success: 'SUCCESS', Warning: 'WARNING', Error: 'ERROR' },
}));

vi.mock('@capacitor/app', () => ({
  App: { addListener: vi.fn(), removeAllListeners: vi.fn() },
}));

vi.mock('@capacitor/status-bar', () => ({
  StatusBar: { setStyle: vi.fn(), setBackgroundColor: vi.fn() },
  Style: { Dark: 'DARK', Light: 'LIGHT' },
}));

// ── Next.js navigation ──────────────────────────────────────────────────────
vi.mock('next/navigation', () => ({
  useRouter:      () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  usePathname:    () => '/create',
  useSearchParams:() => new URLSearchParams(),
}));

// ── API client (tests use controlled responses, not live endpoints) ─────────
vi.mock('@/lib/api', () => ({
  api: {
    get:    vi.fn(),
    post:   vi.fn(),
    patch:  vi.fn(),
    delete: vi.fn(),
  },
}));

// ── Supabase (tests use controlled responses) ───────────────────────────────
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession:          vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange:   vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithPassword:  vi.fn(),
      signUp:              vi.fn(),
      signOut:             vi.fn(),
      signInWithOAuth:     vi.fn(),
      refreshSession:      vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
    from: vi.fn().mockReturnValue({
      select:  vi.fn().mockReturnThis(),
      insert:  vi.fn().mockReturnThis(),
      update:  vi.fn().mockReturnThis(),
      delete:  vi.fn().mockReturnThis(),
      upsert:  vi.fn().mockReturnThis(),
      eq:      vi.fn().mockReturnThis(),
      neq:     vi.fn().mockReturnThis(),
      order:   vi.fn().mockReturnThis(),
      limit:   vi.fn().mockReturnThis(),
      gte:     vi.fn().mockReturnThis(),
      lte:     vi.fn().mockReturnThis(),
      single:  vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
}));

// ── Browser APIs unavailable in jsdom ──────────────────────────────────────
Object.defineProperty(window, 'visualViewport', {
  value: { height: 812, width: 375, offsetTop: 0, addEventListener: vi.fn(), removeEventListener: vi.fn() },
  writable: true,
});

Object.defineProperty(navigator, 'vibrate', {
  value: vi.fn().mockReturnValue(true),
  writable: true,
});

Object.defineProperty(navigator, 'onLine', {
  value: true,
  writable: true,
  configurable: true,
});

Object.defineProperty(window, 'PublicKeyCredential', {
  value: { isUserVerifyingPlatformAuthenticatorAvailable: vi.fn().mockResolvedValue(true) },
  writable: true,
});

Object.defineProperty(navigator, 'share', {
  value: vi.fn().mockResolvedValue(undefined),
  writable: true,
  configurable: true,
});

Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: vi.fn().mockResolvedValue(undefined), readText: vi.fn().mockResolvedValue('') },
  writable: true,
});

// ── Reset DOM between every test ───────────────────────────────────────────
beforeEach(() => {
  document.body.innerHTML = '';
  document.head.innerHTML = '';
  vi.clearAllMocks();
});
