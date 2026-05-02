'use client'

import { useRef, useState } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import {
  MAX_LOGO_SIZE_BYTES,
  STORAGE_BUCKETS,
  SUPPORTED_LOGO_MIME_TYPES,
} from '@/lib/constants'
import { cn } from '@/lib/utils'

interface LogoUploadProps {
  userId: string
  currentUrl?: string | null
  onUpload: (url: string) => void
  onRemove?: () => void
  label?: string
  hint?: string
  className?: string
}

export function LogoUpload({
  userId,
  currentUrl,
  onUpload,
  onRemove,
  label = 'Upload logo',
  hint = 'Max 2 MB. PNG, JPG, SVG, or WebP.',
  className,
}: LogoUploadProps) {
  const supabase = createClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setError(null)
    if (!SUPPORTED_LOGO_MIME_TYPES.includes(file.type as (typeof SUPPORTED_LOGO_MIME_TYPES)[number])) {
      setError('Please upload a PNG, JPG, SVG, or WebP image.')
      return
    }
    if (file.size > MAX_LOGO_SIZE_BYTES) {
      setError('File is too large. Maximum size is 2 MB.')
      return
    }

    setUploading(true)
    try {
      const ext = file.name.split('.').pop() ?? 'png'
      const path = `${userId}/logo_${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKETS.LOGOS)
        .upload(path, file, { upsert: true, contentType: file.type })

      if (uploadError) {
        setError(uploadError.message)
        return
      }

      const { data: publicUrl } = supabase.storage
        .from(STORAGE_BUCKETS.LOGOS)
        .getPublicUrl(path)

      onUpload(publicUrl.publicUrl)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      {currentUrl ? (
        <div className="flex items-center gap-3 rounded-md border p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentUrl}
            alt="Logo preview"
            className="h-16 w-16 object-contain"
          />
          <div className="flex-1">
            <p className="text-sm font-medium truncate">{currentUrl.split('/').pop()}</p>
            <p className="text-xs text-muted-foreground">{hint}</p>
          </div>
          {onRemove ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              aria-label="Remove logo"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30 p-6 text-sm text-muted-foreground hover:border-muted-foreground/50 transition-colors"
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin mb-2" />
          ) : (
            <Upload className="h-5 w-5 mb-2" />
          )}
          <span className="font-medium">{label}</span>
          <span className="text-xs">{hint}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={SUPPORTED_LOGO_MIME_TYPES.join(',')}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
