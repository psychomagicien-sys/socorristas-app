export const metadata = {
  title: 'Menciones Legales | Socorristas Emocionales',
}

export default function MencionesLegalesPage() {
  return (
    <main className="min-h-screen bg-stone-950 text-stone-200 px-6 py-16">
      <div className="max-w-2xl mx-auto space-y-10">
        <h1 className="text-3xl font-bold text-white">Menciones Legales</h1>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-rose-400">Editor del sitio</h2>
          <p>
            <strong>Nombre comercial:</strong> Socorristas Emocionales
          </p>
          <p>
            <strong>Responsable:</strong> [Tu nombre completo]
          </p>
          <p>
            <strong>NIF / NIE:</strong> [Tu número de identificación fiscal]
          </p>
          <p>
            <strong>Dirección:</strong> [Tu dirección completa]
          </p>
          <p>
            <strong>Correo electrónico:</strong>{' '}
            <a href="mailto:hola@socorristasemocionales.com" className="text-rose-400 underline">
              hola@socorristasemocionales.com
            </a>
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-rose-400">Alojamiento</h2>
          <p>
            <strong>Proveedor:</strong> Vercel Inc.
          </p>
          <p>
            <strong>Dirección:</strong> 340 Pine Street, Suite 701, San Francisco, CA 94104, EE. UU.
          </p>
          <p>
            <strong>Sitio web:</strong>{' '}
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-400 underline"
            >
              vercel.com
            </a>
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-rose-400">Actividad</h2>
          <p>
            Socorristas Emocionales es una plataforma de intermediación que conecta a personas que
            buscan acompañamiento emocional puntual con practicantes certificados O.R.A. por la EIPV.
          </p>
          <p>
            Los Socorristas Emocionales <strong>no son profesionales sanitarios</strong>. El
            acompañamiento ofrecido no constituye psicoterapia ni tratamiento médico.
          </p>
          <p className="text-rose-400 font-semibold">
            En caso de peligro inmediato para tu vida o la de otra persona, llama al 112.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-rose-400">Propiedad intelectual</h2>
          <p>
            Todos los contenidos de este sitio (textos, logotipos, imágenes) son propiedad exclusiva
            de Socorristas Emocionales. Queda prohibida su reproducción sin autorización previa y por
            escrito.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-rose-400">Pagos</h2>
          <p>
            Los pagos en línea son gestionados de forma segura por{' '}
            <strong>Stripe Payments Europe, Ltd.</strong> Socorristas Emocionales no almacena
            ningún dato bancario.
          </p>
        </section>

        <p className="text-stone-500 text-sm pt-6">Última actualización: junio de 2026</p>
      </div>
    </main>
  )
}
