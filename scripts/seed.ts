import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const practitioners = [
  {
    email: 'lucia.mendez@test.socorristas.com',
    first_name: 'Lucía',
    bio: 'Acompañante emocional con formación en psicología transpersonal. Ayudo a las personas a soltar cargas emocionales acumuladas con suavidad y presencia.',
    languages: ['es', 'es-MX'],
    country: 'ES',
    eipv_cert: 'EIPV-2024-0042',
    available: true,
    rating: 4.8,
  },
  {
    email: 'carlos.vega@test.socorristas.com',
    first_name: 'Carlos',
    bio: 'Practicante O.R.A. desde 2023. Me especializo en acompañar momentos de angustia y bloqueo emocional con la técnica de observación y regulación.',
    languages: ['es', 'es-MX'],
    country: 'MX',
    eipv_cert: 'EIPV-2023-0018',
    available: true,
    rating: 4.6,
  },
  {
    email: 'sofia.ruiz@test.socorristas.com',
    first_name: 'Sofía',
    bio: 'Socorrista certificada por la EIPV. Facilito espacios seguros para que las emociones puedan ser observadas y transformadas con gentileza.',
    languages: ['es'],
    country: 'ES',
    eipv_cert: 'EIPV-2024-0071',
    available: false,
    rating: 4.9,
  },
  {
    email: 'miguel.santos@test.socorristas.com',
    first_name: 'Miguel',
    bio: 'Con la técnica O.R.A. acompaño a las personas en sus momentos más difíciles. Mi enfoque es práctico, humano y sin juicios.',
    languages: ['es', 'es-AR'],
    country: 'ES',
    eipv_cert: 'EIPV-2023-0035',
    available: false,
    rating: 4.5,
  },
  {
    email: 'valentina.mora@test.socorristas.com',
    first_name: 'Valentina',
    bio: 'Terapeuta floral y practicante O.R.A. Integro varias herramientas para ofrecer un acompañamiento emocional completo y cálido.',
    languages: ['es', 'es-MX'],
    country: 'MX',
    eipv_cert: 'EIPV-2024-0089',
    available: true,
    rating: 4.7,
  },
]

const persons = [
  { email: 'persona1@test.socorristas.com', first_name: 'Ana' },
  { email: 'persona2@test.socorristas.com', first_name: 'Roberto' },
]

async function seed() {
  console.log('🌱 Démarrage du seed...')

  for (const p of practitioners) {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: p.email,
      password: 'Test1234!',
      email_confirm: true,
      user_metadata: { first_name: p.first_name, role: 'practitioner' },
    })

    if (authError) {
      console.error(`❌ Auth error for ${p.email}:`, authError.message)
      continue
    }

    const userId = authData.user.id

    await supabase.from('profiles').upsert({
      id: userId,
      role: 'practitioner',
      first_name: p.first_name,
    })

    await supabase.from('practitioners').upsert({
      id: userId,
      bio: p.bio,
      languages: p.languages,
      country: p.country,
      eipv_certification_number: p.eipv_cert,
      is_active: true,
      is_available_now: p.available,
      avg_rating: p.rating,
    })

    console.log(`✅ Socorrista créé : ${p.first_name} (${p.email})`)
  }

  for (const person of persons) {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: person.email,
      password: 'Test1234!',
      email_confirm: true,
      user_metadata: { first_name: person.first_name, role: 'person' },
    })

    if (authError) {
      console.error(`❌ Auth error for ${person.email}:`, authError.message)
      continue
    }

    await supabase.from('profiles').upsert({
      id: authData.user.id,
      role: 'person',
      first_name: person.first_name,
    })

    console.log(`✅ Personne créée : ${person.first_name} (${person.email})`)
  }

  console.log('🎉 Seed terminé !')
}

seed().catch(console.error)
