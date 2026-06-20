import React, { useRef, useState, useEffect } from 'react'
import { uploadProductImage } from '@/lib/api'
import { optimizeImageUrl, FALLBACK_IMAGE, IMG } from '@/lib/image'
import { logger } from '@/lib/logger'

interface Props {
  currentUrl: string | null
  onUpload:   (url: string) => void
  onError?:   (msg: string) => void
}

export default function ImageUpload({ currentUrl, onUpload, onError }: Props) {
  const inputRef              = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [preview,   setPreview]   = useState<string | null>(currentUrl)

  useEffect(() => {
    if (!uploading) setPreview(currentUrl)
  }, [currentUrl, uploading])

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    try {
      setUploading(true)
      const remoteUrl = await uploadProductImage(file)
      setPreview(remoteUrl)
      onUpload(remoteUrl)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      logger.error('Image upload failed', err instanceof Error ? err : undefined, {
        event: 'image.upload_ui_error',
        message: msg,
      })
      setPreview(currentUrl)
      onError?.(msg)
    } finally {
      URL.revokeObjectURL(objectUrl)
      setUploading(false)
    }
  }

  const displaySrc = preview ? optimizeImageUrl(preview, IMG.adminThumb) : null

  return (
    <div className="space-y-3">
      {displaySrc && (
        <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-orange-200 bg-orange-50">
          <img
            src={displaySrc}
            alt="Product preview"
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            onError={e => {
              // Fallback for blob URLs or broken remote URLs
              const img = e.target as HTMLImageElement
              if (img.src !== FALLBACK_IMAGE) img.src = FALLBACK_IMAGE
            }}
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFile}
        className="hidden"
        aria-label="Upload product photo"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="px-4 py-2 text-sm font-semibold bg-orange-50 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? 'Uploading…' : preview ? 'Change Photo' : 'Upload Photo'}
      </button>
      <p className="text-xs text-gray-400">JPEG, PNG or WebP · Max 5 MB</p>
    </div>
  )
}
