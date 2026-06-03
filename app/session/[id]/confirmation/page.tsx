import { createAdminClient } from '@/lib/supabase/admin'
import WaitingRoom from './WaitingRoom'

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: session } = await admin
    .from('sessions')
    .select('*, practitioners(id, profiles(first_name))')
    .eq('id', id)
    .single()

  const practitionerName =
    (session?.practitioners as { profiles: { first_name: string } | null } | null)
      ?.profiles?.first_name ?? 'tu Socorrista'

  return <WaitingRoom sessionId={id} initialStatus={session?.status ?? 'pending_payment'} practitionerName={practitionerName} />
}
