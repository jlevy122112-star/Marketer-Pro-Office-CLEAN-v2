/**
 * stripeClient.ts
 * Marketer Pro — Stripe SDK singleton.
 *
 * BACKEND ONLY. Never import this from frontend code.
 * Secret key stays server-side at all times.
 */

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('[Stripe] STRIPE_SECRET_KEY is not set. Check your environment variables.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
  typescript: true,
  appInfo: {
    name: 'Marketer Pro Office Edition',
    version: '2.0.0',
    url: 'https://marketerprooffice.com',
  },
  // Automatic retries on network failures (Stripe-side, not our code)
  maxNetworkRetries: 3,
});

export default stripe;
