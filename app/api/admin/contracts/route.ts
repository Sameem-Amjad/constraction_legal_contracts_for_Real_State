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
  const status = searchParams.get('status')
  const type = searchParams.get('type')
  const language = searchParams.get('language')

  let query = adminSupabase
    .from('contracts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(
      `client_name.ilike.%${search}%,contractor_name.ilike.%${search}%,client_email.ilike.%${search}%,contractor_email.ilike.%${search}%`
    )
  }
  if (status && status !== 'all') {
    query = query.eq(
      'status',
      status as 'draft' | 'generated' | 'paid' | 'signed' | 'completed'
    )
  }
  if (type && type !== 'all') {
    query = query.eq(
      'contract_type',
      type as 'client-contractor' | 'gc-subcontractor'
    )
  }
  if (language && language !== 'all') {
    // metadata is JSONB; filter via ->> operator using filter()
    query = query.filter('metadata->>language', 'eq', language)
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await query.range(from, to)

  if (error) {
    console.error('[admin/contracts] error:', error)
    return NextResponse.json(
      { error: 'Failed to load contracts' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    contracts: data ?? [],
    total: count ?? 0,
    page,
    page_size: pageSize,
  })
}
