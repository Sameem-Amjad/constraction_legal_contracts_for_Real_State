'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Loader2, Download, Pencil, CreditCard, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ContractRowActionsProps {
  locale: 'en' | 'fr'
  id: string
  status: string
}

export function ContractRowActions({
  locale,
  id,
  status,
}: ContractRowActionsProps) {
  const t = useTranslations('contracts')
  const router = useRouter()
  const [downloading, setDownloading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isDeleting, startDelete] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const isFr = locale === 'fr'

  async function downloadPdf() {
    setDownloading(true)
    try {
      const res = await fetch(`/api/contracts/signed-url?contract_id=${id}`)
      const data = await res.json()
      if (data.signed_url) {
        window.open(data.signed_url, '_blank', 'noopener,noreferrer')
      }
    } finally {
      setDownloading(false)
    }
  }

  function handleDelete() {
    startDelete(async () => {
      try {
        const res = await fetch(`/api/contracts/${id}`, { method: 'DELETE' })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Delete failed')
        setConfirmDelete(false)
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Delete failed')
      }
    })
  }

  const isDraft = status === 'draft'
  const isGenerated = status === 'generated'

  return (
    <div className="flex items-center gap-1">
      {isDraft ? (
        <Button asChild size="sm" variant="outline">
          <Link href={`/${locale}/contracts/${id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            {t('resume')}
          </Link>
        </Button>
      ) : isGenerated ? (
        <Button asChild size="sm">
          <Link href={`/${locale}/contracts/${id}/edit`}>
            <CreditCard className="mr-2 h-4 w-4" />
            {t('payNow')}
          </Link>
        </Button>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={downloadPdf}
          disabled={downloading}
        >
          {downloading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {t('download')}
        </Button>
      )}

      {isDraft ? (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setConfirmDelete(true)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          aria-label={isFr ? 'Supprimer le brouillon' : 'Delete draft'}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ) : null}

      <AlertDialog
        open={confirmDelete}
        onOpenChange={(open) => {
          setConfirmDelete(open)
          if (!open) setError(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isFr ? 'Supprimer ce brouillon ?' : 'Delete this draft?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isFr
                ? "Le brouillon et toutes les données saisies seront définitivement supprimés. Cette action est irréversible. Seuls les brouillons peuvent être supprimés ; les contrats payés sont conservés pour des raisons légales et fiscales."
                : 'The draft and all entered data will be permanently deleted. This action cannot be undone. Only drafts can be deleted — paid contracts are retained for legal and tax purposes.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {isFr ? 'Annuler' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isFr ? 'Suppression…' : 'Deleting…'}
                </>
              ) : isFr ? (
                'Supprimer'
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
