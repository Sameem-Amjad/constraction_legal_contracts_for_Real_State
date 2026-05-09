import { z } from 'zod'

// =============================================================================
// Schemas — follow the v2 wizard spec from "Development things.pdf".
// 12 steps for Client→Contractor, GC→Subcontractor, Subcontractor→GC flows.
// 11 steps for Contractor→Client (no Other Party Details step).
// =============================================================================

export const RoleStepSchema = z.object({
  role: z.enum(['client', 'contractor', 'gc', 'subcontractor']),
  form_type: z.enum(['client-contractor', 'gc-subcontractor']),
})
export type RoleStepInput = z.infer<typeof RoleStepSchema>

// Step 1 — Basics
export const BasicsStepSchema = z.object({
  project_name: z.string().min(1, 'Required'),
  project_site: z.string().min(1, 'Required'),
  project_city: z.string().min(1, 'Required'),
  project_postal: z.string().min(1, 'Required'),
  contract_price: z.number().positive('Must be a positive amount'),
  sign_date: z.string().min(1, 'Required'),
  // Only used on the Contractor→Client flow per the PDF spec.
  other_entity_type: z.enum(['company', 'individual', 'other']).optional(),
  // Owner fields — only used on GC→Subcontractor flow (owner of the immovable)
  owner_name: z.string().optional(),
  owner_address: z.string().optional(),
  owner_city: z.string().optional(),
  owner_postal: z.string().optional(),
})
export type BasicsStepInput = z.infer<typeof BasicsStepSchema>

// Used for both "your info" and "other party"
export const PartyInfoSchema = z.object({
  entity_type: z.enum(['company', 'individual', 'other']),
  // Company / Other fields
  company_name: z.string().optional(),
  incorporation_regime: z.enum(['quebec_inc', 'canada_inc']).optional(),
  other_incorporation_regime: z.string().optional(),
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
  // Contact
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  logo_url: z.string().url().optional().or(z.literal('')),
})
export type PartyInfoInput = z.infer<typeof PartyInfoSchema>

// Step 4 — Describe Work
export const DescribeWorkStepSchema = z.object({
  material_provider: z.enum(['contractor', 'client', 'shared']),
  project_description: z.string().min(10, 'Please describe the work'),
})
export type DescribeWorkStepInput = z.infer<typeof DescribeWorkStepSchema>

// Step 5 — When
export const WhenStepSchema = z.object({
  start_date: z.string().min(1, 'Required'),
  end_kind: z.enum(['date', 'duration']),
  end_date: z.string().optional(),
  duration_value: z.number().positive().optional(),
  duration_unit: z.enum(['days', 'weeks', 'months']).optional(),
})
export type WhenStepInput = z.infer<typeof WhenStepSchema>

export const MilestoneSchema = z.object({
  description: z.string(),
  amount: z.number().nonnegative(),
})
export type MilestoneInput = z.infer<typeof MilestoneSchema>

// Step 6 — Payment
export const PaymentStepSchema = z.object({
  payment_method: z.enum([
    'lump_sum',
    'single_payment_completion',
    'progress_payments',
    'milestone_payments',
    'time_and_materials',
  ]),
  time_materials_description: z.string().optional(),
  invoice_frequency: z.enum(['weekly', 'bi_weekly', 'monthly']).optional(),
  milestones: z.array(MilestoneSchema).optional(),
  payment_due_days: z.union([
    z.literal(0),
    z.literal(5),
    z.literal(15),
    z.literal(30),
    z.literal(45),
    z.literal(60),
  ]),
  advance_payment: z.boolean(),
  advance_payment_amount: z.number().nonnegative().optional(),
  advance_payment_type: z.enum(['$', '%']).optional(),
  holdback: z.boolean(),
  holdback_pct: z.number().min(0).max(100).optional(),
})
export type PaymentStepInput = z.infer<typeof PaymentStepSchema>

// Step 7 — Material Price Increases (Escalation)
export const EscalationStepSchema = z.object({
  escalation: z.boolean(),
  escalation_pct: z.number().min(0).max(100).optional(),
})
export type EscalationStepInput = z.infer<typeof EscalationStepSchema>

// Step 8 — If pay late
export const LatePayStepSchema = z.object({
  late_interest: z.number().min(0).max(50),
  recovery_penalty: z.boolean(),
})
export type LatePayStepInput = z.infer<typeof LatePayStepSchema>

// Step 9 — Warranty
export const WarrantyStepSchema = z.object({
  warranty_months: z.number().int().positive(),
})
export type WarrantyStepInput = z.infer<typeof WarrantyStepSchema>

// Step 10 — Insurance + Bond
export const InsuranceStepSchema = z.object({
  insurance_amount: z.number().positive(),
  bond: z.boolean(),
  bond_pct: z.number().min(0).max(100).optional(),
})
export type InsuranceStepInput = z.infer<typeof InsuranceStepSchema>

// Step 11 — Acceptance + Suspension
export const AcceptanceStepSchema = z.object({
  inspection_period_days: z.number().int().nonnegative(),
  suspension_request_adjustment_days: z.number().int().nonnegative(),
  suspension_terminate_days: z.number().int().nonnegative(),
  suspension_resume_claim_days: z.number().int().nonnegative(),
})
export type AcceptanceStepInput = z.infer<typeof AcceptanceStepSchema>

// Step 12 — Extra Clauses
export const ExtraClausesStepSchema = z.object({
  extra_clauses: z.string().optional(),
})
export type ExtraClausesStepInput = z.infer<typeof ExtraClausesStepSchema>

// Top-level wizard state used by WizardShell.
export interface WizardState {
  step: number
  contract_id?: string
  draft_saved_at?: string
  language: 'en' | 'fr'
  role: RoleStepInput
  basics: BasicsStepInput
  my_info: PartyInfoInput
  other_party: PartyInfoInput
  describe_work: DescribeWorkStepInput
  when: WhenStepInput
  payment: PaymentStepInput
  escalation: EscalationStepInput
  late_pay: LatePayStepInput
  warranty: WarrantyStepInput
  insurance: InsuranceStepInput
  acceptance: AcceptanceStepInput
  extra: ExtraClausesStepInput
}

export const GenerateContractSchema = z.object({
  contract_id: z.string().uuid(),
  language: z.enum(['en', 'fr']),
  contract_type: z.enum(['client-contractor', 'gc-subcontractor']),
})
export type GenerateContractInput = z.infer<typeof GenerateContractSchema>
