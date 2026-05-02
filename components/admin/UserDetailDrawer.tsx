'use client'

import { useEffect, useState } from 'react'
import { Loader2, Download, FileText } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ContractStatusBadge } from '@/components/shared/ContractStatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'

interface DrillDownContract {
  id: string
  contract_type: string
  status: string
  contract_price: number | null
  pdf_path: string | null
  client_name: string | null
  contractor_name: string | null
  created_at: string
}

interface DrillDownActivity {
  id: string
  action: string
  details: string | null
  created_at: string
}

interface DrillDownData {
  profile: {
    id: string
    email: string
    first_name: string | null
    last_name: string | null
    phone: string | null
    role: string
    entity_type: string | null
    company_name: string | null
    created_at: string
  }
  subscription: {
    status: string
    plan_type: string
    cancel_at_period_end: boolean
    current_period_end: string | null
  } | null
  contracts: DrillDownContract[]
  activity: DrillDownActivity[]
}

interface UserDetailDrawerProps {
  userId: string | null
  onClose: () => void
}

export function UserDetailDrawer({ userId, onClose }: UserDetailDrawerProps) {
  const [data, setData] = useState<DrillDownData | null>(null)
  const [loading, setLoading] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setData(null)
      return
    }
    let cancelled = false
    setLoading(true)
    fetch(`/api/admin/users/${userId}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setData(d)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [userId])

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

  return (
    <Dialog
      open={Boolean(userId)}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {data?.profile.first_name} {data?.profile.last_name}
          </DialogTitle>
          <DialogDescription>
            {data?.profile.email}
            {data?.profile.entity_type
              ? ` · ${data.profile.entity_type}`
              : ''}
            {data?.profile.company_name ? ` · ${data.profile.company_name}` : ''}
          </DialogDescription>
        </DialogHeader>

        {loading || !data ? (
          <div className="py-12 text-center">
            <Loader2 className="inline h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Subscription
              </h3>
              {data.subscription ? (
                <div className="flex items-center gap-3 text-sm">
                  <Badge
                    variant={
                      data.subscription.status === 'active'
                        ? 'pro'
                        : 'secondary'
                    }
                  >
                    {data.subscription.plan_type === 'unlimited_monthly'
                      ? 'Pro'
                      : 'Free'}
                  </Badge>
                  <span className="text-muted-foreground">
                    Status: {data.subscription.status}
                    {data.subscription.current_period_end
                      ? ` · until ${formatDate(data.subscription.current_period_end)}`
                      : ''}
                    {data.subscription.cancel_at_period_end ? ' · cancelling' : ''}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No subscription record.</p>
              )}
            </section>

            <Separator />

            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Contracts ({data.contracts.length})
              </h3>
              {data.contracts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No contracts yet.</p>
              ) : (
                <ul className="divide-y rounded-md border">
                  {data.contracts.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center gap-3 p-3 text-sm"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {c.contract_type === 'client-contractor'
                            ? 'Client / Contractor'
                            : 'GC / Subcontractor'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {c.client_name ?? c.contractor_name ?? '—'} ·{' '}
                          {formatDate(c.created_at)}
                        </p>
                      </div>
                      <span className="text-sm font-medium">
                        {c.contract_price
                          ? formatCurrency(Number(c.contract_price))
                          : '—'}
                      </span>
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
                      {c.pdf_path ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadPdf(c.id)}
                          disabled={downloadingId === c.id}
                        >
                          {downloadingId === c.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <Separator />

            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Recent activity
              </h3>
              {data.activity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity recorded.</p>
              ) : (
                <ul className="space-y-1.5 text-xs">
                  {data.activity.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center gap-2 text-muted-foreground"
                    >
                      <span className="font-mono text-[10px] uppercase tracking-wider">
                        {a.action}
                      </span>
                      <span className="truncate">{a.details ?? ''}</span>
                      <span className="ml-auto shrink-0">
                        {formatDate(a.created_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
