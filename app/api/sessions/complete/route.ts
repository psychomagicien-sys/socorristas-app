import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { session_id, rating } = await req.json()
  const admin = createAdminClient()

  // Terminer la session
  await admin
    .from('sessions')
    .update({ status: 'completed' })
    .eq('id', session_id)
    .or(`person_id.eq.${user.id},practitioner_id.eq.${user.id}`)

  // Enregistrer la note si fournie
  if (rating && rating >= 1 && rating <= 5) {
    const { data: session } = await admin
      .from('sessions')
      .select('practitioner_id')
      .eq('id', session_id)
      .single()

    if (session) {
      await admin.from('reviews').insert({ session_id, rating })

      // Mettre à jour avg_rating du praticien
      const { data: reviews } = await admin
        .from('reviews')
        .select('rating')
        .eq('session_id', session_id)

      const { data: allReviews } = await admin
        .from('reviews')
        .select('rating, sessions!inner(practitioner_id)')
        .eq('sessions.practitioner_id', session.practitioner_id)

      if (allReviews && allReviews.length > 0) {
        const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        await admin
          .from('practitioners')
          .update({ avg_rating: Math.round(avg * 10) / 10 })
          .eq('id', session.practitioner_id)
      }
    }
  }

  return NextResponse.json({ success: true })
}
