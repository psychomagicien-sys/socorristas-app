import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SessionClient from './SessionClient'

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: session } = await supabase
    .from('sessions')
    .select('*, practitioners(id, profiles(first_name)), profiles!sessions_person_id_fkey(first_name)')
    .eq('id', id)
    .or(`person_id.eq.${user.id},practitioner_id.eq.${user.id}`)
    .single()

  if (!session) redirect('/')

  return <SessionClient session={session} userId={user.id} />
}
