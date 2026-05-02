import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  amount: number,
  locale: 'en' | 'fr' = 'en',
  currency: string = 'CAD'
): string {
  return new Intl.NumberFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(
  date: string | Date,
  locale: 'en' | 'fr' = 'en'
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(locale === 'fr' ? 'fr-CA' : 'en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getInitials(firstName?: string | null, lastName?: string | null): string {
  const f = firstName?.trim()?.[0] ?? ''
  const l = lastName?.trim()?.[0] ?? ''
  return (f + l).toUpperCase() || '?'
}
