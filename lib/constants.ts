// Hosted in the shared hub's public `construction-logos` bucket (re-upload the
// brand PNG to this path; the old project's copy is gone).
export const BRAND_LOGO_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/construction-logos/brand/logo.png`

export const PLAN_PRICES = {
  SINGLE_CONTRACT: 99,
  MONTHLY_SUBSCRIPTION: 349,
} as const

export const STORAGE_BUCKETS = {
  LOGOS: 'construction-logos',
  CONTRACTS: 'construction-contracts',
  COMPANY_IMAGES: 'construction-company-images',
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
