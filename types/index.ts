export type UserRole = 'person' | 'practitioner'

export interface Profile {
  id: string
  role: UserRole
  first_name: string
  created_at: string
}

export interface Practitioner {
  id: string
  bio: string
  languages: string[]
  country: string
  eipv_certification_number: string
  stripe_account_id: string | null
  is_available_now: boolean
  is_active: boolean
  avg_rating: number
  created_at: string
  profiles?: Profile
}

export interface AvailabilitySlot {
  id: string
  practitioner_id: string
  day_of_week: number
  start_time: string
  end_time: string
}

export const SESSION_PRICE_CENTS = 2900
export const PLATFORM_FEE_PERCENT = 0.15
