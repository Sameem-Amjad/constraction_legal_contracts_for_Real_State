export const BRAND_LOGO_URL =
  'https://aneaqwvhbqcijysamcga.supabase.co/storage/v1/object/public/logos/fbf0022e-8600-415a-9d39-00d0e5005d5e/logo_1777903461784.png'

export const PLAN_PRICES = {
  SINGLE_CONTRACT: 99,
  MONTHLY_SUBSCRIPTION: 349,
} as const

export const STORAGE_BUCKETS = {
  LOGOS: 'logos',
  CONTRACTS: 'contracts',
  COMPANY_IMAGES: 'company-images',
} as const

export const CONTRACT_TYPES = {
  CC: 'client-contractor',
  GC: 'gc-subcontractor',
} as const

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  CANCELED: 'canceled',
  PAST_DUE: 'past_due',
} as const

export const CONTRACT_STATUS = {
  DRAFT: 'draft',
  GENERATED: 'generated',
  PAID: 'paid',
  SIGNED: 'signed',
  COMPLETED: 'completed',
} as const

export const ACTIVITY_ACTIONS = {
  LOGIN: 'login',
  SIGNUP: 'signup',
  LOGOUT: 'logout',
  PASSWORD_RESET: 'password_reset',
  CONTRACT_GENERATED: 'contract_generated',
  CONTRACT_PAID: 'contract_paid',
  CONTRACT_DOWNLOADED: 'contract_downloaded',
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  SUBSCRIPTION_RENEWED: 'subscription_renewed',
  PROFILE_UPDATED: 'profile_updated',
} as const

export const SUPPORTED_LOGO_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
] as const

export const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024
