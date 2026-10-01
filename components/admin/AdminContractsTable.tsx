'use client'

import { useEffect, useState, useTransition } from 'react'
import { Loader2, Search, Trash2, Download } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ContractStatusBadge } from '@/components/shared/ContractStatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { NO_DELETE_MESSAGE } from '@/lib/no-delete'

interface AdminContract {
  id: string
  user_id: string | null
  contract_type: string
  status: string
  contract_price: number | null
  pdf_path: string | null
  client_name: string | null
  contractor_name: string | null
  created_at: string
  metadata: { language?: string } | null
}

const PAGE_SIZE = 20

export function AdminContractsTable({
  canDelete = true,
}: {
  canDelete?: boolean
}) {
  const [contracts, setContracts] = useState<AdminContract[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [langFilter, setLangFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminContract | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [isDeleting, startDeleteTransition] = useTransition()

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({
          page: String(page),
          page_size: String(PAGE_SIZE),
        })
        if (search.trim()) params.set('search', search.trim())
        if (statusFilter !== 'all') params.set('status', statusFilter)
        if (typeFilter !== 'all') params.set('type', typeFilter)
        if (langFilter !== 'all') params.set('language', langFilter)
        const res = await fetch(`/api/admin/contracts?${params}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Failed to load')
        if (cancelled) return
        setContracts(data.contracts ?? [])
        setTotal(data.total ?? 0)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [page, search, statusFilter, typeFilter, langFilter])

  async function downloadPdf(contractId: string) {
    setDownloadingId(contractId)
    try {
      const res = await fetch(
        `/api/admin/contracts/signed-url?contract_id=${contractId}`
      )
      const json = await res.json()
      if (json.signed_url) {
        window.open(json.signed_url, '_blank', 'noopener,noreferrer')
      }
    } finally {
      setDownloadingId(null)
    }
  }

  function handleDelete(contract: AdminContract) {
    startDeleteTransition(async () => {
      try {
        const res = await fetch(`/api/admin/contracts/${contract.id}`, {
          method: 'DELETE',
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Delete failed')
        setDeleteTarget(null)
        setContracts((prev) => prev.filter((c) => c.id !== contract.id))
        setTotal((prev) => Math.max(0, prev - 1))
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Delete failed')
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-3">
        <form
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault()
            setPage(1)
            setSearch(searchInput)
          }}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email…"
            className="pl-9"
          />
        </form>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setPage(1)
            setStatusFilter(v)
          }}
        >
          <SelectTrigger className="w-full lg:w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="generated">Generated</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="signed">Signed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={typeFilter}
          onValueChange={(v) => {
            setPage(1)
            setTypeFilter(v)
          }}
        >
          <SelectTrigger className="w-full lg:w-44">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="client-contractor">Client / Contractor</SelectItem>
            <SelectItem value="gc-subcontractor">GC / Subcontractor</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={langFilter}
          onValueChange={(v) => {
            setPage(1)
            setLangFilter(v)
          }}
        >
          <SelectTrigger className="w-full lg:w-32">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="en">EN</SelectItem>
            <SelectItem value="fr">FR</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground bg-muted/40">
                <tr>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Contractor</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Lang</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center">
                      <Loader2 className="inline h-5 w-5 animate-spin text-muted-foreground" />
                    </td>
                  </tr>
                ) : contracts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-12 text-center text-muted-foreground"
                    >
                      No contracts found.
                    </td>
                  </tr>
                ) : (
                  contracts.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">
                        {c.contract_type === 'client-contractor' ? 'CC' : 'GC'}
                      </td>
                      <td className="px-4 py-3 truncate max-w-[180px]">
                        {c.client_name ?? '—'}
                      </td>
                      <td className="px-4 py-3 truncate max-w-[180px]">
                        {c.contractor_name ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <ContractStatusBadge
                          status={
                            c.status as
                              | 'draft'
                              | 'generated'
                              | 'paid'
                              | 'signed'
                              | 'completed'
                          }
                          locale="en"
                        />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {c.contract_price
                          ? formatCurrency(Number(c.contract_price))
                          : '—'}
                      </td>
                      <td className="px-4 py-3 uppercase text-xs">
                        {c.metadata?.language ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={c.user_id ? 'success' : 'secondary'}>
                          {c.user_id ? 'Registered' : 'Guest'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {formatDate(c.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          {c.pdf_path ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => downloadPdf(c.id)}
                              disabled={downloadingId === c.id}
                              title="Download PDF"
                            >
                              {downloadingId === c.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </Button>
                          ) : null}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteTarget(c)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            disabled={!canDelete}
                            title={canDelete ? 'Delete contract' : NO_DELETE_MESSAGE}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={setPage}
      />

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this contract?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the contract record and its PDF
              from storage. The user&apos;s receipt email is retained
              independently. Cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault()
                if (deleteTarget) handleDelete(deleteTarget)
              }}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                'Delete contract'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
