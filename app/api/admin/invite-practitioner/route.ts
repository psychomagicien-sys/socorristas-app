import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('x-admin-secret')
  if (authHeader !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const body = await req.json()
  const { email, first_name, eipv_certification_number, bio, languages, country } = body

  if (!email || !first_name || !eipv_certification_number) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: authUser, error: authError } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { first_name, role: 'practitioner' },
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  const userId = authUser.user.id

  const { error: profileError } = await supabase.from('profiles').insert({
    id: userId,
    role: 'practitioner',
    first_name,
  })

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  const { error: practError } = await supabase.from('practitioners').insert({
    id: userId,
    bio: bio ?? '',
    languages: languages ?? ['es'],
    country: country ?? 'ES',
    eipv_certification_number,
    is_active: true,
    is_available_now: false,
    avg_rating: 0,
  })

  if (practError) {
    return NextResponse.json({ error: practError.message }, { status: 500 })
  }

  if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('VOTRE_CLE')) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'Socorristas Emocionales <noreply@socorristasemocionales.com>',
      to: email,
      subject: 'Bienvenido/a a Socorristas Emocionales',
      html: `
        <p>Hola ${first_name},</p>
        <p>La EIPV te ha invitado a unirte como Socorrista certificado/a en nuestra plataforma.</p>
        <p>Tu número de certificación EIPV es: <strong>${eipv_certification_number}</strong></p>
        <p>Por favor, define tu contraseña a través del enlace que recibirás de Supabase para completar tu perfil.</p>
        <p>¡Bienvenido/a al equipo!</p>
      `,
    })
  }

  return NextResponse.json({ success: true, userId })
}
