'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Props {
  sessionId: string
  initialStatus: string
  practitionerName: string
}

export default function WaitingRoom({ sessionId, initialStatus, practitionerName }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(initialStatus)
  const [timeLeft, setTimeLeft] = useState(180) // 3 minutes

  // Écoute Supabase Realtime pour les changements de statut
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`session-${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `id=eq.${sessionId}` },
        (payload) => {
          const newStatus = payload.new.status
          setStatus(newStatus)
          if (newStatus === 'confirmed') {
            setTimeout(() => router.push(`/session/${sessionId}`), 1500)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [sessionId, router])

  // Compte à rebours
  useEffect(() => {
    if (status !== 'pending_practitioner') return
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(interval); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [status])

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0')
  const seconds = (timeLeft % 60).toString().padStart(2, '0')
  const progress = (timeLeft / 180) * 100

  // Session confirmée
  if (status === 'confirmed') {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="max-w-sm">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6 text-4xl animate-bounce">
            ✅
          </div>
          <h1 className="text-2xl font-bold text-stone-800 mb-3">¡{practitionerName} ha aceptado!</h1>
          <p className="text-stone-500">Entrando a la sesión…</p>
        </div>
      </main>
    )
  }

  // Session remboursée
  if (status === 'refunded') {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="max-w-sm">
          <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-6 text-4xl">
            😔
          </div>
          <h1 className="text-2xl font-bold text-stone-800 mb-3">Ningún Socorrista disponible</h1>
          <p className="text-stone-500 mb-2">Lo sentimos. Tu pago de <strong>29€</strong> ha sido reembolsado automáticamente.</p>
          <p className="text-stone-400 text-sm mb-8">Aparecerá en tu cuenta en 3-5 días hábiles.</p>
          <Link href="/" className="inline-block bg-stone-800 hover:bg-stone-900 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
            Intentarlo de nuevo
          </Link>
        </div>
      </main>
    )
  }

  // En attente
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="max-w-sm w-full">
        <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-6 text-4xl">
          ⏳
        </div>
        <h1 className="text-2xl font-bold text-stone-800 mb-2">¡Pago confirmado!</h1>
        <p className="text-stone-500 mb-6">
          Hemos notificado a <strong>{practitionerName}</strong>. Está respondiendo…
        </p>

        {/* Compte à rebours */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-6">
          <p className="text-stone-400 text-sm mb-2">Tiempo restante para confirmar</p>
          <div className={`text-5xl font-mono font-bold mb-4 ${timeLeft < 60 ? 'text-rose-600' : 'text-stone-800'}`}>
            {minutes}:{seconds}
          </div>
          {/* Barre de progression */}
          <div className="w-full bg-stone-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ${timeLeft < 60 ? 'bg-rose-500' : 'bg-emerald-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <p className="text-stone-400 text-xs">
          Si no responde en el tiempo indicado, tu pago será reembolsado automáticamente.
        </p>
      </div>
    </main>
  )
}
