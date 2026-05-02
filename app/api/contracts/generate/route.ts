import 'server-only'

import { NextRequest, NextResponse } from 'next/server'
import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { z } from 'zod'

import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { CCDocument } from '@/lib/pdf/cc'
import { GCDocument } from '@/lib/pdf/gc'
import { GenerateContractSchema } from '@/lib/validations/wizard'
import type { ContractMetadata } from '@/types/supabase'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contract_id, language, contract_type } =
      GenerateContractSchema.parse(body)

    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data: contract, error: contractError } = await adminSupabase
      .from('contracts')
      .select('*')
      .eq('id', contract_id)
      .single()

    if (contractError || !contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      )
    }

    if (contract.user_id !== null && contract.user_id !== user?.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let profile = null
    if (user) {
      const { data } = await adminSupabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      profile = data
    }

    const meta =
      (contract.metadata as ContractMetadata | null) ??
      ({} as ContractMetadata)
    const logoUrl = meta.logo_url ?? profile?.logo_url ?? undefined

    const DocumentComponent =
      contract_type === 'client-contractor' ? CCDocument : GCDocument

    const pdfElement = React.createElement(DocumentComponent, {
      contract,
      profile,
      language,
      logoUrl: logoUrl ?? undefined,
    })
    // @react-pdf/renderer expects a Document element. The component returns
    // <Document>...</Document>, so this is safe at runtime.
    const pdfBuffer = await renderToBuffer(
      pdfElement as unknown as Parameters<typeof renderToBuffer>[0]
    )

    const folder = user?.id ?? 'guests'
    const storagePath = `${folder}/${contract_id}.pdf`

    const { error: uploadError } = await adminSupabase.storage
      .from('contracts')
      .upload(storagePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) {
      console.error('[Generate] Storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to store PDF' },
        { status: 500 }
      )
    }

    let isPro = false
    if (user) {
      const { data: sub } = await adminSupabase
        .from('subscriptions')
        .select('status, plan_type, current_period_end')
        .eq('user_id', user.id)
        .maybeSingle()

      isPro =
        sub?.status === 'active' &&
        sub?.plan_type === 'unlimited_monthly' &&
        (!sub.current_period_end ||
          new Date(sub.current_period_end) > new Date())
    }

    const newStatus = isPro ? 'paid' : 'generated'

    await adminSupabase
      .from('contracts')
      .update({
        pdf_path: storagePath,
        status: newStatus,
        metadata: {
          ...meta,
          language,
        },
      })
      .eq('id', contract_id)

    if (isPro && profile) {
      await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-contract`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            email: profile.email,
            first_name: profile.first_name,
            contract_id,
            pdf_path: storagePath,
            language,
            contract_type,
          }),
        }
      ).catch((err) => console.error('[Generate] send-contract failed:', err))

      await adminSupabase.from('activity_log').insert({
        user_id: user!.id,
        action: 'contract_generated',
        details: `Pro user generated ${contract_type} contract ${contract_id}`,
      })
    }

    const { data: signedUrlData } = await adminSupabase.storage
      .from('contracts')
      .createSignedUrl(storagePath, 300)

    return NextResponse.json({
      contract_id,
      status: newStatus,
      is_pro: isPro,
      signed_url: signedUrlData?.signedUrl ?? null,
      requires_payment: !isPro,
    })
  } catch (error) {
    console.error('[Generate] Error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
