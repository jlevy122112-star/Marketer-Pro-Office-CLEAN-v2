/**
 * @marketer-pro/api-client
 * Type-safe HTTP client for the Marketer Pro backend.
 * All methods mirror the exact API surface in apps.ts.
 * Uses fetch() with credentials: 'include' for cookie-based JWT refresh.
 */

// ─── Base URL ────────────────────────────────────────────────────────────────
const BASE = typeof window !== 'undefined'
  ? '/api'
  : (process.env.API_BASE_URL ?? 'http://localhost:4000');

// ─── Types (re-exported for consumer convenience) ────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: string;
}

export interface Brand {
  id: string;
  workspaceId: string;
  name: string;
  industry: string | null;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  tone: BrandTone;
  website: string | null;
  createdAt: string;
}

export type BrandTone =
  | 'professional' | 'casual' | 'humorous'
  | 'inspirational' | 'authoritative' | 'playful';

export type SocialPlatform = 'instagram' | 'facebook' | 'tiktok' | 'linkedin' | 'x';

export interface Campaign {
  id: string;
  workspaceId: string;
  brandId: string | null;
  name: string;
  objective: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate: string | null;
  endDate: string | null;
  channels: SocialPlatform[];
  createdAt: string;
}

export interface ContentItem {
  id: string;
  campaignId: string;
  channel: SocialPlatform;
  type: 'post' | 'story' | 'reel' | 'ad' | 'email';
  title: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduledAt: string | null;
  createdAt: string;
  variants?: ContentVariant[];
}

export interface ContentVariant {
  id: string;
  contentId: string;
  copy: string;
  imageUrl: string | null;
  hashtags: string[];
}

export interface CalendarPost {
  id: string;
  brandId: string;
  campaignId: string | null;
  scheduledAt: string;
  status: 'scheduled' | 'sent' | 'draft' | 'failed';
  platform: SocialPlatform;
  caption: string | null;
  imageUrls: string[];
  hashtags: string[];
}

export interface UserProgression {
  userId: string;
  totalXp: number;
  level: number;
  prestigeRank: number;
  currentStreak: number;
  longestStreak: number;
  generationsCount: number;
  updatedAt: string;
}

export interface OfficeState {
  userId: string;
  level: number;
  generationsCount: number;
  prestigeRank: number;
  cosmetics: Record<string, string>;
  unlockedScenes: string[];
  updatedAt: string;
}

export interface Achievement {
  id: string;
  userId: string;
  achievementKey: string;
  title: string;
  description: string;
  iconUrl: string | null;
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface LootboxReward {
  type: 'cosmetic' | 'xp_boost' | 'scene_unlock' | 'template' | 'badge';
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  value: string | number;
}

export interface AnalyticsSummary {
  totalPosts: number;
  totalReach: number;
  avgEngagementRate: number;
  topPlatform: SocialPlatform;
  growthPercent: number;
  period: '7d' | '30d' | '90d';
  weeklyReach: number[];
  platformBreakdown: Record<string, number>;
}

export interface PlannerTask {
  id: string;
  brandId: string;
  campaignId: string | null;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  platform: SocialPlatform | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface IntegrationStatus {
  provider: string;
  connected: boolean;
  expiresAt: string | null;
  updatedAt: string | null;
}

// ─── Error class ─────────────────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Core fetch wrapper ──────────────────────────────────────────────────────
let _accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  _accessToken = token;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };

  if (_accessToken) {
    headers['Authorization'] = `Bearer ${_accessToken}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    let code: string | undefined;
    try {
      const body = await res.json();
      message = body?.error?.message ?? body?.message ?? message;
      code = body?.error?.code;
    } catch { /* ignore parse errors */ }
    throw new ApiError(res.status, message, code);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export const auth = {
  signup: (payload: { email: string; password: string; name: string }) =>
    request<{ data: TokenPair }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ data: TokenPair }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  logout: () =>
    request<{ message: string }>('/auth/logout', { method: 'POST' }),

  refresh: (refreshToken: string) =>
    request<{ data: TokenPair }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  forgotPassword: (email: string) =>
    request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = {
  me: () => request<{ user: User }>('/me'),

  update: (payload: Partial<Pick<User, 'name' | 'avatarUrl'>>) =>
    request<{ user: User }>('/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  deleteAccount: () =>
    request<{ message: string }>('/me', { method: 'DELETE' }),
};

// ─── Brands ──────────────────────────────────────────────────────────────────
export const brands = {
  list: () => request<{ brands: Brand[] }>('/brands'),

  get: (id: string) => request<{ brand: Brand }>(`/brands/${id}`),

  create: (payload: Partial<Omit<Brand, 'id' | 'workspaceId' | 'createdAt'>>) =>
    request<{ brand: Brand }>('/brands', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: Partial<Omit<Brand, 'id' | 'workspaceId' | 'createdAt'>>) =>
    request<{ brand: Brand }>(`/brands/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/brands/${id}`, { method: 'DELETE' }),
};

// ─── Campaigns ───────────────────────────────────────────────────────────────
export const campaigns = {
  list: (brandId?: string) =>
    request<{ campaigns: Campaign[] }>(`/campaigns${brandId ? `?brandId=${brandId}` : ''}`),

  get: (id: string) => request<{ campaign: Campaign }>(`/campaigns/${id}`),

  create: (payload: Partial<Omit<Campaign, 'id' | 'workspaceId' | 'createdAt'>>) =>
    request<{ campaign: Campaign }>('/campaigns', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: Partial<Campaign>) =>
    request<{ campaign: Campaign }>(`/campaigns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/campaigns/${id}`, { method: 'DELETE' }),

  metrics: (id: string) =>
    request<{ metrics: Record<string, number> }>(`/campaigns/${id}/metrics`),
};

// ─── Content ─────────────────────────────────────────────────────────────────
export const content = {
  listByCampaign: (campaignId: string) =>
    request<{ items: ContentItem[] }>(`/campaigns/${campaignId}/content`),

  get: (id: string) => request<{ item: ContentItem }>(`/content/${id}`),

  create: (campaignId: string, payload: Partial<ContentItem>) =>
    request<{ item: ContentItem }>(`/campaigns/${campaignId}/content`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: Partial<ContentItem>) =>
    request<{ item: ContentItem }>(`/content/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  schedule: (id: string, scheduledAt: string, platform: SocialPlatform) =>
    request<{ item: ContentItem }>(`/content/${id}/schedule`, {
      method: 'POST',
      body: JSON.stringify({ scheduledAt, platform }),
    }),

  publish: (id: string) =>
    request<{ item: ContentItem }>(`/content/${id}/publish`, { method: 'POST' }),
};

// ─── Calendar ─────────────────────────────────────────────────────────────────
export const calendar = {
  posts: (brandId: string, from: string, to: string) =>
    request<{ posts: CalendarPost[] }>(
      `/calendar/posts?brandId=${brandId}&from=${from}&to=${to}`,
    ),

  schedule: (payload: Partial<CalendarPost>) =>
    request<{ post: CalendarPost }>('/calendar/schedule', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  reschedule: (id: string, scheduledAt: string) =>
    request<{ post: CalendarPost }>(`/calendar/posts/${id}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify({ scheduledAt }),
    }),

  unschedule: (id: string) =>
    request<{ message: string }>(`/calendar/posts/${id}`, { method: 'DELETE' }),
};

// ─── Planner ─────────────────────────────────────────────────────────────────
export const planner = {
  today: (brandId: string) =>
    request<{ tasks: PlannerTask[] }>(`/planner/today?brandId=${brandId}`),

  tasks: (brandId: string) =>
    request<{ tasks: PlannerTask[] }>(`/planner/tasks?brandId=${brandId}`),

  create: (payload: Partial<PlannerTask>) =>
    request<{ task: PlannerTask }>('/planner/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateStatus: (id: string, status: PlannerTask['status']) =>
    request<{ task: PlannerTask }>(`/planner/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/planner/tasks/${id}`, { method: 'DELETE' }),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analytics = {
  overview: (period: '7d' | '30d' | '90d' = '30d') =>
    request<AnalyticsSummary>(`/analytics/overview?period=${period}`),

  byCampaign: (campaignId: string) =>
    request<Record<string, number>>(`/analytics/campaigns/${campaignId}`),

  byPlatform: (brandId: string, platform: SocialPlatform) =>
    request<Record<string, number>>(`/analytics/platform/${platform}?brandId=${brandId}`),
};

// ─── Progression ──────────────────────────────────────────────────────────────
export const progression = {
  get: () => request<UserProgression>('/progression'),

  office: () => request<OfficeState>('/progression/office'),

  achievements: () => request<{ achievements: Achievement[] }>('/progression/achievements'),

  addEvent: (eventType: string, metadata?: Record<string, unknown>) =>
    request<{ progression: UserProgression; officeState: OfficeState }>(
      '/progression/event',
      {
        method: 'POST',
        body: JSON.stringify({ eventType, metadata }),
      },
    ),

  openLootbox: () =>
    request<{ rewards: LootboxReward[]; progression: UserProgression }>(
      '/progression/lootbox/open',
      { method: 'POST' },
    ),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notifications = {
  list: () => request<{ notifications: Notification[] }>('/notifications'),

  markRead: (id: string) =>
    request<{ message: string }>(`/notifications/${id}/read`, { method: 'PATCH' }),

  markAllRead: () =>
    request<{ message: string }>('/notifications/read-all', { method: 'PATCH' }),
};

// ─── Integrations ─────────────────────────────────────────────────────────────
export const integrations = {
  status: (provider: string) =>
    request<IntegrationStatus>(`/integrations/${provider}/status`),

  connect: (provider: string) =>
    request<{ url: string }>(`/integrations/${provider}/connect`),

  disconnect: (provider: string) =>
    request<{ message: string }>(`/integrations/${provider}/disconnect`, {
      method: 'DELETE',
    }),

  listAll: () =>
    request<{ integrations: IntegrationStatus[] }>('/integrations'),
};

// ─── Creator Hub ─────────────────────────────────────────────────────────────
export const creator = {
  profile: () =>
    request<{
      userId: string;
      name: string;
      rank: string;
      level: number;
      prestigeRank: number;
      currentStreak: number;
      longestStreak: number;
      generationsCount: number;
      achievements: Achievement[];
      officeLevel: number;
      unlockedScenes: string[];
    }>('/creator/profile'),
};

// ─── AI Content Generation ────────────────────────────────────────────────────
export const generate = {
  content: (payload: {
    brandId: string;
    audienceId?: string;
    tone: BrandTone;
    platforms: SocialPlatform[];
    goals: string[];
    contentType: 'post' | 'story' | 'reel' | 'ad' | 'email';
    topic: string;
    keywords: string[];
  }) =>
    request<{
      generationId: string;
      copy: string[];
      captions: string[];
      hashtags: string[];
      variations: string[];
    }>('/generate/content', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  autoSchedule: (artifactId: string) =>
    request<{ scheduledAt: string; reason: string }>(
      '/generate/auto-schedule',
      {
        method: 'POST',
        body: JSON.stringify({ artifactId }),
      },
    ),
};

// ─── PPC ─────────────────────────────────────────────────────────────────────
export const ppc = {
  campaigns: (brandId: string) =>
    request<{ campaigns: unknown[] }>(`/ppc/campaigns?brandId=${brandId}`),

  create: (payload: {
    brandId: string;
    name: string;
    platform: 'google' | 'meta';
    budget: number;
    objective: string;
  }) =>
    request<{ campaign: unknown }>('/ppc/campaigns', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  metrics: (campaignId: string) =>
    request<Record<string, number>>(`/ppc/campaigns/${campaignId}/metrics`),
};

// ─── Default export for convenience ──────────────────────────────────────────
export const apiClient = {
  auth,
  users,
  brands,
  campaigns,
  content,
  calendar,
  planner,
  analytics,
  progression,
  notifications,
  integrations,
  creator,
  generate,
  ppc,
  setAccessToken,
};

export default apiClient;
