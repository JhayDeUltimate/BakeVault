import React from 'react'

export default function SkeletonProductCard() {
  return (
    <div className="bg-white rounded-[24px] border border-orange-100 overflow-hidden p-4 sm:p-5 flex flex-col lg:flex-row gap-4">
      {/* Image */}
      <div className="flex-shrink-0 w-full lg:w-40 h-40 lg:h-40 bg-orange-50 rounded-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-50 via-orange-100 to-orange-50 animate-pulse" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="h-4 bg-orange-50 rounded w-3/4 animate-pulse" />
          <div className="h-3 bg-orange-50 rounded w-1/2 animate-pulse" />
          <div className="h-3 bg-orange-50 rounded w-full animate-pulse" />
          <div className="h-3 bg-orange-50 rounded w-full animate-pulse" />
        </div>

        <div className="mt-4 lg:mt-0 flex items-center justify-between">
          <div className="hidden lg:flex flex-col items-start gap-2">
            <div className="h-3 bg-orange-50 rounded w-24 animate-pulse" />
            <div className="h-3 bg-orange-50 rounded w-28 animate-pulse" />
          </div>

          <div className="w-full lg:w-auto">
            <div className="h-10 bg-orange-50 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
