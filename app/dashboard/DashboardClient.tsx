'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile, Practitioner } from '@/types'

interface Props {
  profile: Profile
  practitioner: Practitioner | null
}

export default function DashboardClient({ profile, practitioner }: Props) {
  const [isAvailable, setIsAvailable] = useState(practitioner?.is_available_now ?? false)
  const [bio, setBio] = useState(practitioner?.bio ?? '')
  const [phone, setPhone] = useState((practitioner as unknown as { phone_whatsapp?: string })?.phone_whatsapp ?? '')
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [saved, setSaved] = useState(false)
  const [connectLoading, setConnectLoading] = useState(false)

  async function handleStripeConnect() {
    setConnectLoading(true)
    const res = await fetch('/api/stripe/connect-onboarding', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setConnectLoading(false)
  }

  async function toggleAvailability() {
    setToggling(true)
    const supabase = createClient()
    const next = !isAvailable
    await supabase.from('practitioners').update({ is_available_now: next }).eq('id', profile.id)
    setIsAvailable(next)
    setToggling(false)
  }

  async function saveBio() {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('practitioners').update({ bio, phone_whatsapp: phone || null }).eq('id', profile.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-stone-800 mb-1">
        Hola, {profile.first_name}
      </h1>
      <p className="text-stone-500 text-sm mb-10">Panel del Socorrista</p>

      {/* Disponibilidad */}
      <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-stone-700 mb-4">Estado de disponibilidad</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-stone-800 font-medium">
              {isAvailable ? 'Estás en guardia' : 'No estás disponible'}
            </p>
            <p className="text-stone-400 text-sm mt-0.5">
              {isAvailable
                ? 'Las personas pueden contactarte ahora'
                : 'Activa tu guardia para recibir sesiones'}
            </p>
          </div>
          <button
            onClick={toggleAvailability}
            disabled={toggling}
            className={`relative w-14 h-7 rounded-full transition-colors focus:outline-none ${
              isAvailable ? 'bg-emerald-500' : 'bg-stone-200'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                isAvailable ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </section>

      {/* Bio */}
      <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-stone-700 mb-4">Tu presentación</h2>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          placeholder="Cuéntales a las personas quién eres y cómo trabajas…"
          className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none mb-3"
        />
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Número WhatsApp <span className="text-stone-400 font-normal">(para recibir alertas de nuevas sesiones)</span>
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+34 600 000 000"
          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
        <div className="flex items-center justify-between mt-3">
          {saved && <p className="text-emerald-600 text-sm">¡Guardado!</p>}
          <button
            onClick={saveBio}
            disabled={saving}
            className="ml-auto bg-stone-800 hover:bg-stone-900 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </section>

      {/* Stripe Connect */}
      <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-stone-700 mb-3">Cuenta de pagos (Stripe)</h2>
        {practitioner?.stripe_account_id ? (
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <p className="text-stone-600 text-sm">Cuenta Stripe conectada</p>
            <a
              href="https://dashboard.stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-xs text-rose-600 hover:underline"
            >
              Ver dashboard →
            </a>
          </div>
        ) : (
          <div>
            <p className="text-stone-500 text-sm mb-4">
              Conecta tu cuenta Stripe para recibir el 85% de cada sesión (≈24,65€).
            </p>
            <button
              onClick={handleStripeConnect}
              disabled={connectLoading}
              className="bg-[#635BFF] hover:bg-[#5851db] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {connectLoading ? 'Redirigiendo…' : 'Conectar con Stripe'}
            </button>
          </div>
        )}
      </section>

      {/* Certificación */}
      <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
        <h2 className="font-semibold text-stone-700 mb-3">Certificación EIPV</h2>
        <p className="text-stone-500 text-sm">
          Número de certificación:{' '}
          <span className="font-mono font-medium text-stone-700">
            {practitioner?.eipv_certification_number ?? '—'}
          </span>
        </p>
        <p className="text-stone-400 text-xs mt-2">
          Este número es visible públicamente en tu perfil.
        </p>
      </section>
    </main>
  )
}
