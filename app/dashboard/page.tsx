import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'
import AgendaClient from './AgendaClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'practitioner') {
    redirect('/')
  }

  const { data: practitioner } = await supabase
    .from('practitioners')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: slots } = await supabase
    .from('availability_slots')
    .select('*')
    .eq('practitioner_id', user.id)
    .order('day_of_week')

  return (
    <>
      <DashboardClient profile={profile} practitioner={practitioner} />
      <div className="max-w-2xl mx-auto px-4 pb-12">
        <AgendaClient
          practitionerId={user.id}
          initialSlots={slots ?? []}
        />
      </div>
    </>
  )
}
