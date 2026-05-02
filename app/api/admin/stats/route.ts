import 'server-only'

import { NextResponse } from 'next/server'

import { adminSupabase } from '@/lib/supabase/admin'
import { requireAdmin } from '../_guard'

export const runtime = 'nodejs'

export async function GET() {
  const { response } = await requireAdmin()
  if (response) return response

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

  return NextResponse.json({
    revenue,
    users: usersCount ?? 0,
    contracts: contractsCount ?? 0,
    active_pro: activeProCount ?? 0,
    mrr,
  })
}
