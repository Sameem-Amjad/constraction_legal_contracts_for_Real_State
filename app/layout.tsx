import type { Metadata } from 'next'
import { Lato, Montserrat } from 'next/font/google'

import './globals.css'

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-sans',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800', '900'],
  variable: '--font-heading',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'ConstrAction',
    template: '%s — ConstrAction',
  },
  description:
    'Quebec-compliant construction contracts in English or French. Generate, sign, and download in minutes.',
  metadataBase: (() => {
    try {
      return process.env.NEXT_PUBLIC_SITE_URL
        ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
        : undefined
    } catch {
      return undefined
    }
  })(),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      className={`${lato.variable} ${montserrat.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
