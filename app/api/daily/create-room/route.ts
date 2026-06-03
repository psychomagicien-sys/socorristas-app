import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { session_id } = await req.json()
  const admin = createAdminClient()

  // Vérifier que la session appartient à cet utilisateur
  const { data: session } = await admin
    .from('sessions')
    .select('*')
    .eq('id', session_id)
    .or(`person_id.eq.${user.id},practitioner_id.eq.${user.id}`)
    .single()

  if (!session) {
    return NextResponse.json({ error: 'Session introuvable' }, { status: 404 })
  }

  if (!process.env.DAILY_API_KEY) {
    // Mode développement sans Daily.co : retourner un lien fictif
    const mockUrl = `https://socorristas.daily.co/session-${session_id}`
    await admin
      .from('sessions')
      .update({ daily_room_url: mockUrl, status: 'in_progress' })
      .eq('id', session_id)
    return NextResponse.json({ url: mockUrl })
  }

  // Créer une room Daily.co (durée max 35 min = 20 min session + marge)
  const expiresAt = Math.floor(Date.now() / 1000) + 35 * 60

  const response = await fetch('https://api.daily.co/v1/rooms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      name: `session-${session_id}`,
      privacy: 'private',
      properties: {
        exp: expiresAt,
        enable_recording: 'off', // RGPD : pas d'enregistrement
        start_video_off: false,
        start_audio_off: false,
        geo: 'eu', // Serveurs EU
      },
    }),
  })

  const room = await response.json()

  if (!response.ok) {
    return NextResponse.json({ error: room.error ?? 'Erreur Daily.co' }, { status: 500 })
  }

  await admin
    .from('sessions')
    .update({ daily_room_url: room.url, status: 'in_progress' })
    .eq('id', session_id)

  return NextResponse.json({ url: room.url })
}
