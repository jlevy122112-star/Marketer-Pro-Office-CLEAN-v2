// ─────────────────────────────────────────────────────────────────────────────
// API CLIENT
// Thin wrapper around fetch. All production calls go through here.
// No mock data. Throws on non-OK responses.
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from './supabase';

const BASE = import.meta.env.VITE_API_BASE_URL as string;

async function getToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const token = await getToken();

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const json = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));

  if (!res.ok) {
    throw new Error(json.error ?? json.message ?? `Request failed: ${res.status}`);
  }

  return json.data as T;
}

export const api = {
  get:    <T>(path: string)                 => request<T>('GET',    path),
  post:   <T>(path: string, body?: unknown) => request<T>('POST',   path, body),
  patch:  <T>(path: string, body?: unknown) => request<T>('PATCH',  path, body),
  delete: <T>(path: string)                 => request<T>('DELETE', path),
};
