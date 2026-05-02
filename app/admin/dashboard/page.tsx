import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { adminSupabase } from '@/lib/supabase/admin'
import { formatCurrency } from '@/lib/utils'

export default async function AdminDashboardPage() {
  const [
    { count: usersCount },
    { count: contractsCount },
    revenueResult,
    { count: activeProCount },
  ] = await Promise.all([
    adminSupabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user'),
    adminSupabase
      .from('contracts')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'draft'),
    adminSupabase
      .from('contracts')
      .select('contract_price')
      .eq('status', 'paid'),
    adminSupabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('plan_type', 'unlimited_monthly'),
  ])

  const revenue =
    revenueResult.data?.reduce(
      (sum, row) => sum + Number(row.contract_price ?? 0),
      0
    ) ?? 0
  const mrr = (activeProCount ?? 0) * 349

  const cards = [
    { label: 'Total Revenue', value: formatCurrency(revenue) },
    { label: 'Total Users', value: (usersCount ?? 0).toLocaleString() },
    {
      label: 'Total Contracts',
      value: (contractsCount ?? 0).toLocaleString(),
    },
    {
      label: 'Active Pro Subscribers',
      value: (activeProCount ?? 0).toLocaleString(),
    },
    { label: 'MRR', value: formatCurrency(mrr) },
  ]

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
