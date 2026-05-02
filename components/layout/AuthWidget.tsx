'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { LogOut, User as UserIcon, FileText, LayoutDashboard } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { getInitials } from '@/lib/utils'

export function AuthWidget() {
  const t = useTranslations('common')
  const locale = useLocale()
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<User | null>(null)
  const [firstName, setFirstName] = useState<string | null>(null)
  const [lastName, setLastName] = useState<string | null>(null)
  const [isPro, setIsPro] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let mounted = true

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!mounted) return
      setUser(user)
      if (user) {
        const [{ data: profile }, statusRes] = await Promise.all([
          supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', user.id)
            .single(),
          fetch('/api/subscriptions/status').then((r) => r.json()).catch(() => null),
        ])
        if (!mounted) return
        setFirstName(profile?.first_name ?? null)
        setLastName(profile?.last_name ?? null)
        setIsPro(Boolean(statusRes?.isPro))
      }
      setLoaded(true)
    }

    load()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        setFirstName(null)
        setLastName(null)
        setIsPro(false)
      }
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push(`/${locale}/login`)
    router.refresh()
  }

  if (!loaded) {
    return <div className="h-10 w-24" aria-hidden />
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${locale}/login`}>{t('login')}</Link>
        </Button>
        <Button asChild size="sm">
          <Link href={`/${locale}/signup`}>{t('signup')}</Link>
        </Button>
      </div>
    )
  }

  const initials = getInitials(firstName, lastName)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-muted transition-colors">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
            {initials}
          </span>
          <span className="text-sm font-medium hidden sm:inline">
            {firstName ?? user.email?.split('@')[0]}
          </span>
          {isPro ? <Badge variant="pro">{t('proSubscriber')}</Badge> : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="truncate">
              {firstName} {lastName}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {user.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/${locale}/dashboard`}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            {t('dashboard')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${locale}/profile`}>
            <UserIcon className="mr-2 h-4 w-4" />
            {t('profile')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${locale}/contracts`}>
            <FileText className="mr-2 h-4 w-4" />
            {t('contracts')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          {t('logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
