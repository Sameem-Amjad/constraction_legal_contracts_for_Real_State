import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

import { Button } from '@/components/ui/button'

export default async function NotFound() {
  const t = await getTranslations('errors')
  return (
    <div className="container py-20 text-center space-y-4">
      <h1 className="text-3xl font-semibold">404</h1>
      <p className="text-muted-foreground">{t('notFound')}</p>
      <Button asChild>
        <Link href="/">Home</Link>
      </Button>
    </div>
  )
}
