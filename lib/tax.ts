export const GST_RATE = 0.05
export const QST_RATE = 0.09975

export interface TaxBreakdown {
  subtotal: number
  gst: number
  qst: number
  total: number
}

export function calculateTaxes(subtotal: number): TaxBreakdown {
  const gst = Math.round(subtotal * GST_RATE * 100) / 100
  const qst = Math.round(subtotal * QST_RATE * 100) / 100
  return {
    subtotal,
    gst,
    qst,
    total: Math.round((subtotal + gst + qst) * 100) / 100,
  }
}

export function formatCurrencyCAD(
  amount: number,
  locale: 'en' | 'fr' = 'en'
): string {
  return new Intl.NumberFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
