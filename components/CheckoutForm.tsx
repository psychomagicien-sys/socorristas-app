'use client'

import { useState } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

interface Props {
  sessionId: string
  practitionerName: string
}

export default function CheckoutForm({ sessionId, practitionerName }: Props) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError('')

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/session/${sessionId}/confirmation`,
      },
    })

    if (error) {
      setError(error.message ?? 'Error al procesar el pago.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="bg-stone-50 rounded-xl p-4 text-sm text-stone-600">
        <p>Sesión con <strong>{practitionerName}</strong></p>
        <p className="text-lg font-bold text-stone-800 mt-1">29€</p>
        <p className="text-xs text-stone-400 mt-1">Sesión única · ~20 minutos</p>
      </div>

      <PaymentElement />

      {error && <p className="text-rose-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
      >
        {loading ? 'Procesando…' : 'Pagar 29€'}
      </button>

      <p className="text-xs text-stone-400 text-center">
        Al pagar, aceptas nuestros{' '}
        <a href="/legal" target="_blank" className="underline hover:text-stone-600">Términos de uso</a>
        {' '}y la{' '}
        <a href="/privacidad" target="_blank" className="underline hover:text-stone-600">Política de privacidad</a>.
        Pago seguro con Stripe.
      </p>
    </form>
  )
}
