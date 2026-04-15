import React, { useRef, useState } from 'react'
import { uploadProductImage } from '@/lib/api'

interface Props {
  currentUrl: string | null
  onUpload:   (url: string) => void
  onError?:   (msg: string) => void
}

export default function ImageUpload({ currentUrl, onUpload, onError }: Props) {
  const inputRef              = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [preview,   setPreview]   = useState<string | null>(currentUrl)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Local preview immediately
    setPreview(URL.createObjectURL(file))

    try {
      setUploading(true)
      const url = await uploadProductImage(file)
      onUpload(url)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      console.error('[ImageUpload]', msg)
      setPreview(currentUrl)
      onError?.(msg)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Preview */}
      {preview && (
        <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-orange-200">
          <img src={preview} alt="Product" className="w-full h-full object-cover" />
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* Upload button */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFile}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="px-4 py-2 text-sm font-semibold bg-orange-50 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50"
      >
        {uploading ? 'Uploading…' : preview ? 'Change Photo' : 'Upload Photo'}
      </button>
      <p className="text-xs text-gray-400">JPEG, PNG or WebP · Max 5 MB</p>
    </div>
  )
}