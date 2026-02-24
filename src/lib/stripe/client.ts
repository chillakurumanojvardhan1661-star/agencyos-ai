import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Missing STRIPE_SECRET_KEY environment variable');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  }
  return stripeInstance;
}

export const stripe = new Proxy({} as Stripe, {
  get: (target, prop) => {
    return getStripe()[prop as keyof Stripe];
  }
});

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 49,
    features: ['5 clients', '50 AI generations/month', 'Basic reports'],
  },
  professional: {
    name: 'Professional',
    price: 149,
    features: ['20 clients', '200 AI generations/month', 'Advanced reports', 'Priority support'],
  },
  enterprise: {
    name: 'Enterprise',
    price: 399,
    features: ['Unlimited clients', 'Unlimited AI generations', 'Custom reports', 'Dedicated support'],
  },
};
