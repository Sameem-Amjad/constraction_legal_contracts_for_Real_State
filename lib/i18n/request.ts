// Re-export the next-intl request config so consumers can import from a stable
// path. The actual config lives in /i18n.ts at the repo root because the
// next-intl plugin expects it there.
export { default, locales, defaultLocale } from '@/i18n'
export type { Locale } from '@/i18n'
