'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './useAuth';

const PUBLIC_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, user, loading } = useAuth();
  const router    = useRouter();
  const pathname  = usePathname();

  useEffect(() => {
    if (loading) return;
    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
    if (!session && !isPublic) { router.replace('/login'); return; }
    if (session && user && !user.onboardingComplete && pathname !== '/onboarding') {
      router.replace('/onboarding');
    }
  }, [session, user, loading, pathname, router]);

  if (loading) return (
    <div style={{ position: 'fixed', inset: 0, background: '#060912', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#C9A84C', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return <>{children}</>;
}
