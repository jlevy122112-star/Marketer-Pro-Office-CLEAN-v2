/**
 * stripeSyncService.ts
 * Marketer Pro — Stripe → Supabase sync service.
 *
 * Single function that takes any Stripe subscription object
 * and upserts the canonical subscription record in Supabase.
 * Called by webhook handler AND by the cron catch-up job.
 *
 * This is the source of truth writer — all reads go to Supabase,
 * never back to Stripe at runtime.
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { getPlanFromPriceId, type PlanId } from './stripeProducts';

// ─── Supabase admin client (service role — bypasses RLS) ─────────────────────

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Never expose this to frontend
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SubscriptionRecord {
  id: string;
  tenant_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  plan: PlanId;
  billing_interval: 'monthly' | 'annual';
  status: string;
  trial_start: string | null;
  trial_end: string | null;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  ended_at: string | null;
  updated_at: string;
}

// ─── Sync a Stripe subscription → Supabase ───────────────────────────────────

export async function syncSubscriptionToDatabase(
  subscription: Stripe.Subscription,
  tenantId?: string
): Promise<void> {
  const priceItem = subscription.items.data[0];
  if (!priceItem) {
    console.error('[StripeSyncService] Subscription has no price items:', subscription.id);
    return;
  }

  const priceId = priceItem.price.id;
  const planInfo = getPlanFromPriceId(priceId);

  if (!planInfo) {
    console.error('[StripeSyncService] Unknown price ID:', priceId);
    return;
  }

  // Resolve tenant_id from customer metadata if not passed directly
  let resolvedTenantId = tenantId;
  if (!resolvedTenantId) {
    const customer = subscription.customer as Stripe.Customer;
    resolvedTenantId = customer?.metadata?.tenant_id;
  }
  if (!resolvedTenantId) {
    // Look up by stripe_customer_id
    const { data } = await supabaseAdmin
      .from('stripe_customers')
      .select('tenant_id')
      .eq('stripe_customer_id', subscription.customer as string)
      .single();
    resolvedTenantId = data?.tenant_id;
  }
  if (!resolvedTenantId) {
    console.error('[StripeSyncService] Cannot resolve tenant_id for subscription:', subscription.id);
    return;
  }

  const record: Omit<SubscriptionRecord, 'id'> = {
    tenant_id: resolvedTenantId,
    stripe_customer_id: subscription.customer as string,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    plan: planInfo.planId,
    billing_interval: planInfo.interval,
    status: subscription.status,
    trial_start: subscription.trial_start
      ? new Date(subscription.trial_start * 1000).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
    ended_at: subscription.ended_at
      ? new Date(subscription.ended_at * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .upsert(record, {
      onConflict: 'stripe_subscription_id',
      ignoreDuplicates: false,
    });

  if (error) {
    console.error('[StripeSyncService] Upsert failed:', error);
    throw error;
  }

  console.log(`[StripeSyncService] Synced subscription ${subscription.id} → tenant ${resolvedTenantId} (${planInfo.planId}/${planInfo.interval}/${subscription.status})`);
}

// ─── Sync a Stripe customer → Supabase ───────────────────────────────────────

export async function syncCustomerToDatabase(
  customerId: string,
  tenantId: string,
  email: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('stripe_customers')
    .upsert(
      { tenant_id: tenantId, stripe_customer_id: customerId, email, updated_at: new Date().toISOString() },
      { onConflict: 'tenant_id', ignoreDuplicates: false }
    );

  if (error) {
    console.error('[StripeSyncService] Customer upsert failed:', error);
    throw error;
  }
}

// ─── Get or create Stripe customer for a tenant ───────────────────────────────

export async function getOrCreateStripeCustomer(
  tenantId: string,
  email: string,
  name?: string
): Promise<string> {
  // Check if we already have a customer
  const { data: existing } = await supabaseAdmin
    .from('stripe_customers')
    .select('stripe_customer_id')
    .eq('tenant_id', tenantId)
    .single();

  if (existing?.stripe_customer_id) {
    return existing.stripe_customer_id;
  }

  // Create new Stripe customer
  const { stripe } = await import('./stripeClient');
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { tenant_id: tenantId },
  });

  // Save to Supabase
  await syncCustomerToDatabase(customer.id, tenantId, email);

  return customer.id;
}

// ─── Revoke access when subscription ends ────────────────────────────────────

export async function revokeSubscriptionAccess(
  stripeSubscriptionId: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'canceled',
      plan: 'free',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', stripeSubscriptionId);

  if (error) {
    console.error('[StripeSyncService] Revoke access failed:', error);
    throw error;
  }
}

// ─── Flag past-due subscription ───────────────────────────────────────────────

export async function flagPastDue(stripeSubscriptionId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', stripeSubscriptionId);

  if (error) throw error;
}

export { supabaseAdmin };
