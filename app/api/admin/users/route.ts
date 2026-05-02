import 'server-only'

import { NextRequest, NextResponse } from 'next/server'

import { adminSupabase } from '@/lib/supabase/admin'
import { requireAdmin } from '../_guard'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const { response } = await requireAdmin()
  if (response) return response

  const { searchParams } = request.nextUrl
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const pageSize = Math.min(
    100,
    Math.max(1, Number(searchParams.get('page_size') ?? '20'))
  )
  const search = searchParams.get('search')?.trim() ?? ''
  const filterStatus = searchParams.get('status')

  let query = adminSupabase
    .from('profiles')
    .select(
      `id, email, first_name, last_name, entity_type, role, created_at,
       subscriptions!inner ( status, plan_type, current_period_end )`,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(
      `email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,company_name.ilike.%${search}%`
    )
  }

  if (filterStatus && filterStatus !== 'all') {
    query = query.filter('subscriptions.status', 'eq', filterStatus)
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await query.range(from, to)

  if (error) {
    console.error('[admin/users] error:', error)
    return NextResponse.json(
      { error: 'Failed to load users' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    users: data ?? [],
    total: count ?? 0,
    page,
    page_size: pageSize,
  })
}
