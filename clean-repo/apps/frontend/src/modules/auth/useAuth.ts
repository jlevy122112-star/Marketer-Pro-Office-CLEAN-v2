'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';
import type { Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  planId: string;
  xp: number;
  level: number;
  onboardingComplete: boolean;
}

export function useAuth() {
  const [session, setSession]   = useState<Session | null>(null);
  const [user, setUser]         = useState<AuthUser | null>(null);
  const [loading, setLoading]   = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const data = await api.get<AuthUser>('/me');
      setUser(data);
    } catch { setUser(null); }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUser();
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      if (session) fetchUser();
      else { setUser(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, [fetchUser]);

  useEffect(() => {
    if (user) setLoading(false);
  }, [user]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
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

  return { session, user, loading, signIn, signUp, signOut, signInWithGoogle, refreshUser: fetchUser };
}
