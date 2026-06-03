import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="max-w-xl w-full">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="Socorristas Emocionales"
            width={120}
            height={120}
            className="rounded-full"
            priority
          />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-stone-800 mb-3">
          Socorristas Emocionales
        </h1>
        <p className="text-stone-500 text-lg mb-10 leading-relaxed">
          Acompañamiento emocional puntual con practicantes certificados O.R.A. por la EIPV.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/socorristas?mode=ahora"
            className="inline-flex items-center justify-center rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold px-8 py-4 text-base transition-colors shadow-md"
          >
            Necesito ayuda ahora
          </Link>
          <Link
            href="/socorristas?mode=reservar"
            className="inline-flex items-center justify-center rounded-2xl bg-stone-800 hover:bg-stone-900 text-white font-semibold px-8 py-4 text-base transition-colors shadow-md"
          >
            Reservar sesión
          </Link>
        </div>

        <p className="mt-12 text-xs text-stone-400 leading-relaxed max-w-sm mx-auto">
          Los Socorristas no son profesionales sanitarios. En caso de peligro inmediato, llama al <strong>112</strong>.
        </p>
      </div>
    </main>
  )
}
