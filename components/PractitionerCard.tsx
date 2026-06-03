'use client'

import { useRouter } from 'next/navigation'
import { Practitioner } from '@/types'

const LANGUAGE_LABELS: Record<string, string> = {
  es: 'Español',
  'es-MX': 'Español (México)',
  'es-AR': 'Español (Argentina)',
  en: 'English',
}

const COUNTRY_FLAGS: Record<string, string> = {
  ES: '🇪🇸',
  MX: '🇲🇽',
  AR: '🇦🇷',
  CO: '🇨🇴',
}

interface Props {
  practitioner: Practitioner & { profiles: { first_name: string } }
  mode?: string
}

export default function PractitionerCard({ practitioner: p, mode }: Props) {
  const router = useRouter()
  const isReservar = mode === 'reservar'

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-stone-200 flex items-center justify-center text-stone-400 text-xl font-semibold shrink-0">
          {p.profiles?.first_name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-semibold text-stone-800 text-lg">
              {p.profiles?.first_name}
            </h2>
            {p.is_available_now && !isReservar && (
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Disponible ahora
              </span>
            )}
          </div>
          <p className="text-stone-400 text-sm">
            {COUNTRY_FLAGS[p.country] ?? ''} {p.country}
          </p>
        </div>
      </div>

      <p className="text-stone-600 text-sm leading-relaxed line-clamp-3">{p.bio}</p>

      <div className="flex flex-wrap gap-1">
        {p.languages.map((lang) => (
          <span key={lang} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
            {LANGUAGE_LABELS[lang] ?? lang}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-stone-400 border-t border-stone-50 pt-3">
        <span className="font-mono text-xs">EIPV #{p.eipv_certification_number}</span>
        <span className="flex items-center gap-1">
          ⭐ {p.avg_rating > 0 ? p.avg_rating.toFixed(1) : '—'}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-stone-800">29€</span>
        <button
          onClick={() =>
            isReservar
              ? router.push(`/reservar/${p.id}`)
              : router.push(`/pago/${p.id}`)
          }
          className="bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          {isReservar ? 'Ver agenda' : 'Seleccionar'}
        </button>
      </div>
    </div>
  )
}
