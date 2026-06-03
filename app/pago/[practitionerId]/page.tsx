'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe-client'
import { createClient } from '@/lib/supabase/client'
import CheckoutForm from '@/components/CheckoutForm'

export default function PagoPage() {
  const { practitionerId } = useParams<{ practitionerId: string }>()
  const router = useRouter()
  const [clientSecret, setClientSecret] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [practitionerName, setPractitionerName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push(`/login?redirect=/pago/${practitionerId}`)
        return
      }

      // Récupérer le nom du praticien
      const { data: pract } = await supabase
        .from('practitioners')
        .select('profiles(first_name)')
        .eq('id', practitionerId)
        .single()

      if (pract?.profiles) {
        const profiles = pract.profiles as unknown as { first_name: string } | { first_name: string }[]
        const profile = Array.isArray(profiles) ? profiles[0] : profiles
        setPractitionerName(profile?.first_name ?? '')
      }

      // Créer la session + PaymentIntent
      const res = await fetch('/api/sessions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ practitioner_id: practitionerId, mode: 'ahora' }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Error al iniciar el pago.')
        setLoading(false)
        return
      }

      setClientSecret(data.clientSecret)
      setSessionId(data.sessionId)
      setLoading(false)
    }

    init()
  }, [practitionerId, router])

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-stone-400">Preparando el pago…</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <p className="text-rose-600 mb-4">{error}</p>
          <button onClick={() => router.back()} className="text-stone-500 underline text-sm">
            Volver
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-stone-800 mb-2">Reservar sesión</h1>
        <p className="text-stone-500 text-sm mb-8">
          Introduce tus datos de pago para confirmar la sesión.
        </p>

        {clientSecret && (
          <Elements stripe={getStripe()} options={{ clientSecret, locale: 'es' }}>
            <CheckoutForm sessionId={sessionId} practitionerName={practitionerName} />
          </Elements>
        )}
      </div>
    </main>
  )
}
