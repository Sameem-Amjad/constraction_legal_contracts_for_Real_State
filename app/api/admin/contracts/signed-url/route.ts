import 'server-only'

import { NextRequest, NextResponse } from 'next/server'

import { adminSupabase } from '@/lib/supabase/admin'
import { requireAdmin } from '../../_guard'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const { response } = await requireAdmin()
  if (response) return response

  const contractId = request.nextUrl.searchParams.get('contract_id')
  if (!contractId) {
    return NextResponse.json(
      { error: 'contract_id required' },
      { status: 400 }
    )
  }

  const { data: contract } = await adminSupabase
    .from('contracts')
    .select('pdf_path')
    .eq('id', contractId)
    .single()

  if (!contract?.pdf_path) {
    return NextResponse.json(
      { error: 'PDF not available' },
      { status: 404 }
    )
  }

  const { data: signed } = await adminSupabase.storage
    .from('construction-contracts')
    .createSignedUrl(contract.pdf_path, 300)

  return NextResponse.json({ signed_url: signed?.signedUrl ?? null })
}
