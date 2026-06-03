import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe, SESSION_PRICE_CENTS, PLATFORM_FEE_CENTS } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { practitioner_id, mode } = await req.json()

  if (!practitioner_id || !mode) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  // Vérifier que le praticien est actif et a un compte Stripe
  const admin = createAdminClient()
  const { data: practitioner } = await admin
    .from('practitioners')
    .select('*, profiles(first_name)')
    .eq('id', practitioner_id)
    .eq('is_active', true)
    .single()

  if (!practitioner) {
    return NextResponse.json({ error: 'Socorrista introuvable' }, { status: 404 })
  }

  if (!practitioner.stripe_account_id) {
    return NextResponse.json({ error: 'Ce Socorrista ne peut pas encore recevoir de paiements' }, { status: 400 })
  }

  // Créer le PaymentIntent Stripe
  // En prod : Destination Charge avec split 85/15
  // En test : paiement simple si le compte Connect n'est pas encore activé
  let paymentIntent
  try {
    const paymentIntentParams: Parameters<typeof stripe.paymentIntents.create>[0] = {
      amount: SESSION_PRICE_CENTS,
      currency: 'eur',
      metadata: {
        practitioner_id,
        person_id: user.id,
        mode,
      },
    }

    // Ajouter le split seulement si le compte Connect est activé
    if (practitioner.stripe_account_id && process.env.NODE_ENV === 'production') {
      paymentIntentParams.application_fee_amount = PLATFORM_FEE_CENTS
      paymentIntentParams.transfer_data = {
        destination: practitioner.stripe_account_id,
      }
    }

    paymentIntent = await stripe.paymentIntents.create(paymentIntentParams)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur Stripe inconnue'
    console.error('Stripe error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }

  // Créer la session en base
  const { data: session, error: sessionError } = await admin
    .from('sessions')
    .insert({
      person_id: user.id,
      practitioner_id,
      mode,
      status: 'pending_payment',
      amount_cents: SESSION_PRICE_CENTS,
      platform_fee_cents: PLATFORM_FEE_CENTS,
      stripe_payment_intent_id: paymentIntent.id,
    })
    .select()
    .single()

  if (sessionError) {
    return NextResponse.json({ error: sessionError.message }, { status: 500 })
  }

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    sessionId: session.id,
  })
}
