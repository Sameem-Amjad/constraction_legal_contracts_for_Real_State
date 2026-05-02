import { z } from 'zod'

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  STRIPE_PRICE_SINGLE: z.string().startsWith('price_'),
  STRIPE_PRICE_SUBSCRIPTION: z.string().startsWith('price_'),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
})

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
})

export type ServerEnv = z.infer<typeof serverEnvSchema>
export type ClientEnv = z.infer<typeof clientEnvSchema>

let cachedServerEnv: ServerEnv | null = null
let cachedClientEnv: ClientEnv | null = null

export function getServerEnv(): ServerEnv {
  if (cachedServerEnv) return cachedServerEnv
  const parsed = serverEnvSchema.safeParse(process.env)
  if (!parsed.success) {
    console.error(
      '[env] Invalid server environment variables:',
      parsed.error.flatten().fieldErrors
    )
    throw new Error(
      'Invalid server environment. Check .env.local and ensure all server-side keys are set.'
    )
  }
  cachedServerEnv = parsed.data
  return cachedServerEnv
}

export function getClientEnv(): ClientEnv {
  if (cachedClientEnv) return cachedClientEnv
  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  })
  if (!parsed.success) {
    console.error(
      '[env] Invalid client environment variables:',
      parsed.error.flatten().fieldErrors
    )
    throw new Error(
      'Invalid client environment. Check NEXT_PUBLIC_* variables in .env.local.'
    )
  }
  cachedClientEnv = parsed.data
  return cachedClientEnv
}
