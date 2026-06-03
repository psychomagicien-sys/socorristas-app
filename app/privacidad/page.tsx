export default function PrivacidadPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-stone-800 mb-8">Política de privacidad</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-stone-700 mb-3">1. Responsable del tratamiento</h2>
        <p className="text-stone-500 text-sm leading-relaxed">
          Socorristas Emocionales es el responsable del tratamiento de tus datos personales.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-stone-700 mb-3">2. Datos que recogemos</h2>
        <ul className="text-stone-500 text-sm leading-relaxed list-disc list-inside space-y-1">
          <li>Nombre (solo el primero)</li>
          <li>Dirección de correo electrónico</li>
          <li>Datos de pago (gestionados por Stripe — nunca los almacenamos nosotros)</li>
          <li>Número de teléfono WhatsApp (solo para los practicantes)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-stone-700 mb-3">3. Para qué usamos tus datos</h2>
        <ul className="text-stone-500 text-sm leading-relaxed list-disc list-inside space-y-1">
          <li>Gestionar tu cuenta y tus sesiones</li>
          <li>Enviarte confirmaciones y notificaciones de sesión</li>
          <li>Procesar pagos y reembolsos</li>
          <li>Cumplir con nuestras obligaciones legales</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-stone-700 mb-3">4. Lo que NO hacemos</h2>
        <ul className="text-stone-500 text-sm leading-relaxed list-disc list-inside space-y-1">
          <li>No grabamos ni almacenamos el contenido de las sesiones de vídeo</li>
          <li>No vendemos tus datos a terceros</li>
          <li>No utilizamos tus datos para publicidad</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-stone-700 mb-3">5. Tus derechos (RGPD)</h2>
        <p className="text-stone-500 text-sm leading-relaxed">
          Tienes derecho a acceder, rectificar o eliminar tus datos en cualquier momento. Para ejercer estos derechos, escríbenos a: <strong>privacidad@socorristasemocionales.com</strong>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-stone-700 mb-3">6. Conservación de datos</h2>
        <p className="text-stone-500 text-sm leading-relaxed">
          Conservamos tus datos mientras tu cuenta esté activa. Si eliminas tu cuenta, tus datos personales se borran en un plazo de 30 días, salvo obligación legal de conservación.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-stone-700 mb-3">7. Cookies</h2>
        <p className="text-stone-500 text-sm leading-relaxed">
          Utilizamos únicamente cookies técnicas necesarias para el funcionamiento de la plataforma (autenticación, sesión). No utilizamos cookies de seguimiento ni publicitarias.
        </p>
      </section>

      <p className="text-stone-400 text-xs mt-12">Última actualización: junio 2026</p>
    </main>
  )
}
