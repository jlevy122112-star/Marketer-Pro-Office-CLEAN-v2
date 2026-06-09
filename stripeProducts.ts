/**
 * stripeProducts.ts
 * Marketer Pro — Product & Price ID registry.
 *
 * These IDs come from your Stripe Dashboard.
 * Steps to get them:
 *   1. Go to Stripe Dashboard → Products
 *   2. Create each product (Starter, Pro, Enterprise)
 *   3. Add monthly + annual prices to each
 *   4. Copy the price_xxx IDs into your .env
 *   5. This file reads from env — never hardcode live IDs here
 *
 * ENV VARS REQUIRED:
 *   STRIPE_PRO_MONTHLY_PRICE_ID
 *   STRIPE_PRO_ANNUAL_PRICE_ID
 *   STRIPE_ENTERPRISE_MONTHLY_PRICE_ID
 *   STRIPE_ENTERPRISE_ANNUAL_PRICE_ID
 *   STRIPE_PRO_PRODUCT_ID
 *   STRIPE_ENTERPRISE_PRODUCT_ID
 */

export type PlanId = 'free' | 'pro' | 'enterprise';
export type BillingInterval = 'monthly' | 'annual';

export interface PriceConfig {
  priceId: string;
  productId: string;
  planId: PlanId;
  interval: BillingInterval;
  unitAmount: number; // cents
  trialDays: number;
}

// ─── Price map ────────────────────────────────────────────────────────────────
// Loaded from environment — never hardcoded

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`[Stripe] Missing required env var: ${key}`);
  return val;
}

export const STRIPE_PRICES: Record<PlanId, Partial<Record<BillingInterval, PriceConfig>>> = {
  free: {},
  pro: {
    monthly: {
      priceId: requireEnv('STRIPE_PRO_MONTHLY_PRICE_ID'),
      productId: requireEnv('STRIPE_PRO_PRODUCT_ID'),
      planId: 'pro',
      interval: 'monthly',
      unitAmount: 2900, // $29.00
      trialDays: 14,
    },
    annual: {
      priceId: requireEnv('STRIPE_PRO_ANNUAL_PRICE_ID'),
      productId: requireEnv('STRIPE_PRO_PRODUCT_ID'),
      planId: 'pro',
      interval: 'annual',
      unitAmount: 19_900, // $199.00/year ($19/mo × 12 - discount rounding... adjust to match Stripe)
      trialDays: 14,
    },
  },
  enterprise: {
    monthly: {
      priceId: requireEnv('STRIPE_ENTERPRISE_MONTHLY_PRICE_ID'),
      productId: requireEnv('STRIPE_ENTERPRISE_PRODUCT_ID'),
      planId: 'enterprise',
      interval: 'monthly',
      unitAmount: 9900, // $99.00
      trialDays: 14,
    },
    annual: {
      priceId: requireEnv('STRIPE_ENTERPRISE_ANNUAL_PRICE_ID'),
      productId: requireEnv('STRIPE_ENTERPRISE_PRODUCT_ID'),
      planId: 'enterprise',
      interval: 'annual',
      unitAmount: 94_800, // $79/mo × 12
      trialDays: 14,
    },
  },
};

// ─── Reverse lookup: priceId → PlanId ────────────────────────────────────────

const priceIdToPlan = new Map<string, { planId: PlanId; interval: BillingInterval }>();

for (const [planId, intervals] of Object.entries(STRIPE_PRICES)) {
  for (const [interval, config] of Object.entries(intervals)) {
    if (config) {
      priceIdToPlan.set(config.priceId, {
        planId: planId as PlanId,
        interval: interval as BillingInterval,
      });
    }
  }
}

export function getPlanFromPriceId(priceId: string): { planId: PlanId; interval: BillingInterval } | null {
  return priceIdToPlan.get(priceId) ?? null;
}

export function getPriceConfig(planId: PlanId, interval: BillingInterval): PriceConfig | null {
  return STRIPE_PRICES[planId]?.[interval] ?? null;
}

// ─── Feature limits per plan ──────────────────────────────────────────────────

export const PLAN_LIMITS: Record<PlanId, {
  generationsPerMonth: number | null; // null = unlimited
  socialAccounts: number | null;
  brandProfiles: number | null;
  teamMembers: number | null;
  analyticsHistoryDays: number | null;
}> = {
  free: {
    generationsPerMonth: 25,
    socialAccounts: 1,
    brandProfiles: 1,
    teamMembers: 1,
    analyticsHistoryDays: 7,
  },
  pro: {
    generationsPerMonth: null,
    socialAccounts: 10,
    brandProfiles: 5,
    teamMembers: 3,
    analyticsHistoryDays: 90,
  },
  enterprise: {
    generationsPerMonth: null,
    socialAccounts: null,
    brandProfiles: null,
    teamMembers: null,
    analyticsHistoryDays: 365,
  },
};
