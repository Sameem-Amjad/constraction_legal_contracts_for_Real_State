import { z } from 'zod'

export const ProfileSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().optional(),
  entity_type: z.enum(['company', 'individual']).optional(),

  // Company fields
  company_name: z.string().optional(),
  incorporation_regime: z.enum(['quebec_inc', 'canada_inc']).optional(),
  rbq: z.string().optional(),
  head_office: z.string().optional(),
  ho_city: z.string().optional(),
  ho_postal: z.string().optional(),
  rep_name: z.string().optional(),
  rep_title: z.string().optional(),

  // Individual fields
  full_name: z.string().optional(),
  address: z.string().optional(),
  ind_city: z.string().optional(),
  ind_postal: z.string().optional(),

  logo_url: z.string().url().optional().or(z.literal('')),
})
export type ProfileInput = z.infer<typeof ProfileSchema>
