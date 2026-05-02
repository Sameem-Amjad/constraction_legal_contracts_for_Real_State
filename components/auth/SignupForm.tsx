'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Loader2, Building2, User as UserIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'

type EntityType = 'individual' | 'company'

export function SignupForm({ locale }: { locale: 'en' | 'fr' }) {
  const t = useTranslations('auth')
  const te = useTranslations('errors')
  const supabase = createClient()
  const router = useRouter()

  const [entityType, setEntityType] = useState<EntityType>('individual')
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    // Individual fields
    full_name: '',
    address: '',
    ind_city: '',
    ind_postal: '',
    // Company fields
    company_name: '',
    incorporation_regime: '' as '' | 'quebec_inc' | 'canada_inc',
    rbq: '',
    head_office: '',
    ho_city: '',
    ho_postal: '',
    rep_name: '',
    rep_title: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (form.password !== form.confirm_password) {
      setError(te('passwordMismatch'))
      return
    }
    if (form.password.length < 8) {
      setError(te('passwordTooShort'))
      return
    }

    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/${locale}/dashboard`,
        data: {
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Persist all entity details onto the profiles row created by the
      // handle_new_user trigger.
      const profileUpdate =
        entityType === 'individual'
          ? {
              entity_type: 'individual' as const,
              full_name:
                form.full_name ||
                `${form.first_name} ${form.last_name}`.trim(),
              address: form.address || null,
              ind_city: form.ind_city || null,
              ind_postal: form.ind_postal || null,
              phone: form.phone || null,
            }
          : {
              entity_type: 'company' as const,
              company_name: form.company_name || null,
              incorporation_regime: form.incorporation_regime || null,
              rbq: form.rbq || null,
              head_office: form.head_office || null,
              ho_city: form.ho_city || null,
              ho_postal: form.ho_postal || null,
              rep_name: form.rep_name || `${form.first_name} ${form.last_name}`.trim(),
              rep_title: form.rep_title || null,
              phone: form.phone || null,
            }

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', data.user.id)
      if (profileError) {
        // Non-fatal — user can edit profile after signup.
        console.warn('[signup] profile update failed:', profileError)
      }

      await supabase.from('activity_log').insert({
        user_id: data.user.id,
        action: 'signup',
        details: `Signed up as ${entityType}`,
      })

      // Fire welcome email (server-side via service-role)
      fetch(`/api/auth/welcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          first_name: form.first_name,
          language: locale,
        }),
      }).catch((err) =>
        console.error('[signup] welcome email failed:', err)
      )
    }

    router.push(`/${locale}/dashboard`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          {t('signupTitle')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('signupSubtitle')}
        </p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {/* Entity-type chooser — drives the rest of the form */}
      <fieldset className="space-y-3">
        <Label className="text-sm font-semibold">
          {t('signupAsLabel')}
        </Label>
        <RadioGroup
          value={entityType}
          onValueChange={(v) => setEntityType(v as EntityType)}
          className="grid sm:grid-cols-2 gap-3"
        >
          {(
            [
              {
                value: 'individual',
                icon: UserIcon,
                title: t('individual'),
                desc: t('signupAsIndividualDesc'),
              },
              {
                value: 'company',
                icon: Building2,
                title: t('company'),
                desc: t('signupAsCompanyDesc'),
              },
            ] as const
          ).map(({ value, icon: Icon, title, desc }) => {
            const checked = entityType === value
            return (
              <Label
                key={value}
                htmlFor={`signup-as-${value}`}
                className={`flex items-start gap-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                  checked
                    ? 'border-brand-cobalt bg-brand-cobalt/5 shadow-sm'
                    : 'border-muted hover:border-brand-cobalt/40'
                }`}
              >
                <RadioGroupItem
                  value={value}
                  id={`signup-as-${value}`}
                  className="mt-0.5"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 font-medium">
                    <Icon className="h-4 w-4 text-brand-cobalt" />
                    {title}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                </div>
              </Label>
            )
          })}
        </RadioGroup>
      </fieldset>

      {/* Common: name + email + phone + password */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t('signupContactSection')}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            id="first_name"
            label={t('firstNameLabel')}
            required
            value={form.first_name}
            onChange={(v) => set('first_name', v)}
          />
          <Field
            id="last_name"
            label={t('lastNameLabel')}
            required
            value={form.last_name}
            onChange={(v) => set('last_name', v)}
          />
        </div>
        <Field
          id="email"
          label={t('emailLabel')}
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={(v) => set('email', v)}
        />
        <Field
          id="phone"
          label={t('phoneLabel')}
          type="tel"
          value={form.phone}
          onChange={(v) => set('phone', v)}
        />
      </section>

      {/* Conditional section: Individual */}
      {entityType === 'individual' ? (
        <section className="space-y-4 rounded-lg border-2 border-brand-cobalt/20 bg-brand-cobalt/[0.03] p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-cobalt">
            {t('signupIndividualSection')}
          </h2>
          <Field
            id="full_name"
            label={t('fullName')}
            value={form.full_name}
            onChange={(v) => set('full_name', v)}
            placeholder={`${form.first_name} ${form.last_name}`.trim()}
          />
          <Field
            id="address"
            label={t('address')}
            value={form.address}
            onChange={(v) => set('address', v)}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              id="ind_city"
              label={t('city')}
              value={form.ind_city}
              onChange={(v) => set('ind_city', v)}
            />
            <Field
              id="ind_postal"
              label={t('postalCode')}
              value={form.ind_postal}
              onChange={(v) => set('ind_postal', v)}
            />
          </div>
        </section>
      ) : null}

      {/* Conditional section: Company */}
      {entityType === 'company' ? (
        <section className="space-y-4 rounded-lg border-2 border-brand-cobalt/20 bg-brand-cobalt/[0.03] p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-cobalt">
            {t('signupCompanySection')}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              id="company_name"
              label={t('companyName')}
              required
              value={form.company_name}
              onChange={(v) => set('company_name', v)}
            />
            <div className="space-y-2">
              <Label>{t('incorporationRegime')}</Label>
              <Select
                value={form.incorporation_regime}
                onValueChange={(v) =>
                  set(
                    'incorporation_regime',
                    v as 'quebec_inc' | 'canada_inc'
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quebec_inc">{t('quebecInc')}</SelectItem>
                  <SelectItem value="canada_inc">{t('canadaInc')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Field
              id="rbq"
              label={t('rbq')}
              value={form.rbq}
              onChange={(v) => set('rbq', v)}
            />
            <Field
              id="rep_name"
              label={t('repName')}
              value={form.rep_name}
              onChange={(v) => set('rep_name', v)}
              placeholder={`${form.first_name} ${form.last_name}`.trim()}
            />
            <Field
              id="rep_title"
              label={t('repTitle')}
              value={form.rep_title}
              onChange={(v) => set('rep_title', v)}
              placeholder={t('repTitlePlaceholder')}
            />
          </div>
          <Field
            id="head_office"
            label={t('headOffice')}
            value={form.head_office}
            onChange={(v) => set('head_office', v)}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              id="ho_city"
              label={t('city')}
              value={form.ho_city}
              onChange={(v) => set('ho_city', v)}
            />
            <Field
              id="ho_postal"
              label={t('postalCode')}
              value={form.ho_postal}
              onChange={(v) => set('ho_postal', v)}
            />
          </div>
        </section>
      ) : null}

      {/* Password */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t('signupPasswordSection')}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            id="password"
            label={t('passwordLabel')}
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={form.password}
            onChange={(v) => set('password', v)}
          />
          <Field
            id="confirm_password"
            label={t('confirmPasswordLabel')}
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={form.confirm_password}
            onChange={(v) => set('confirm_password', v)}
          />
        </div>
      </section>

      <Button
        type="submit"
        className="w-full bg-brand-cobalt hover:bg-brand-cobalt/90 shadow-glow"
        disabled={loading}
        size="lg"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('signUpCta')}
      </Button>

      <p className="text-sm text-center text-muted-foreground">
        {t('haveAccount')}{' '}
        <Link
          href={`/${locale}/login`}
          className="text-brand-cobalt font-medium underline underline-offset-4"
        >
          {t('loginCta')}
        </Link>
      </p>
    </form>
  )
}

interface FieldProps {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
  minLength?: number
  autoComplete?: string
  placeholder?: string
  className?: string
}

function Field({
  id,
  label,
  value,
  onChange,
  type = 'text',
  required,
  minLength,
  autoComplete,
  placeholder,
  className,
}: FieldProps) {
  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-destructive ml-0.5">*</span> : null}
      </Label>
      <Input
        id={id}
        type={type}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
