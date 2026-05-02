'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { LogoUpload } from '@/components/shared/LogoUpload'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/supabase'

interface ProfileFormProps {
  profile: Profile
  locale: 'en' | 'fr'
}

export function ProfileForm({ profile, locale: _locale }: ProfileFormProps) {
  const t = useTranslations('auth')
  const tp = useTranslations('profile')
  const tc = useTranslations('common')
  const supabase = createClient()
  const [data, setData] = useState<Profile>(profile)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function set<K extends keyof Profile>(k: K, v: Profile[K]) {
    setData((prev) => ({ ...prev, [k]: v }))
  }

  const isCompany = data.entity_type === 'company'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSaved(false)

    const update = {
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      entity_type: data.entity_type,
      company_name: data.company_name,
      incorporation_regime: data.incorporation_regime,
      rbq: data.rbq,
      head_office: data.head_office,
      ho_city: data.ho_city,
      ho_postal: data.ho_postal,
      rep_name: data.rep_name,
      rep_title: data.rep_title,
      full_name: data.full_name,
      address: data.address,
      ind_city: data.ind_city,
      ind_postal: data.ind_postal,
      logo_url: data.logo_url,
    }

    const { error } = await supabase
      .from('profiles')
      .update(update)
      .eq('id', profile.id)

    if (error) {
      setError(error.message)
    } else {
      setSaved(true)
      await supabase.from('activity_log').insert({
        user_id: profile.id,
        action: 'profile_updated',
      })
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h1 className="text-3xl font-semibold">{tp('title')}</h1>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {saved ? (
        <Alert>
          <AlertDescription>{tp('saveSuccess')}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{tp('personalInfo')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{t('firstNameLabel')}</Label>
            <Input
              value={data.first_name ?? ''}
              onChange={(e) => set('first_name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('lastNameLabel')}</Label>
            <Input
              value={data.last_name ?? ''}
              onChange={(e) => set('last_name', e.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>{t('emailLabel')}</Label>
            <Input value={data.email} readOnly disabled />
            <p className="text-xs text-muted-foreground">
              {tp('emailReadonly')}
            </p>
          </div>
          <div className="space-y-2">
            <Label>{t('phoneLabel')}</Label>
            <Input
              value={data.phone ?? ''}
              onChange={(e) => set('phone', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{tp('entityInfo')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={data.entity_type ?? 'company'}
            onValueChange={(v) =>
              set('entity_type', v as 'company' | 'individual')
            }
            className="flex gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="company" id="p-company" />
              <Label htmlFor="p-company" className="cursor-pointer">
                {t('company')}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="individual" id="p-individual" />
              <Label htmlFor="p-individual" className="cursor-pointer">
                {t('individual')}
              </Label>
            </div>
          </RadioGroup>

          {isCompany ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('companyName')}</Label>
                <Input
                  value={data.company_name ?? ''}
                  onChange={(e) => set('company_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('incorporationRegime')}</Label>
                <Select
                  value={data.incorporation_regime ?? ''}
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
              <div className="space-y-2">
                <Label>{t('rbq')}</Label>
                <Input
                  value={data.rbq ?? ''}
                  onChange={(e) => set('rbq', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('repName')}</Label>
                <Input
                  value={data.rep_name ?? ''}
                  onChange={(e) => set('rep_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('repTitle')}</Label>
                <Input
                  value={data.rep_title ?? ''}
                  onChange={(e) => set('rep_title', e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>{t('headOffice')}</Label>
                <Input
                  value={data.head_office ?? ''}
                  onChange={(e) => set('head_office', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('city')}</Label>
                <Input
                  value={data.ho_city ?? ''}
                  onChange={(e) => set('ho_city', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('postalCode')}</Label>
                <Input
                  value={data.ho_postal ?? ''}
                  onChange={(e) => set('ho_postal', e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>{t('fullName')}</Label>
                <Input
                  value={data.full_name ?? ''}
                  onChange={(e) => set('full_name', e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>{t('address')}</Label>
                <Input
                  value={data.address ?? ''}
                  onChange={(e) => set('address', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('city')}</Label>
                <Input
                  value={data.ind_city ?? ''}
                  onChange={(e) => set('ind_city', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('postalCode')}</Label>
                <Input
                  value={data.ind_postal ?? ''}
                  onChange={(e) => set('ind_postal', e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{tp('logo')}</CardTitle>
        </CardHeader>
        <CardContent>
          <LogoUpload
            userId={profile.id}
            currentUrl={data.logo_url}
            onUpload={(url) => set('logo_url', url)}
            onRemove={() => set('logo_url', null)}
            label={t('logoUpload')}
            hint={t('logoUploadHint')}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            tc('save')
          )}
        </Button>
      </div>
    </form>
  )
}
