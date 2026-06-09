/**
 * billing.routes.ts
 * Marketer Pro — Express billing route handlers.
 *
 * Routes:
 *   POST /billing/checkout          → create Stripe checkout session
 *   POST /billing/portal            → create Stripe customer portal session
 *   POST /billing/cancel            → cancel subscription at period end
 *   POST /billing/reactivate        → undo scheduled cancellation
 *   GET  /billing/subscription      → get current subscription from DB
 *   GET  /billing/invoices          → list invoices from Stripe
 *   POST /billing/webhook           → Stripe webhook (raw body, no auth)
 *
 * IMPORTANT: /billing/webhook must receive raw Buffer body,
 * not parsed JSON. See middleware setup below.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { stripe } from '../stripe/stripeClient';
import { getPriceConfig } from '../stripe/stripeProducts';
import { handleStripeWebhook } from '../stripe/stripeWebhooks';
import {
  getOrCreateStripeCustomer,
  supabaseAdmin,
} from '../stripe/stripeSyncService';
import { requireAuth } from '../middleware/requireAuth';
import type { PlanId, BillingInterval } from '../stripe/stripeProducts';

const router = Router();

// ─── Helper: get tenant from request ─────────────────────────────────────────

function getTenantId(req: Request): string {
  return (req as any).tenantId;
}

function getUserEmail(req: Request): string {
  return (req as any).user?.email ?? '';
}

function getUserName(req: Request): string {
  return (req as any).user?.user_metadata?.full_name ?? '';
}

// ─── POST /billing/checkout ───────────────────────────────────────────────────

router.post('/checkout', requireAuth, async (req: Request, res: Response) => {
  try {
    const { planId, interval } = req.body as { planId: PlanId; interval: BillingInterval };

    const priceConfig = getPriceConfig(planId, interval);
    if (!priceConfig) {
      return res.status(400).json({ error: 'Invalid plan or interval' });
    }

    const tenantId = getTenantId(req);
    const email = getUserEmail(req);
    const name = getUserName(req);

    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(tenantId, email, name);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceConfig.priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: priceConfig.trialDays,
        metadata: { tenant_id: tenantId },
      },
      metadata: { tenant_id: tenantId },
      client_reference_id: tenantId,
      success_url: `${process.env.APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/billing/canceled`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      tax_id_collection: { enabled: true },
      automatic_tax: { enabled: true },
      // Prefill email
      customer_update: { address: 'auto' },
    });

    res.json({ url: session.url });
  } catch (err: any) {
    console.error('[Billing] Checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// ─── POST /billing/portal ─────────────────────────────────────────────────────

router.post('/portal', requireAuth, async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);

    const { data: customer } = await supabaseAdmin
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('tenant_id', tenantId)
      .single();

    if (!customer?.stripe_customer_id) {
      return res.status(404).json({ error: 'No billing account found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripe_customer_id,
      return_url: `${process.env.APP_URL}/settings/billing`,
    });

    res.json({ url: session.url });
  } catch (err: any) {
    console.error('[Billing] Portal error:', err);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// ─── POST /billing/cancel ─────────────────────────────────────────────────────

router.post('/cancel', requireAuth, async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);

    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .single();

    if (!sub?.stripe_subscription_id) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Cancel at period end — user keeps access until renewal date
    const updated = await stripe.subscriptions.update(sub.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    res.json({
      canceled: true,
      accessUntil: new Date(updated.current_period_end * 1000).toISOString(),
    });
  } catch (err: any) {
    console.error('[Billing] Cancel error:', err);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// ─── POST /billing/reactivate ─────────────────────────────────────────────────

router.post('/reactivate', requireAuth, async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);

    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('tenant_id', tenantId)
      .single();

    if (!sub?.stripe_subscription_id) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    await stripe.subscriptions.update(sub.stripe_subscription_id, {
      cancel_at_period_end: false,
    });

    res.json({ reactivated: true });
  } catch (err: any) {
    console.error('[Billing] Reactivate error:', err);
    res.status(500).json({ error: 'Failed to reactivate subscription' });
  }
});

// ─── GET /billing/subscription ────────────────────────────────────────────────

router.get('/subscription', requireAuth, async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);

    const { data: sub, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !sub) {
      // No subscription = free plan
      return res.json({
        plan: 'free',
        status: 'active',
        interval: 'monthly',
        currentPeriodEnd: null,
        trialEnd: null,
        cancelAtPeriodEnd: false,
      });
    }

    res.json({
      plan: sub.plan,
      status: sub.status,
      interval: sub.billing_interval,
      currentPeriodEnd: sub.current_period_end,
      trialEnd: sub.trial_end,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      stripeSubscriptionId: sub.stripe_subscription_id,
    });
  } catch (err: any) {
    console.error('[Billing] Get subscription error:', err);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// ─── GET /billing/invoices ────────────────────────────────────────────────────

router.get('/invoices', requireAuth, async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);

    const { data: customer } = await supabaseAdmin
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('tenant_id', tenantId)
      .single();

    if (!customer?.stripe_customer_id) {
      return res.json({ invoices: [] });
    }

    const invoices = await stripe.invoices.list({
      customer: customer.stripe_customer_id,
      limit: 24,
    });

    const formatted = invoices.data.map(inv => ({
      id: inv.id,
      date: new Date(inv.created * 1000).toISOString(),
      amount: inv.amount_paid,
      status: inv.status,
      downloadUrl: inv.invoice_pdf,
      hostedUrl: inv.hosted_invoice_url,
    }));

    res.json({ invoices: formatted });
  } catch (err: any) {
    console.error('[Billing] Invoices error:', err);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// ─── POST /billing/webhook ────────────────────────────────────────────────────
// NOTE: This route must receive raw Buffer body — do NOT parse as JSON.
// In your Express app setup:
//   app.use('/billing/webhook', express.raw({ type: 'application/json' }));
//   app.use('/billing', express.json()); // for all other billing routes

router.post(
  '/webhook',
  async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    try {
      const result = await handleStripeWebhook(req.body as Buffer, signature);
      res.json(result);
    } catch (err: any) {
      console.error('[Billing] Webhook error:', err.message);
      // Return 400 to tell Stripe to retry
      res.status(400).json({ error: err.message });
    }
  }
);

export default router;
