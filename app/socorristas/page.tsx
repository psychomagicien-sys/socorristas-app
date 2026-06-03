import { createClient } from '@/lib/supabase/server'
import RealtimePractitioners from '@/components/RealtimePractitioners'
import { Practitioner } from '@/types'

export const revalidate = 0

export default async function SocorristasPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>
}) {
  const { mode } = await searchParams
  const supabase = await createClient()

  const { data: practitioners } = await supabase
    .from('practitioners')
    .select('*, profiles(first_name)')
    .eq('is_active', true)
    .order('avg_rating', { ascending: false })

  const title = mode === 'reservar' ? 'Reservar una sesión' : 'Nuestros Socorristas'
  const subtitle = mode === 'reservar'
    ? 'Elige un Socorrista y selecciona un horario · 29€'
    : 'Practicantes certificados O.R.A. por la EIPV · Sesión única · 29€'

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-stone-800 mb-2">{title}</h1>
      <p className="text-stone-500 mb-8">{subtitle}</p>

      <RealtimePractitioners
        initialPractitioners={(practitioners ?? []) as unknown as (Practitioner & { profiles: { first_name: string } })[]}
        mode={mode}
      />
    </main>
  )
}
