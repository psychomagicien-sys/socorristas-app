import Stripe from 'stripe'

// Server-side only — never import this in client components
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
})

export const SESSION_PRICE_CENTS = 2900
export const PLATFORM_FEE_CENTS = Math.round(SESSION_PRICE_CENTS * 0.15) // 435
