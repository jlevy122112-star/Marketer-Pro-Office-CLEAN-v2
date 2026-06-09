/**
 * syncSubscriptions.ts
 * Marketer Pro — Cron job: catch missed webhooks.
 *
 * Webhooks can fail (server down, timeout, network blip).
 * This job runs every hour and reconciles Stripe state
 * against our database for any subscriptions that look stale.
 *
 * Schedule: every hour via Railway CRON or node-cron.
 *
 * CRON expression: 0 * * * *  (top of every hour)
 */

import { stripe } from '../stripe/stripeClient';
import { syncSubscriptionToDatabase, supabaseAdmin } from '../stripe/stripeSyncService';

export async function syncAllSubscriptions(): Promise<void> {
  console.log('[SyncJob] Starting subscription reconciliation...');

  // Find subscriptions updated in Stripe in the last 2 hours
  // that might not have been synced via webhook
  const twoHoursAgo = Math.floor((Date.now() - 2 * 60 * 60 * 1000) / 1000);

  try {
    // Get all active Stripe subscriptions updated recently
    const subscriptions = await stripe.subscriptions.list({
      limit: 100,
      created: { gte: twoHoursAgo },
      expand: ['data.customer'],
    });

    let synced = 0;
    let skipped = 0;

    for (const sub of subscriptions.data) {
      try {
        // Check if our DB record is up to date
        const { data: existing } = await supabaseAdmin
          .from('subscriptions')
          .select('updated_at, status')
          .eq('stripe_subscription_id', sub.id)
          .single();

        const stripeUpdatedAt = new Date(sub.created * 1000);
        const dbUpdatedAt = existing?.updated_at ? new Date(existing.updated_at) : null;

        // Sync if DB is stale or missing
        if (!existing || !dbUpdatedAt || stripeUpdatedAt > dbUpdatedAt || existing.status !== sub.status) {
          await syncSubscriptionToDatabase(sub);
          synced++;
        } else {
          skipped++;
        }
      } catch (err) {
        console.error(`[SyncJob] Failed to sync subscription ${sub.id}:`, err);
      }
    }

    console.log(`[SyncJob] Complete — synced: ${synced}, skipped: ${skipped}`);
  } catch (err) {
    console.error('[SyncJob] Failed:', err);
    throw err;
  }
}

// ─── Entry point for cron execution ──────────────────────────────────────────

// Run directly: npx ts-node jobs/syncSubscriptions.ts
if (require.main === module) {
  syncAllSubscriptions()
    .then(() => process.exit(0))
    .catch((err) => { console.error(err); process.exit(1); });
}
