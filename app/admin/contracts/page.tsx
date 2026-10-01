import { AdminContractsTable } from '@/components/admin/AdminContractsTable'
import { createClient } from '@/lib/supabase/server'
import { isNoDeleteUser } from '@/lib/no-delete'

export const dynamic = 'force-dynamic'

export default async function AdminContractsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Contracts</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Search, filter, download PDFs, and delete contracts in any state.
        </p>
      </div>
      <AdminContractsTable canDelete={!isNoDeleteUser(user)} />
    </div>
  )
}
