'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('cookies-accepted')
    if (!accepted) setVisible(true)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-stone-900 text-white px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 z-50">
      <p className="text-sm text-stone-300">
        Usamos cookies técnicas necesarias para el funcionamiento de la plataforma.{' '}
        <Link href="/privacidad" className="underline text-white hover:text-stone-200">
          Política de privacidad
        </Link>
      </p>
      <button
        onClick={() => {
          localStorage.setItem('cookies-accepted', 'true')
          setVisible(false)
        }}
        className="bg-white text-stone-900 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-stone-100 transition-colors whitespace-nowrap"
      >
        Aceptar
      </button>
    </div>
  )
}
