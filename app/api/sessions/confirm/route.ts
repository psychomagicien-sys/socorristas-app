import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { session_id, action } = await req.json() // action: 'confirm' | 'decline'
  const admin = createAdminClient()

  const { data: session } = await admin
    .from('sessions')
    .select('*')
    .eq('id', session_id)
    .eq('practitioner_id', user.id)
    .eq('status', 'pending_practitioner')
    .single()

  if (!session) {
    return NextResponse.json({ error: 'Session introuvable ou déjà traitée' }, { status: 404 })
  }

  if (action === 'decline') {
    // Rembourser automatiquement
    await stripe.refunds.create({
      payment_intent: session.stripe_payment_intent_id,
    })
    await admin
      .from('sessions')
      .update({ status: 'refunded' })
      .eq('id', session_id)
    return NextResponse.json({ success: true, status: 'refunded' })
  }

  if (action === 'confirm') {
    await admin
      .from('sessions')
      .update({ status: 'confirmed' })
      .eq('id', session_id)
    return NextResponse.json({ success: true, status: 'confirmed' })
  }

  return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
}
