'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'

export function ResetPasswordForm({ locale }: { locale: 'en' | 'fr' }) {
  const t = useTranslations('auth')
  const supabase = createClient()
  const router = useRouter()

  const [mode, setMode] = useState<'request' | 'set'>('request')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash
    if (hash.includes('type=recovery')) {
      setMode('set')
      // Supabase JS picks up the hash automatically and creates a session.
    }
  }, [])

  async function requestReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/${locale}/reset-password`,
    })
    if (error) setError(error.message)
    else setSuccess(t('resetSent'))
    setLoading(false)
  }

  async function setNewPassword(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    await supabase.from('activity_log').insert({ action: 'password_reset' })
    setSuccess(t('passwordUpdated'))
    setTimeout(() => {
      router.push(`/${locale}/dashboard`)
      router.refresh()
    }, 1000)
  }

  if (mode === 'set') {
    return (
      <form onSubmit={setNewPassword} className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{t('resetTitle')}</h1>
        </div>
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {success ? (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="new_password">{t('newPasswordLabel')}</Label>
          <Input
            id="new_password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm_password">{t('confirmPasswordLabel')}</Label>
          <Input
            id="confirm_password"
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
        </Button>
      </form>
    )
  }

  return (
    <form onSubmit={requestReset} className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('resetTitle')}</h1>
        <p className="text-sm text-muted-foreground">{t('resetSubtitle')}</p>
      </div>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {success ? (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="email">{t('emailLabel')}</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('resetCta')}
      </Button>
    </form>
  )
}
