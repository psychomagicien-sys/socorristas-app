'use client'

import { useState } from 'react'

export default function EmergencyButton() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-2">
      {expanded && (
        <div className="bg-white border border-red-200 rounded-2xl shadow-lg p-4 max-w-xs text-sm">
          <p className="font-semibold text-stone-800 mb-2">¿Estás en peligro inmediato?</p>
          <a
            href="tel:112"
            className="block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-center text-lg transition-colors"
          >
            📞 Llamar al 112
          </a>
          <p className="text-stone-400 text-xs mt-2 text-center">
            Servicio de emergencias gratuito 24h
          </p>
        </div>
      )}
      <button
        onClick={() => setExpanded(!expanded)}
        className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-3 rounded-full shadow-lg transition-all flex items-center gap-2"
      >
        🆘 {expanded ? 'Cerrar' : '112'}
      </button>
    </div>
  )
}
