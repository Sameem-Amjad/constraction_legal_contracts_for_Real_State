import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})
export type LoginInput = z.infer<typeof LoginSchema>

export const SignupSchema = z
  .object({
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    password: z.string().min(8),
    confirm_password: z.string().min(8),
    entity_type: z.enum(['company', 'individual']).optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })
export type SignupInput = z.infer<typeof SignupSchema>

export const PasswordResetRequestSchema = z.object({
  email: z.string().email(),
})
export type PasswordResetRequestInput = z.infer<typeof PasswordResetRequestSchema>

export const PasswordResetConfirmSchema = z
  .object({
    password: z.string().min(8),
    confirm_password: z.string().min(8),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })
export type PasswordResetConfirmInput = z.infer<typeof PasswordResetConfirmSchema>
