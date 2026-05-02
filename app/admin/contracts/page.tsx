import { AdminContractsTable } from '@/components/admin/AdminContractsTable'

export const dynamic = 'force-dynamic'

export default function AdminContractsPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Contracts</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Search, filter, download PDFs, and delete contracts in any state.
        </p>
      </div>
      <AdminContractsTable />
    </div>
  )
}
