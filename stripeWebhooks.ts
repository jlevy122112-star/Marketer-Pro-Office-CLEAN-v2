/**
 * stripeWebhooks.ts
 * Marketer Pro — Stripe webhook event handler.
 *
 * CRITICAL: This is the engine that keeps your app in sync with Stripe.
 * Without this, users can pay and your app never knows.
 *
 * Security:
 *   - Every event verified with Stripe webhook signature
 *   - Raw body required (not parsed JSON) for signature check
 *   - Idempotent — safe to receive same event twice
 *
 * Events handled:
 *   checkout.session.completed
 *   customer.subscription.created
 *   customer.subscription.updated
 *   customer.subscription.deleted
 *   invoice.payment_succeeded
 *   invoice.payment_failed
 *   invoice.payment_action_required
 *   customer.subscription.trial_will_end
 *   payment_method.attached
 */

import Stripe from 'stripe';
import { stripe } from './stripeClient';
import {
  syncSubscriptionToDatabase,
  syncCustomerToDatabase,
  revokeSubscriptionAccess,
  flagPastDue,
  supabaseAdmin,
} from './stripeSyncService';
import { sendEmail } from '../lib/email';

// ─── Webhook event processor ──────────────────────────────────────────────────

export async function handleStripeWebhook(
  rawBody: Buffer,
  signature: string
): Promise<{ received: boolean; eventType: string }> {

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error('[Webhook] STRIPE_WEBHOOK_SECRET not set');

  // ── Step 1: Verify signature ─────────────────────────────────────────────
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error('[Webhook] Signature verification failed:', err.message);
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }

  console.log(`[Webhook] Received: ${event.type} (${event.id})`);

  // ── Step 2: Idempotency check ────────────────────────────────────────────
  const { data: alreadyProcessed } = await supabaseAdmin
    .from('stripe_webhook_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .single();

  if (alreadyProcessed) {
    console.log(`[Webhook] Already processed event ${event.id} — skipping`);
    return { received: true, eventType: event.type };
  }

  // ── Step 3: Log event (before processing — so we don't double process on crash) ──
  await supabaseAdmin.from('stripe_webhook_events').insert({
    stripe_event_id: event.id,
    event_type: event.type,
    processed_at: new Date().toISOString(),
    payload: event,
  });

  // ── Step 4: Route to handler ─────────────────────────────────────────────
  try {
    switch (event.type) {

      // ── Checkout completed — user just paid ───────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === 'subscription' && session.subscription) {
          // Fetch full subscription object
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string,
            { expand: ['customer', 'items.data.price.product'] }
          );

          const tenantId = session.metadata?.tenant_id ??
            session.client_reference_id ?? undefined;

          await syncSubscriptionToDatabase(subscription, tenantId);

          // Save customer mapping
          if (session.customer && session.customer_email) {
            await syncCustomerToDatabase(
              session.customer as string,
              tenantId!,
              session.customer_email
            );
          }

          console.log(`[Webhook] checkout.session.completed → tenant ${tenantId} provisioned`);
        }
        break;
      }

      // ── Subscription created ──────────────────────────────────────────────
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscriptionToDatabase(subscription);
        break;
      }

      // ── Subscription updated (plan change, renewal, cancel scheduled) ─────
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscriptionToDatabase(subscription);

        // Notify user of plan changes
        const prevAttrs = event.data.previous_attributes as Partial<Stripe.Subscription>;
        if (prevAttrs?.items) {
          await notifyPlanChange(subscription);
        }
        break;
      }

      // ── Subscription deleted (ended, not just canceled) ───────────────────
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await revokeSubscriptionAccess(subscription.id);
        await notifySubscriptionEnded(subscription);
        break;
      }

      // ── Invoice paid — renew period ───────────────────────────────────────
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );
          await syncSubscriptionToDatabase(subscription);
        }
        break;
      }

      // ── Invoice payment failed — flag past due ────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await flagPastDue(invoice.subscription as string);
          await notifyPaymentFailed(invoice);
        }
        break;
      }

      // ── 3D Secure / bank auth required ───────────────────────────────────
      case 'invoice.payment_action_required': {
        const invoice = event.data.object as Stripe.Invoice;
        await notifyPaymentActionRequired(invoice);
        break;
      }

      // ── Trial ending in 3 days — send upgrade nudge ───────────────────────
      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription;
        await notifyTrialEnding(subscription);
        break;
      }

      // ── New payment method attached ───────────────────────────────────────
      case 'payment_method.attached': {
        // No action needed — just log
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    // Mark as successfully processed
    await supabaseAdmin
      .from('stripe_webhook_events')
      .update({ success: true })
      .eq('stripe_event_id', event.id);

  } catch (err) {
    console.error(`[Webhook] Handler failed for ${event.type}:`, err);
    await supabaseAdmin
      .from('stripe_webhook_events')
      .update({ success: false, error: String(err) })
      .eq('stripe_event_id', event.id);
    throw err;
  }

  return { received: true, eventType: event.type };
}

// ─── Email notification helpers ───────────────────────────────────────────────

async function getCustomerEmail(customerId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('stripe_customers')
    .select('email')
    .eq('stripe_customer_id', customerId)
    .single();
  return data?.email ?? null;
}

async function notifyPlanChange(subscription: Stripe.Subscription) {
  const email = await getCustomerEmail(subscription.customer as string);
  if (!email) return;
  await sendEmail({
    to: email,
    subject: 'Your Marketer Pro plan has been updated',
    template: 'plan-changed',
    data: { status: subscription.status },
  });
}

async function notifySubscriptionEnded(subscription: Stripe.Subscription) {
  const email = await getCustomerEmail(subscription.customer as string);
  if (!email) return;
  await sendEmail({
    to: email,
    subject: 'Your Marketer Pro subscription has ended',
    template: 'subscription-ended',
    data: { endedAt: new Date().toLocaleDateString() },
  });
}

async function notifyPaymentFailed(invoice: Stripe.Invoice) {
  const email = await getCustomerEmail(invoice.customer as string);
  if (!email) return;
  await sendEmail({
    to: email,
    subject: 'Action required: Payment failed',
    template: 'payment-failed',
    data: {
      amount: `$${((invoice.amount_due ?? 0) / 100).toFixed(2)}`,
      portalUrl: `${process.env.APP_URL}/settings/billing`,
    },
  });
}

async function notifyPaymentActionRequired(invoice: Stripe.Invoice) {
  const email = await getCustomerEmail(invoice.customer as string);
  if (!email) return;
  await sendEmail({
    to: email,
    subject: 'Action required: Authorize your payment',
    template: 'payment-action-required',
    data: {
      actionUrl: invoice.hosted_invoice_url ?? `${process.env.APP_URL}/settings/billing`,
    },
  });
}

async function notifyTrialEnding(subscription: Stripe.Subscription) {
  const email = await getCustomerEmail(subscription.customer as string);
  if (!email) return;
  const daysLeft = subscription.trial_end
    ? Math.ceil((subscription.trial_end * 1000 - Date.now()) / 86400000)
    : 3;
  await sendEmail({
    to: email,
    subject: `Your Marketer Pro trial ends in ${daysLeft} days`,
    template: 'trial-ending',
    data: {
      daysLeft,
      upgradeUrl: `${process.env.APP_URL}/settings/billing`,
    },
  });
}
