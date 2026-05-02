import Link from 'next/link'
import { LogOut } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { AdminLoginForm } from '@/components/admin/AdminLoginForm'
import { AdminLogoutButton } from '@/components/admin/AdminLogoutButton'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40 p-6">
        <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-sm">
          <h1 className="text-2xl font-semibold mb-4">Admin Login</h1>
          <AdminLoginForm />
        </div>
      </div>
    )
  }

  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('role, first_name, last_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold">Access denied</h1>
          <p className="text-muted-foreground">
            This area is restricted to administrators.
          </p>
          <AdminLogoutButton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex w-60 flex-col border-r bg-muted/40 p-6">
        <h1 className="font-semibold text-lg mb-6">Admin Panel</h1>
        <nav className="flex flex-col gap-2 text-sm">
          <Link
            href="/admin/dashboard"
            className="rounded-md px-3 py-2 hover:bg-muted transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/users"
            className="rounded-md px-3 py-2 hover:bg-muted transition-colors"
          >
            Users
          </Link>
          <Link
            href="/admin/contracts"
            className="rounded-md px-3 py-2 hover:bg-muted transition-colors"
          >
            Contracts
          </Link>
        </nav>
        <div className="mt-auto pt-6 border-t text-sm">
          <p className="font-medium">
            {profile.first_name} {profile.last_name}
          </p>
          <AdminLogoutButton variant="link" />
        </div>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  )
}
