import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'
import { notifyRefund } from '@/lib/notifications'

export async function GET(req: NextRequest) {
  // Sécurité : vérifier le token Vercel Cron
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const admin = createAdminClient()

  // Trouver toutes les sessions en attente depuis plus de 3 minutes
  const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000).toISOString()

  const { data: expiredSessions } = await admin
    .from('sessions')
    .select('*, profiles!sessions_person_id_fkey(first_name)')
    .eq('status', 'pending_practitioner')
    .lt('created_at', threeMinutesAgo)

  if (!expiredSessions || expiredSessions.length === 0) {
    return NextResponse.json({ message: 'Aucune session expirée', count: 0 })
  }

  let refunded = 0

  for (const session of expiredSessions) {
    try {
      // Rembourser via Stripe
      await stripe.refunds.create({
        payment_intent: session.stripe_payment_intent_id,
      })

      // Mettre à jour le statut
      await admin
        .from('sessions')
        .update({ status: 'refunded' })
        .eq('id', session.id)

      // Notifier le client
      const { data: authUser } = await admin.auth.admin.getUserById(session.person_id)
      const personProfile = session.profiles as { first_name: string } | null

      if (authUser?.user?.email) {
        await notifyRefund({
          personEmail: authUser.user.email,
          personName: personProfile?.first_name ?? 'cliente',
        }).catch(console.error)
      }

      refunded++
      console.log(`Session ${session.id} remboursée automatiquement`)
    } catch (err) {
      console.error(`Erreur remboursement session ${session.id}:`, err)
    }
  }

  return NextResponse.json({ message: `${refunded} session(s) remboursée(s)`, count: refunded })
}
