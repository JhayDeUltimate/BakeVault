import React, { useRef, useState } from 'react'
import { uploadProductImage } from '@/lib/api'

interface Props {
  urls:     string[]       // current additional image URLs
  onChange: (urls: string[]) => void
  onError?: (msg: string) => void
  max?:     number         // default 4 (primary + 4 = 5 total)
}

export default function MultiImageUpload({ urls, onChange, onError, max = 4 }: Props) {
  const inputRef          = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    e.target.value = ''

    const remaining = max - urls.length
    const toUpload  = files.slice(0, remaining)

    try {
      setLoading(true)
      const uploaded = await Promise.all(toUpload.map(f => uploadProductImage(f)))
      onChange([...urls, ...uploaded])
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  function remove(idx: number) {
    onChange(urls.filter((_, i) => i !== idx))
  }

  const canAdd = urls.length < max

  return (
    <div className="space-y-3">
      {/* Thumbnails grid */}
      {urls.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {urls.map((url, idx) => (
            <div key={url + idx} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-orange-200 group">
              <img src={url} alt={`Additional image ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove(idx)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {canAdd && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-orange-50 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-3 h-3 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Photos ({urls.length}/{max})
              </>
            )}
          </button>
        </>
      )}

      <p className="text-xs text-gray-400">
        Up to {max} additional photos · JPEG, PNG or WebP · Max 5 MB each
      </p>
    </div>
  )
}