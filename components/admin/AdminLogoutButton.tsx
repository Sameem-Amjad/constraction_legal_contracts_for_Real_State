'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export function AdminLogoutButton({
  variant = 'ghost',
}: {
  variant?: 'ghost' | 'link' | 'outline'
}) {
  const supabase = createClient()
  const router = useRouter()

  async function logout() {
    await supabase.auth.signOut()
    router.push('/admin')
    router.refresh()
  }

  return (
    <Button
      onClick={logout}
      variant={variant}
      size="sm"
      className="px-0 text-muted-foreground"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Log Out
    </Button>
  )
}
