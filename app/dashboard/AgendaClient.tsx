'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

interface Slot {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
}

interface Props {
  practitionerId: string
  initialSlots: Slot[]
}

export default function AgendaClient({ practitionerId, initialSlots }: Props) {
  const [slots, setSlots] = useState<Slot[]>(initialSlots)
  const [newDay, setNewDay] = useState(1)
  const [newStart, setNewStart] = useState('09:00')
  const [newEnd, setNewEnd] = useState('10:00')
  const [saving, setSaving] = useState(false)

  async function addSlot() {
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('availability_slots')
      .insert({
        practitioner_id: practitionerId,
        day_of_week: newDay,
        start_time: newStart,
        end_time: newEnd,
      })
      .select()
      .single()

    if (!error && data) {
      setSlots([...slots, data])
    }
    setSaving(false)
  }

  async function deleteSlot(id: string) {
    const supabase = createClient()
    await supabase.from('availability_slots').delete().eq('id', id)
    setSlots(slots.filter((s) => s.id !== id))
  }

  return (
    <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-6">
      <h2 className="font-semibold text-stone-700 mb-4">Agenda semanal</h2>

      {/* Lista de slots */}
      {slots.length === 0 && (
        <p className="text-stone-400 text-sm mb-4">No tienes horarios configurados.</p>
      )}
      <div className="flex flex-col gap-2 mb-6">
        {slots
          .sort((a, b) => a.day_of_week - b.day_of_week)
          .map((slot) => (
            <div key={slot.id} className="flex items-center justify-between bg-stone-50 rounded-xl px-4 py-2 text-sm">
              <span className="font-medium text-stone-700">{DAYS[slot.day_of_week]}</span>
              <span className="text-stone-500">{slot.start_time.slice(0,5)} – {slot.end_time.slice(0,5)}</span>
              <button
                onClick={() => deleteSlot(slot.id)}
                className="text-stone-300 hover:text-rose-500 transition-colors text-lg"
              >
                ×
              </button>
            </div>
          ))}
      </div>

      {/* Ajouter un slot */}
      <div className="border-t border-stone-100 pt-4">
        <p className="text-sm font-medium text-stone-600 mb-3">Añadir horario</p>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-stone-400 block mb-1">Día</label>
            <select
              value={newDay}
              onChange={(e) => setNewDay(Number(e.target.value))}
              className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {DAYS.map((day, i) => (
                <option key={i} value={i}>{day}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-stone-400 block mb-1">Inicio</label>
            <input
              type="time"
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
              className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div>
            <label className="text-xs text-stone-400 block mb-1">Fin</label>
            <input
              type="time"
              value={newEnd}
              onChange={(e) => setNewEnd(e.target.value)}
              className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <button
            onClick={addSlot}
            disabled={saving}
            className="bg-stone-800 hover:bg-stone-900 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            {saving ? '…' : '+ Añadir'}
          </button>
        </div>
      </div>
    </section>
  )
}
