import Link from 'next/link'

export default function ConfirmationPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="max-w-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6 text-3xl">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-stone-800 mb-3">
          ¡Pago confirmado!
        </h1>
        <p className="text-stone-500 mb-2">
          Tu sesión ha sido reservada. El Socorrista recibirá una notificación ahora mismo.
        </p>
        <p className="text-stone-400 text-sm mb-8">
          Tienes hasta <strong>3 minutos</strong> para que confirme. Si no responde, te reembolsaremos automáticamente.
        </p>
        <Link
          href="/"
          className="inline-block bg-stone-800 hover:bg-stone-900 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}
