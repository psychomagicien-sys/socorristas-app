import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { notifyPractitioner, notifyRefund } from '@/lib/notifications'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  const admin = createAdminClient()

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent

      // Mettre à jour le statut de la session
      const { data: session } = await admin
        .from('sessions')
        .update({ status: 'pending_practitioner' })
        .eq('stripe_payment_intent_id', pi.id)
        .select('*, practitioners(id, phone_whatsapp, profiles(first_name)), profiles!sessions_person_id_fkey(first_name)')
        .single()

      // Notifier le praticien (WhatsApp + Email)
      if (session) {
        const pract = session.practitioners as {
          id: string
          phone_whatsapp: string | null
          profiles: { first_name: string } | null
        } | null

        // Récupérer l'email du praticien via auth.users
        const { data: authUser } = await admin.auth.admin.getUserById(pract?.id ?? '')

        if (pract && authUser?.user?.email) {
          await notifyPractitioner({
            practitionerEmail: authUser.user.email,
            practitionerPhone: pract.phone_whatsapp,
            practitionerName: pract.profiles?.first_name ?? 'Socorrista',
            sessionId: session.id,
            mode: session.mode,
            scheduledAt: session.scheduled_at,
          }).catch(console.error)
        }
      }
      break
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge
      if (charge.payment_intent) {
        const { data: session } = await admin
          .from('sessions')
          .update({ status: 'refunded' })
          .eq('stripe_payment_intent_id', charge.payment_intent)
          .select('*, profiles!sessions_person_id_fkey(first_name)')
          .single()

        // Notifier le client du remboursement
        if (session) {
          const { data: authUser } = await admin.auth.admin.getUserById(session.person_id)
          const personProfile = session.profiles as { first_name: string } | null

          if (authUser?.user?.email) {
            await notifyRefund({
              personEmail: authUser.user.email,
              personName: personProfile?.first_name ?? 'cliente',
            }).catch(console.error)
          }
        }
      }
      break
    }

    default:
      console.log(`Événement non géré : ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

