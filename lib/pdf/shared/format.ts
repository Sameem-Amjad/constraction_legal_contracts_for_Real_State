export function formatCurrencyForPdf(
  amount: number,
  language: 'en' | 'fr'
): string {
  return new Intl.NumberFormat(language === 'fr' ? 'fr-CA' : 'en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDateForPdf(
  iso: string | undefined | null,
  language: 'en' | 'fr'
): string {
  if (!iso) return '_______________'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function joinAddress(parts: Array<string | null | undefined>): string {
  return parts.filter(Boolean).join(', ')
}

const PAYMENT_METHOD_LABELS = {
  en: {
    lump_sum: 'Lump-sum payment at the end',
    single_payment_completion: 'Single payment upon completion',
    progress_payments: 'Progress payments',
    milestone_payments: 'Milestone payments',
    time_and_materials: 'Time and materials (hourly + materials)',
  },
  fr: {
    lump_sum: 'Paiement forfaitaire à la fin',
    single_payment_completion: "Paiement unique à l'achèvement",
    progress_payments: 'Paiements échelonnés',
    milestone_payments: 'Paiements par étape',
    time_and_materials: 'Temps et matériaux (horaire + matériaux)',
  },
} as const

export function paymentMethodLabel(
  method: string | undefined,
  language: 'en' | 'fr'
): string {
  if (!method) return language === 'fr' ? 'mode convenu' : 'agreed method'
  const labels = PAYMENT_METHOD_LABELS[language]
  if (method in labels) return labels[method as keyof typeof labels]
  // Free-text fallback (legacy data) — surface as-is.
  return method
}

const INVOICE_FREQUENCY_LABELS = {
  en: {
    weekly: 'weekly',
    bi_weekly: 'bi-weekly',
    monthly: 'monthly',
  },
  fr: {
    weekly: 'hebdomadaires',
    bi_weekly: 'bimensuelles',
    monthly: 'mensuelles',
  },
} as const

export function invoiceFrequencyLabel(
  frequency: string | undefined,
  language: 'en' | 'fr'
): string {
  if (!frequency) return ''
  const labels = INVOICE_FREQUENCY_LABELS[language]
  return labels[frequency as keyof typeof labels] ?? frequency
}
