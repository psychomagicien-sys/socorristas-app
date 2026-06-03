import { createAdminClient } from '@/lib/supabase/admin'

export default async function AdminPage() {
  const admin = createAdminClient()

  const [
    { count: totalSessions },
    { count: confirmedSessions },
    { count: refundedSessions },
    { data: recentSessions },
    { count: activePractitioners },
  ] = await Promise.all([
    admin.from('sessions').select('*', { count: 'exact', head: true }),
    admin.from('sessions').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
    admin.from('sessions').select('*', { count: 'exact', head: true }).eq('status', 'refunded'),
    admin.from('sessions')
      .select('*, practitioners(profiles(first_name)), profiles!sessions_person_id_fkey(first_name)')
      .order('created_at', { ascending: false })
      .limit(10),
    admin.from('practitioners').select('*', { count: 'exact', head: true }).eq('is_available_now', true),
  ])

  const revenue = ((confirmedSessions ?? 0) * 29 * 0.15).toFixed(2)

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-stone-800 mb-2">Panel de administración</h1>
      <p className="text-stone-400 text-sm mb-8">Socorristas Emocionales — Vista general</p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="bg-stone-50 border border-stone-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-stone-800">{totalSessions ?? 0}</p>
          <p className="text-xs text-stone-500 mt-1">Sesiones totales</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-800">{confirmedSessions ?? 0}</p>
          <p className="text-xs text-stone-500 mt-1">Completadas</p>
        </div>
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-rose-800">{refundedSessions ?? 0}</p>
          <p className="text-xs text-stone-500 mt-1">Reembolsadas</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-800">{activePractitioners ?? 0}</p>
          <p className="text-xs text-stone-500 mt-1">Socorristas activos</p>
        </div>
      </div>

      {/* Revenus */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-10">
        <p className="text-emerald-700 text-sm font-medium">Ingresos plataforma (15%)</p>
        <p className="text-3xl font-bold text-emerald-800 mt-1">{revenue} €</p>
      </div>

      {/* Sessions récentes */}
      <h2 className="text-lg font-semibold text-stone-700 mb-4">Últimas sesiones</h2>
      <div className="flex flex-col gap-3">
        {recentSessions?.map((session) => {
          const pract = session.practitioners as { profiles: { first_name: string } | null } | null
          const person = session.profiles as { first_name: string } | null
          const statusMap: Record<string, { label: string; className: string }> = {
            pending_payment: { label: 'Pago pendiente', className: 'bg-yellow-100 text-yellow-700' },
            pending_practitioner: { label: 'Esperando', className: 'bg-blue-100 text-blue-700' },
            confirmed: { label: 'Confirmada', className: 'bg-emerald-100 text-emerald-700' },
            refunded: { label: 'Reembolsada', className: 'bg-rose-100 text-rose-700' },
            completed: { label: 'Completada', className: 'bg-stone-100 text-stone-600' },
          }
          const badge = statusMap[session.status] ?? { label: session.status, className: 'bg-stone-100 text-stone-600' }

          return (
            <div key={session.id} className="bg-white border border-stone-100 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-800">
                  {person?.first_name ?? '?'} → {pract?.profiles?.first_name ?? '?'}
                </p>
                <p className="text-xs text-stone-400 mt-0.5">
                  {new Date(session.created_at).toLocaleString('es-ES')}
                </p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${badge.className}`}>
                {badge.label}
              </span>
            </div>
          )
        })}
      </div>
    </main>
  )
}
