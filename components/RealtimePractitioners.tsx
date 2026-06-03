'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import PractitionerCard from './PractitionerCard'
import { Practitioner } from '@/types'

type PractitionerWithProfile = Practitioner & { profiles: { first_name: string } }

interface Props {
  initialPractitioners: PractitionerWithProfile[]
  mode?: string
}

export default function RealtimePractitioners({ initialPractitioners, mode }: Props) {
  const [practitioners, setPractitioners] = useState(initialPractitioners)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('practitioners-availability')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'practitioners',
        },
        (payload) => {
          setPractitioners((prev) =>
            prev.map((p) =>
              p.id === payload.new.id
                ? { ...p, is_available_now: payload.new.is_available_now }
                : p
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (!practitioners.length) {
    return (
      <p className="text-stone-400 text-center py-16">
        No hay Socorristas disponibles en este momento.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {practitioners.map((p) => (
        <PractitionerCard key={p.id} practitioner={p} mode={mode} />
      ))}
    </div>
  )
}
