/**
 * stripe.ts
 * Marketer Pro — Frontend Stripe.js loader.
 *
 * Loads Stripe.js lazily — only when needed for payment UI.
 * Never runs in SSR/Node context.
 * Singleton — loads once, reuses the instance.
 *
 * Usage:
 *   const stripe = await getStripe();
 *   const result = await stripe.redirectToCheckout({ sessionId });
 */

import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { STRIPE_PUBLISHABLE_KEY } from '../config/plans.config';

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    if (!STRIPE_PUBLISHABLE_KEY) {
      console.error('[Stripe] VITE_STRIPE_PUBLISHABLE_KEY is not set');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
}

export default getStripe;
