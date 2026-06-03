import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'
import { sendEmail, sendWhatsApp } from '@/lib/notifications'

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

    // Notifier le client que sa session est confirmée
    const { data: authUser } = await admin.auth.admin.getUserById(session.person_id)
    const { data: personProfile } = await admin
      .from('profiles')
      .select('first_name')
      .eq('id', session.person_id)
      .single()

    const { data: practProfile } = await admin
      .from('profiles')
      .select('first_name')
      .eq('id', session.practitioner_id)
      .single()

    const sessionUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://socorristas-app.vercel.app'}/session/${session_id}`
    const personName = (personProfile as { first_name: string } | null)?.first_name ?? 'cliente'
    const practName = (practProfile as { first_name: string } | null)?.first_name ?? 'tu Socorrista'

    if (authUser?.user?.email) {
      await Promise.allSettled([
        sendEmail({
          to: authUser.user.email,
          subject: '✅ Tu Socorrista ha aceptado — ¡entra ahora!',
          html: `
            <h2>¡${practName} ha aceptado tu sesión!</h2>
            <p>Hola <strong>${personName}</strong>,</p>
            <p>Tu Socorrista <strong>${practName}</strong> está listo para acompañarte ahora mismo.</p>
            <a href="${sessionUrl}" style="background:#e11d48;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;margin-top:12px;">
              Entrar a la sesión →
            </a>
            <p style="color:#999;font-size:12px;margin-top:24px;">En caso de peligro inmediato, llama al 112.</p>
          `,
        }),
      ])
    }

    return NextResponse.json({ success: true, status: 'confirmed' })
  }

  return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
}
