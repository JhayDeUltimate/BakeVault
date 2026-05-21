import React from 'react'

export default function SkeletonProductCard() {
  return (
    <div className="bg-white rounded-[18px] sm:rounded-[20px] border border-orange-100 overflow-hidden flex h-full flex-col">
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-orange-50">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-50 via-orange-100 to-orange-50 animate-pulse" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-2 sm:p-4">
        <div className="space-y-3">
          <div className="h-4 bg-orange-50 rounded w-3/4 animate-pulse" />
          <div className="h-3 bg-orange-50 rounded w-1/2 animate-pulse" />
        </div>

        <div className="mt-4 border-t border-orange-50 pt-3">
          <div className="h-8 w-full bg-orange-50 rounded-lg sm:h-9 sm:rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}
