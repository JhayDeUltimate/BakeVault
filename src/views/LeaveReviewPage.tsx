import React from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router'
import ReviewForm from '@/components/ReviewForm'

export default function LeaveReviewPage() {
  const navigate = useNavigate()

  return (
    <main className="flex-grow bg-brand-cream">
      <Helmet>
        <title>Leave a Review | BakeVault Lagos</title>
        <meta name="description" content="Share your BakeVault experience. Reviews are reviewed before appearing on the storefront." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <section className="border-b border-orange-100 bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-brown"
          >
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="font-display text-3xl font-extrabold text-brand-darkGray sm:text-4xl">
            Tell us how we did
          </h1>
          <p className="mt-3 text-sm font-medium leading-relaxed text-brand-darkGray/60 sm:text-base">
            Your review helps other Lagos bakers know what to expect.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <ReviewForm />
      </section>
    </main>
  )
}
