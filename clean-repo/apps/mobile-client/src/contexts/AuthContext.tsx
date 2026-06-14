// FILE PATH: src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { invalidateTokenCache } from '../lib/api';
import type { User } from '../types';

// ── Returning user detection ───────────────────────────────────────────────────
const STORAGE_KEY = 'mp_returning_user';

export function getStoredReturningName(): string | null {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}
export function storeReturningName(name: string): void {
  try { localStorage.setItem(STORAGE_KEY, name); } catch {}
}
export function clearReturningName(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null; displayName: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signInWithApple: () => Promise<{ error: string | null }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) {
        const u = data as User;
        setUser(u);
        if (u.displayName) storeReturningName(u.displayName);
      }
    } catch { /* Silent — session remains valid */ }
  }, []);

  const refreshUser = useCallback(async () => {
    if (session?.user?.id) await fetchUser(session.user.id);
  }, [session, fetchUser]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchUser(session.user.id);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) { fetchUser(session.user.id); }
      else { setUser(null); }
    });
    return () => subscription.unsubscribe();
  }, [fetchUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return { error: error?.message ?? 'Sign in failed', displayName: null };
    // Fetch display name for returning user cache
    try {
      const { data: profile } = await supabase
        .from('profiles').select('display_name').eq('id', data.user.id).single();
      const displayName = (profile?.display_name as string) ?? null;
      if (displayName) storeReturningName(displayName);
      return { error: null, displayName };
    } catch {
      return { error: null, displayName: null };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { display_name: displayName } },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    invalidateTokenCache();
    clearReturningName();
    setUser(null);
    setSession(null);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    return { error: error?.message ?? null };
  }, []);

  const signInWithApple = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    return { error: error?.message ?? null };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signUp, signOut, signInWithGoogle, signInWithApple, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
  }  }, []);

  // AFTER — also return user so LoginPage can cache display name:
const signIn = async (email: string, password: string): Promise<{
  error: string | null;
  user: { displayName: string } | null;
}> => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: error?.message ?? 'Sign in failed', user: null };

  // Fetch profile to get display name
  try {
    const profile = await api.get<{ displayName: string }>('/me');
    return { error: null, user: { displayName: profile.displayName } };
  } catch {
    return { error: null, user: null };
  }
};
    
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message ?? 'Login failed');
    }
    const data = await res.json();
    setUser(data.user);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
