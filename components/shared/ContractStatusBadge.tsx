import { Badge } from '@/components/ui/badge'

const variantMap = {
  draft: 'secondary',
  generated: 'info',
  paid: 'success',
  signed: 'default',
  completed: 'success',
} as const

const labels = {
  en: {
    draft: 'Draft',
    generated: 'Generated',
    paid: 'Paid',
    signed: 'Signed',
    completed: 'Completed',
  },
  fr: {
    draft: 'Brouillon',
    generated: 'Généré',
    paid: 'Payé',
    signed: 'Signé',
    completed: 'Terminé',
  },
}

type Status = keyof typeof variantMap

export function ContractStatusBadge({
  status,
  locale,
}: {
  status: Status
  locale: 'en' | 'fr'
}) {
  return <Badge variant={variantMap[status]}>{labels[locale][status]}</Badge>
}
