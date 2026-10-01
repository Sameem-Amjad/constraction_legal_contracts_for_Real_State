import 'server-only'

import { NextRequest, NextResponse } from 'next/server'

import { adminSupabase } from '@/lib/supabase/admin'
import { requireAdmin } from '../../_guard'

export const runtime = 'nodejs'

// DELETE /api/admin/contracts/:id  → admin can delete any contract in any state.
// Removes the storage PDF (if present) and then deletes the row.
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { user: adminUser, response } = await requireAdmin()
  if (response) return response

  const { id } = await context.params

  const { data: contract } = await adminSupabase
    .from('contracts')
    .select('id, pdf_path')
    .eq('id', id)
    .maybeSingle()

  if (!contract) {
    return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
  }

  if (contract.pdf_path) {
    await adminSupabase.storage.from('construction-contracts').remove([contract.pdf_path])
  }

  const { error: delError } = await adminSupabase
    .from('contracts')
    .delete()
    .eq('id', id)

  if (delError) {
    console.error('[admin/contracts delete] error:', delError)
    return NextResponse.json(
      { error: 'Failed to delete contract' },
      { status: 500 }
    )
  }

  await adminSupabase.from('activity_log').insert({
    user_id: adminUser!.id,
    action: 'admin_contract_deleted',
    details: `Admin deleted contract ${id}`,
  })

  return NextResponse.json({ success: true })
}
