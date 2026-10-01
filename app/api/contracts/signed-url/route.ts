import 'server-only'

import { NextRequest, NextResponse } from 'next/server'

import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const contractId = request.nextUrl.searchParams.get('contract_id')
  if (!contractId) {
    return NextResponse.json(
      { error: 'contract_id required' },
      { status: 400 }
    )
  }

  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: contract } = await adminSupabase
    .from('contracts')
    .select('pdf_path, user_id, status')
    .eq('id', contractId)
    .single()

  if (!contract) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (contract.user_id !== user.id) {
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  if (!contract.pdf_path) {
    return NextResponse.json(
      { error: 'PDF not yet generated' },
      { status: 404 }
    )
  }

  if (contract.status === 'draft' || contract.status === 'generated') {
    return NextResponse.json(
      { error: 'Contract not yet paid' },
      { status: 402 }
    )
  }

  const { data: signedUrl, error } = await adminSupabase.storage
    .from('construction-contracts')
    .createSignedUrl(contract.pdf_path, 300)

  if (error || !signedUrl) {
    return NextResponse.json(
      { error: 'Failed to generate download link' },
      { status: 500 }
    )
  }

  await adminSupabase.from('activity_log').insert({
    user_id: user.id,
    action: 'contract_downloaded',
    details: `Downloaded contract ${contractId}`,
  })

  return NextResponse.json({ signed_url: signedUrl.signedUrl })
}
