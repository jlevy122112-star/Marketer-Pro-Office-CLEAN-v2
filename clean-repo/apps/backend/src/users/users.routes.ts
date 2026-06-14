// FILE PATH: apps/backend/src/users/users.routes.ts
// ADD this route to your existing users router

import { Router } from 'express';
import { authGuard } from '../common/middleware/authguard';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// ── DELETE /me — in-app account deletion ──────────────────────────────────────
// Apple 5.1.1(v) and Google Play Data Safety require this to work in-app.
// Uses the Supabase service role key to delete the auth.users record.
// All other data cascades automatically via ON DELETE CASCADE in schema.
router.delete('/me', authGuard, async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // Use service role key — only available server-side, never exposed to client
    const adminClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,  // NOT the anon key
    );

    // This single call cascades to: profiles, brands, content_items,
    // scheduled_posts, platform_connections, subscriptions, analytics_snapshots
    // because migrate.sql has ON DELETE CASCADE on all foreign keys
    const { error } = await adminClient.auth.admin.deleteUser(userId);
    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[DELETE /me]', err);
    return res.status(500).json({
      error: 'Deletion failed',
      message: err instanceof Error ? err.message : 'Internal error',
      userMessage: 'Account deletion failed. Please contact support@marketer-pro.app',
    });
  }
});

export default router;
