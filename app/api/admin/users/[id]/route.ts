import 'server-only'

import { NextRequest, NextResponse } from 'next/server'

import { adminSupabase } from '@/lib/supabase/admin'
import { isNoDeleteUser, NO_DELETE_MESSAGE } from '@/lib/no-delete'
import { requireAdmin } from '../../_guard'

export const runtime = 'nodejs'

// =============================================================================
// GET /api/admin/users/:id  → user detail + their contracts + recent activity
// =============================================================================
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin()
  if (response) return response

  const { id } = await context.params

  const [profileRes, subRes, contractsRes, activityRes] = await Promise.all([
    adminSupabase.from('profiles').select('*').eq('id', id).maybeSingle(),
    adminSupabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', id)
      .maybeSingle(),
    adminSupabase
      .from('contracts')
      .select(
        'id, contract_type, status, contract_price, pdf_path, client_name, contractor_name, metadata, created_at'
      )
      .eq('user_id', id)
      .order('created_at', { ascending: false }),
    adminSupabase
      .from('activity_log')
      .select('id, action, details, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  if (!profileRes.data) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({
    profile: profileRes.data,
    subscription: subRes.data ?? null,
    contracts: contractsRes.data ?? [],
    activity: activityRes.data ?? [],
  })
}

// =============================================================================
// DELETE /api/admin/users/:id  → GDPR-compliant hard erasure
//   1. Delete every PDF in storage under <user_id>/
//   2. Delete every logo in the logos bucket under <user_id>/
//   3. Delete subscriptions, activity_log, contracts (cascade via FKs)
//   4. Delete profile row + auth.users row
//   5. Insert a single record into deleted_users with the email + count
// =============================================================================
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { user: adminUser, response } = await requireAdmin()
  if (response) return response
  if (isNoDeleteUser(adminUser)) {
    return NextResponse.json({ error: NO_DELETE_MESSAGE }, { status: 403 })
  }

  const { id: targetUserId } = await context.params

  // Don't allow an admin to delete themselves through this endpoint —
  // would lock the project out.
  if (adminUser?.id === targetUserId) {
    return NextResponse.json(
      { error: 'You cannot delete your own admin account from this UI.' },
      { status: 400 }
    )
  }

  // 1. Read profile (need email + count contracts before the cascade)
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('id, email, role')
    .eq('id', targetUserId)
    .maybeSingle()

  if (!profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (profile.role === 'admin') {
    return NextResponse.json(
      { error: 'Refuse to hard-delete another admin. Demote first.' },
      { status: 400 }
    )
  }

  const { count: contractCount } = await adminSupabase
    .from('contracts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', targetUserId)

  // 2. Wipe storage objects under <user_id>/ in `construction-contracts` and
  // `construction-logos` buckets
  for (const bucket of ['construction-contracts', 'construction-logos'] as const) {
    const { data: files } = await adminSupabase.storage
      .from(bucket)
      .list(targetUserId, { limit: 1000 })

    if (files && files.length > 0) {
      const paths = files.map((f) => `${targetUserId}/${f.name}`)
      await adminSupabase.storage.from(bucket).remove(paths)
    }
  }

  // 3. Delete activity_log + subscriptions explicitly (FK constraints handle
  // cascades, but being explicit is defensive in case FK was misconfigured).
  await adminSupabase
    .from('activity_log')
    .delete()
    .eq('user_id', targetUserId)
  await adminSupabase
    .from('subscriptions')
    .delete()
    .eq('user_id', targetUserId)

  // Contracts: keep guest contracts that lost their owner (set user_id null
  // is what the FK already does on delete), but for full erasure we want
  // to drop them entirely since they may contain the user's PII.
  await adminSupabase.from('contracts').delete().eq('user_id', targetUserId)

  // 4. Delete profile then the auth user
  await adminSupabase.from('profiles').delete().eq('id', targetUserId)

  const { error: authDeleteError } =
    await adminSupabase.auth.admin.deleteUser(targetUserId)
  if (authDeleteError) {
    console.error('[admin/users delete] auth.admin.deleteUser failed:', authDeleteError)
    return NextResponse.json(
      { error: `Auth deletion failed: ${authDeleteError.message}` },
      { status: 500 }
    )
  }

  // 5. Record erasure (single row, email-only)
  const { data: adminProfile } = await adminSupabase
    .from('profiles')
    .select('email')
    .eq('id', adminUser!.id)
    .maybeSingle()

  await adminSupabase
    .from('deleted_users')
    .upsert(
      {
        email: profile.email,
        deleted_at: new Date().toISOString(),
        reason: 'Admin-initiated GDPR / Law 25 erasure',
        deleted_contract_count: contractCount ?? 0,
        deleted_by: `admin:${adminProfile?.email ?? adminUser!.id}`,
      },
      { onConflict: 'email' }
    )

  return NextResponse.json({
    success: true,
    erased_email: profile.email,
    deleted_contracts: contractCount ?? 0,
  })
}
