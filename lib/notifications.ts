import twilio from 'twilio'
import { Resend } from 'resend'

// ─── WhatsApp via Twilio ───────────────────────────────────────────────────

export async function sendWhatsApp(to: string, message: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  console.log('[WhatsApp DEBUG] SID présent:', !!sid, '| SID début:', sid?.substring(0, 5))
  console.log('[WhatsApp DEBUG] Token présent:', !!token, '| Token longueur:', token?.length)
  if (!sid || !token || sid.trim() === '' || token.trim() === '') {
    console.log('[WhatsApp simulé]', to, message)
    return
  }

  const client = twilio(sid, token)

  try {
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM ?? 'whatsapp:+14155238886',
      to: `whatsapp:${to}`,
      body: message,
    })
    console.log('[WhatsApp] Message envoyé à', to)
  } catch (err) {
    console.error('[WhatsApp] Erreur envoi:', err)
    throw err // permet à l'appelant de détecter l'échec
  }
}

// ─── Email via Resend ──────────────────────────────────────────────────────

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes('VOTRE_CLE')) {
    console.log('[Email simulé]', to, subject)
    return
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: 'Socorristas Emocionales <hola@tusocorrista.com>',
    to,
    subject,
    html,
  })
}

// ─── Notification nouvelle session au praticien ───────────────────────────

export async function notifyPractitioner({
  practitionerEmail,
  practitionerPhone,
  practitionerName,
  sessionId,
  mode,
  scheduledAt,
}: {
  practitionerEmail: string
  practitionerPhone?: string | null
  practitionerName: string
  sessionId: string
  mode: 'ahora' | 'reservar'
  scheduledAt?: string | null
}) {
  const sessionUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/session/${sessionId}`

  const isAhora = mode === 'ahora'

  const whatsappMessage = isAhora
    ? `🆘 *Socorristas Emocionales*\n\nHola ${practitionerName}, una persona necesita acompañamiento *ahora mismo*.\n\n⏱️ Tienes *3 minutos* para confirmar.\n\n👉 Confirma aquí: ${sessionUrl}`
    : `📅 *Socorristas Emocionales*\n\nHola ${practitionerName}, tienes una nueva sesión reservada para el ${scheduledAt ? new Date(scheduledAt).toLocaleString('es-ES') : ''}.\n\n👉 Ver sesión: ${sessionUrl}`

  const emailHtml = isAhora
    ? `
      <h2>¡Nueva solicitud de sesión!</h2>
      <p>Hola <strong>${practitionerName}</strong>,</p>
      <p>Una persona necesita acompañamiento <strong>ahora mismo</strong>.</p>
      <p>⏱️ Tienes <strong>3 minutos</strong> para confirmar o la sesión se cancelará automáticamente.</p>
      <a href="${sessionUrl}" style="background:#e11d48;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
        Confirmar sesión →
      </a>
    `
    : `
      <h2>Nueva sesión reservada</h2>
      <p>Hola <strong>${practitionerName}</strong>,</p>
      <p>Tienes una nueva sesión reservada para el <strong>${scheduledAt ? new Date(scheduledAt).toLocaleString('es-ES') : ''}</strong>.</p>
      <a href="${sessionUrl}" style="background:#1c1917;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
        Ver sesión →
      </a>
    `

  // Envoyer WhatsApp d'abord, puis Email (toujours, comme fallback garanti)
  if (practitionerPhone) {
    try {
      await sendWhatsApp(practitionerPhone, whatsappMessage)
    } catch (err) {
      console.error('[notifyPractitioner] WhatsApp échoué, envoi email de secours:', err)
    }
  }

  // Email toujours envoyé (confirmation ou fallback)
  await sendEmail({
    to: practitionerEmail,
    subject: isAhora
      ? '🆘 Nueva sesión — responde en 3 minutos'
      : '📅 Nueva sesión reservada',
    html: emailHtml,
  })
}

// ─── Email de remboursement au client ─────────────────────────────────────

export async function notifyRefund({
  personEmail,
  personName,
}: {
  personEmail: string
  personName: string
}) {
  await sendEmail({
    to: personEmail,
    subject: 'Tu sesión ha sido reembolsada',
    html: `
      <p>Hola <strong>${personName}</strong>,</p>
      <p>Lo sentimos, ningún Socorrista ha podido confirmar tu sesión en el tiempo previsto.</p>
      <p>Tu pago de <strong>29€</strong> ha sido reembolsado automáticamente. Aparecerá en tu cuenta en 3-5 días hábiles.</p>
      <p>Puedes intentarlo de nuevo en cualquier momento:</p>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}" style="background:#e11d48;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
        Volver a Socorristas →
      </a>
      <p style="color:#999;font-size:12px;margin-top:24px;">
        En caso de peligro inmediato, llama al 112.
      </p>
    `,
  })
}
