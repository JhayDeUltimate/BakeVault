import React, { useRef, useState, useEffect } from 'react'
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

  /**
   * FIX: Sync internal preview state with the `currentUrl` prop whenever it
   * changes externally (e.g. parent form loads an existing product, or the
   * user types a URL into the companion text input).
   *
   * We only sync when not actively uploading — during an upload we want to
   * keep showing the local object-URL preview, not flash the old remote URL.
   */
  useEffect(() => {
    if (!uploading) {
      setPreview(currentUrl)
    }
  }, [currentUrl, uploading])

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset the input so the same file can be re-selected after an error
    e.target.value = ''

    // Show local blob preview immediately for instant feedback
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    try {
      setUploading(true)
      const remoteUrl = await uploadProductImage(file)

      // FIX: swap blob preview for the permanent remote URL right away —
      // browsers eventually revoke object URLs and the image would break.
      setPreview(remoteUrl)
      onUpload(remoteUrl)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      console.error('[ImageUpload]', msg)

      // FIX: revert to currentUrl prop (the last-known good remote URL, or
      // null for a new product). We capture it in a local variable here
      // rather than relying on the closure so it's always the prop value
      // at the time the error is handled.
      setPreview(currentUrl)
      onError?.(msg)
    } finally {
      // Revoke the temporary object URL to free memory
      URL.revokeObjectURL(objectUrl)
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Preview */}
      {preview && (
        <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-orange-200">
          <img
            src={preview}
            alt="Product preview"
            className="w-full h-full object-cover"
            onError={() => setPreview(null)}
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
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