'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Download, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface Props {
  contractId: string
  /** Auto-trigger the download as soon as the component mounts. */
  autoStart?: boolean
}

export function DownloadContractButton({ contractId, autoStart = false }: Props) {
  const t = useTranslations('payment')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function start() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(
        `/api/contracts/signed-url?contract_id=${contractId}`
      )
      const data = await res.json()
      if (!res.ok || !data.signed_url) {
        throw new Error(data.error ?? 'Download failed')
      }
      window.open(data.signed_url, '_blank', 'noopener,noreferrer')
    } catch {
      setError(t('downloadFailed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (autoStart) {
      void start()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, contractId])

  return (
    <div className="flex flex-col items-center gap-2">
      <Button onClick={start} disabled={loading} variant="outline">
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        {loading ? t('downloadPreparing') : t('downloadCta')}
      </Button>
      {error ? (
        <p className="text-sm text-destructive max-w-md text-center">{error}</p>
      ) : null}
    </div>
  )
}
