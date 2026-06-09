/**
 * billing.middleware.ts
 * Marketer Pro — Express middleware for billing routes.
 *
 * CRITICAL: Stripe webhook verification requires the RAW request body
 * as a Buffer — not parsed JSON. This middleware handles that split:
 *   - /billing/webhook → raw Buffer
 *   - all other /billing/* routes → parsed JSON
 *
 * Mount this BEFORE your billing routes in app.ts.
 */

import { Express, Request, Response, NextFunction } from 'express';
import express from 'express';

/**
 * Mount on your Express app:
 *
 *   import { mountBillingBodyParsers } from './middleware/billing.middleware';
 *   mountBillingBodyParsers(app);
 *   app.use('/billing', billingRouter);
 */
export function mountBillingBodyParsers(app: Express): void {
  // Raw body ONLY for webhook — must come before express.json()
  app.use(
    '/billing/webhook',
    express.raw({ type: 'application/json', limit: '1mb' })
  );

  // JSON for all other billing routes
  app.use(
    '/billing',
    express.json({ limit: '1mb' })
  );
}

// ─── requireAuth middleware ───────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js';

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  // Attach user and tenant to request
  (req as any).user = user;
  (req as any).tenantId = user.user_metadata?.tenant_id ?? user.id;

  next();
}
