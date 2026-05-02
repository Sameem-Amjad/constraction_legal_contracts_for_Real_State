'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Loader2, AlertCircle } from 'lucide-react'

/**
 * Listens for `?download=<contract_id>` on the URL. When present, fetches a
 * signed PDF URL and opens it in a new tab, then strips the query param so a
 * page refresh won't re-trigger.
 */
export function AutoDownloadHandler() {
  const t = useTranslations('payment')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const handledRef = useRef<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  const downloadId = searchParams.get('download')

  useEffect(() => {
    if (!downloadId) return
    if (handledRef.current === downloadId) return
    handledRef.current = downloadId

    let cancelled = false

    async function run() {
      setStatus('loading')
      try {
        const res = await fetch(
          `/api/contracts/signed-url?contract_id=${downloadId}`
        )
        const data = await res.json()
        if (cancelled) return
        if (!res.ok || !data.signed_url) {
          throw new Error(data.error ?? 'Download failed')
        }
        window.open(data.signed_url, '_blank', 'noopener,noreferrer')
        setStatus('idle')
        // Strip ?download from URL so a refresh doesn't re-fire
        const params = new URLSearchParams(searchParams.toString())
        params.delete('download')
        const next = params.toString()
        router.replace(next ? `${pathname}?${next}` : pathname)
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [downloadId, pathname, router, searchParams])

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 border border-brand-cobalt/20 rounded-lg px-4 py-3">
        <Loader2 className="h-4 w-4 animate-spin text-brand-cobalt" />
        {t('downloadPreparing')}
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-4 py-3">
        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <span>{t('downloadFailed')}</span>
      </div>
    )
  }

  return null
}
