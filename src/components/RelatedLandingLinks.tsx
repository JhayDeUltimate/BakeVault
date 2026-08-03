import React from 'react'
import { Link } from 'react-router'

type LandingKey = 'yogurt' | 'kefir' | 'bread'

const LANDING_LINKS: Record<LandingKey, { title: string; path: string; description: string }> = {
  yogurt: {
    title: 'Yogurt Starter in Lagos',
    path:  '/yogurt-starter-lagos',
    description: 'Starter cultures for home yogurt makers and commercial yogurt businesses.',
  },
  kefir: {
    title: 'Kefir Starter in Lagos',
    path:  '/kefir-starter-lagos',
    description: 'Freeze-dried kefir starters for probiotic dairy drinks and health food brands.',
  },
  bread: {
    title: 'Bread Improver in Lagos',
    path:  '/bread-improver-lagos',
    description: 'Dough conditioners and bread improvers for consistent bakery production.',
  },
}

interface Props {
  current: LandingKey
}

export default function RelatedLandingLinks({ current }: Props) {
  const links = (Object.entries(LANDING_LINKS) as [LandingKey, typeof LANDING_LINKS[LandingKey]][])
    .filter(([key]) => key !== current)

  return (
    <section className="bg-white border border-orange-100 rounded-3xl px-6 py-8">
      <h2 className="text-xl font-extrabold text-brand-darkGray font-display mb-2">
        Also from BakeVault
      </h2>
      <p className="text-sm text-brand-darkGray/60 mb-5">
        Popular baking supply searches for Lagos bakers and food businesses.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {links.map(([key, link]) => (
          <Link
            key={key}
            to={link.path}
            className="block rounded-2xl border border-orange-100 bg-brand-cream/50 p-4 hover:border-brand-orange hover:bg-orange-50 transition-colors"
          >
            <h3 className="text-sm font-extrabold text-brand-darkGray">{link.title}</h3>
            <p className="mt-1 text-xs text-brand-darkGray/60 leading-relaxed">{link.description}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
