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

  const admin = createAdminClient()
  const { data: practitioner } = await admin
    .from('practitioners')
    .select('stripe_account_id')
    .eq('id', user.id)
    .single()

  if (!practitioner) {
    return NextResponse.json({ error: 'Praticien introuvable' }, { status: 404 })
  }

  let accountId = practitioner.stripe_account_id

  // Créer le compte Connect si inexistant
  if (!accountId) {
    const account = await stripe.accounts.create({ type: 'standard' })
    accountId = account.id
    await admin
      .from('practitioners')
      .update({ stripe_account_id: accountId })
      .eq('id', user.id)
  }

  // Générer le lien d'onboarding
  const origin = req.headers.get('origin') ?? 'http://localhost:3000'
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/dashboard?stripe=refresh`,
    return_url: `${origin}/dashboard?stripe=success`,
    type: 'account_onboarding',
  })

  return NextResponse.json({ url: accountLink.url })
}
