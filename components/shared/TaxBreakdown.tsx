'use client'

import { calculateTaxes, formatCurrencyCAD } from '@/lib/tax'

interface TaxBreakdownProps {
  subtotal: number
  locale: 'en' | 'fr'
  className?: string
}

export function TaxBreakdown({ subtotal, locale, className }: TaxBreakdownProps) {
  const taxes = calculateTaxes(subtotal)
  const labels = {
    en: {
      subtotal: 'Subtotal',
      gst: 'GST (TPS) 5%',
      qst: 'QST (TVQ) 9.975%',
      total: 'Total',
    },
    fr: {
      subtotal: 'Sous-total',
      gst: 'TPS (GST) 5 %',
      qst: 'TVQ (QST) 9,975 %',
      total: 'Total',
    },
  }[locale]

  return (
    <div className={`rounded-lg border p-4 space-y-2 text-sm ${className ?? ''}`}>
      <div className="flex justify-between">
        <span>{labels.subtotal}</span>
        <span>{formatCurrencyCAD(taxes.subtotal, locale)}</span>
      </div>
      <div className="flex justify-between text-muted-foreground">
        <span>{labels.gst}</span>
        <span>{formatCurrencyCAD(taxes.gst, locale)}</span>
      </div>
      <div className="flex justify-between text-muted-foreground">
        <span>{labels.qst}</span>
        <span>{formatCurrencyCAD(taxes.qst, locale)}</span>
      </div>
      <div className="flex justify-between font-semibold border-t pt-2">
        <span>{labels.total}</span>
        <span>{formatCurrencyCAD(taxes.total, locale)}</span>
      </div>
    </div>
  )
}
