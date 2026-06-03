'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  session: {
    id: string
    status: string
    daily_room_url: string | null
    person_id: string
    practitioner_id: string
    duration_minutes: number
    practitioners: { id: string; profiles: { first_name: string } | null } | null
  }
  userId: string
}

export default function SessionClient({ session, userId }: Props) {
  const router = useRouter()
  const isPractitioner = userId === session.practitioner_id
  const [timeLeft, setTimeLeft] = useState(session.duration_minutes * 60)
  const [rating, setRating] = useState(0)
  const [finished, setFinished] = useState(false)
  const [roomUrl, setRoomUrl] = useState(session.daily_room_url)
  const [loading, setLoading] = useState(!session.daily_room_url)

  const practitionerName = session.practitioners?.profiles?.first_name ?? 'Socorrista'

  // Créer la room si elle n'existe pas encore
  useEffect(() => {
    if (!roomUrl && session.status === 'confirmed') {
      fetch('/api/daily/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: session.id }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.url) setRoomUrl(d.url)
          setLoading(false)
        })
    }
  }, [roomUrl, session.id, session.status])

  // Timer
  useEffect(() => {
    if (finished || !roomUrl) return
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval)
          setFinished(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [finished, roomUrl])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const handleComplete = useCallback(async (selectedRating?: number) => {
    await fetch('/api/sessions/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: session.id, rating: selectedRating }),
    })
    router.push('/')
  }, [session.id, router])

  // Page de confirmation praticien
  if (session.status === 'pending_practitioner' && isPractitioner) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="max-w-sm w-full bg-white rounded-2xl shadow-sm border border-stone-100 p-8 text-center">
          <h1 className="text-xl font-bold text-stone-800 mb-3">Nueva solicitud de sesión</h1>
          <p className="text-stone-500 text-sm mb-8">
            Una persona necesita acompañamiento ahora. Tienes <strong>3 minutos</strong> para responder.
          </p>
          <div className="flex gap-3">
            <button
              onClick={async () => {
                await fetch('/api/sessions/confirm', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ session_id: session.id, action: 'confirm' }),
                })
                router.refresh()
              }}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Aceptar
            </button>
            <button
              onClick={async () => {
                await fetch('/api/sessions/confirm', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ session_id: session.id, action: 'decline' }),
                })
                router.push('/dashboard')
              }}
              className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold py-3 rounded-xl transition-colors"
            >
              Declinar
            </button>
          </div>
        </div>
      </main>
    )
  }

  // Page de fin avec notation
  if (finished) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="max-w-sm w-full">
          <h1 className="text-2xl font-bold text-stone-800 mb-3">Sesión finalizada</h1>
          {!isPractitioner && (
            <>
              <p className="text-stone-500 mb-6">¿Cómo valorarías tu sesión con {practitionerName}?</p>
              <div className="flex justify-center gap-2 mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-3xl transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-stone-200'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <button
                onClick={() => handleComplete(rating)}
                className="w-full bg-stone-800 hover:bg-stone-900 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {rating > 0 ? 'Enviar valoración' : 'Saltar y terminar'}
              </button>
            </>
          )}
          {isPractitioner && (
            <button
              onClick={() => handleComplete()}
              className="w-full bg-stone-800 hover:bg-stone-900 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Volver al panel
            </button>
          )}
        </div>
      </main>
    )
  }

  // Page de session en cours
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="max-w-2xl w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-stone-800">
            Sesión con {practitionerName}
          </h1>
          <div className={`font-mono text-2xl font-bold ${timeLeft < 120 ? 'text-rose-600' : 'text-stone-700'}`}>
            {formatTime(timeLeft)}
          </div>
        </div>

        {loading ? (
          <div className="bg-stone-100 rounded-2xl h-96 flex items-center justify-center">
            <p className="text-stone-400">Preparando la sala…</p>
          </div>
        ) : roomUrl ? (
          <iframe
            src={roomUrl}
            allow="camera; microphone; fullscreen; speaker; display-capture"
            className="w-full h-96 rounded-2xl border border-stone-200"
          />
        ) : null}

        <div className="flex justify-end mt-4">
          <button
            onClick={() => setFinished(true)}
            className="text-sm text-stone-400 hover:text-stone-600 underline"
          >
            Finalizar sesión
          </button>
        </div>
      </div>
    </main>
  )
}
