'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

interface Slot {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
}

export default function ReservarPage() {
  const { practitionerId } = useParams<{ practitionerId: string }>()
  const router = useRouter()
  const [slots, setSlots] = useState<Slot[]>([])
  const [practitionerName, setPractitionerName] = useState('')
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      const { data: pract } = await supabase
        .from('practitioners')
        .select('profiles(first_name), availability_slots(*)')
        .eq('id', practitionerId)
        .single()

      if (pract) {
        const profiles = pract.profiles as unknown as { first_name: string }
        setPractitionerName(profiles?.first_name ?? '')
        setSlots((pract.availability_slots as Slot[]) ?? [])
      }
      setLoading(false)
    }
    load()
  }, [practitionerId])

  // Générer les prochaines dates pour chaque slot (7 prochains jours)
  function getNextDates(dayOfWeek: number): string[] {
    const dates: string[] = []
    const today = new Date()
    for (let i = 1; i <= 14; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      if (d.getDay() === dayOfWeek) {
        dates.push(d.toISOString().split('T')[0])
        if (dates.length >= 3) break
      }
    }
    return dates
  }

  function handleSelectSlotAndDate(slot: Slot, date: string) {
    setSelectedSlot(slot)
    setSelectedDate(date)
  }

  async function handleConfirm() {
    if (!selectedSlot || !selectedDate) return
    const scheduledAt = `${selectedDate}T${selectedSlot.start_time}`
    router.push(`/pago/${practitionerId}?mode=reservar&scheduled_at=${encodeURIComponent(scheduledAt)}`)
  }

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-stone-400">Cargando agenda…</p>
      </main>
    )
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-stone-800 mb-1">Reservar sesión</h1>
      <p className="text-stone-500 text-sm mb-8">con {practitionerName} · 29€ · ~20 minutos</p>

      {slots.length === 0 && (
        <p className="text-stone-400 text-center py-8">
          Este Socorrista no tiene horarios disponibles por ahora.
        </p>
      )}

      <div className="flex flex-col gap-6">
        {slots
          .sort((a, b) => a.day_of_week - b.day_of_week)
          .map((slot) => {
            const dates = getNextDates(slot.day_of_week)
            return (
              <div key={slot.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
                <p className="font-semibold text-stone-700 mb-1">
                  {DAYS[slot.day_of_week]}
                </p>
                <p className="text-stone-400 text-sm mb-4">
                  {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {dates.map((date) => (
                    <button
                      key={date}
                      onClick={() => handleSelectSlotAndDate(slot, date)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        selectedSlot?.id === slot.id && selectedDate === date
                          ? 'bg-rose-600 text-white'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {new Date(date + 'T12:00:00').toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
      </div>

      {selectedSlot && selectedDate && (
        <div className="mt-8 bg-rose-50 rounded-2xl p-5">
          <p className="text-stone-700 text-sm mb-1">Sesión seleccionada:</p>
          <p className="font-semibold text-stone-800">
            {DAYS[selectedSlot.day_of_week]},{' '}
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
            })}{' '}
            a las {selectedSlot.start_time.slice(0, 5)}
          </p>
          <button
            onClick={handleConfirm}
            className="mt-4 w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Continuar al pago → 29€
          </button>
        </div>
      )}
    </main>
  )
}
