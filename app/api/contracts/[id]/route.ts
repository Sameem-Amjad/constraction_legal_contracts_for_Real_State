import 'server-only'

import { NextRequest, NextResponse } from 'next/server'

import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// DELETE /api/contracts/:id
// Users can delete their OWN contracts only when status='draft'.
// Anything paid/generated/signed/completed is retained for legal/tax reasons
// and can only be removed by an admin via /api/admin/contracts/:id.
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: contract } = await adminSupabase
    .from('contracts')
    .select('id, user_id, status, pdf_path')
    .eq('id', id)
    .maybeSingle()

  if (!contract) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (contract.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (contract.status !== 'draft') {
    return NextResponse.json(
      {
        error:
          'Only draft contracts can be deleted. Paid contracts are retained for legal and tax records — contact support to request erasure.',
      },
      { status: 409 }
    )
  }

  if (contract.pdf_path) {
    await adminSupabase.storage.from('construction-contracts').remove([contract.pdf_path])
  }

  await adminSupabase.from('contracts').delete().eq('id', id)

  await adminSupabase.from('activity_log').insert({
    user_id: user.id,
    action: 'contract_draft_deleted',
    details: `User deleted draft contract ${id}`,
  })

  return NextResponse.json({ success: true })
}
