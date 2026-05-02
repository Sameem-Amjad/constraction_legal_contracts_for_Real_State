import { AdminUsersTable } from '@/components/admin/AdminUsersTable'

export const dynamic = 'force-dynamic'

export default function AdminUsersPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Search, filter, drill into a user&apos;s contracts, and erase
          accounts under GDPR / Quebec Law 25.
        </p>
      </div>
      <AdminUsersTable />
    </div>
  )
}
