import React from 'react'
import { Link } from 'react-router-dom'
import AboutSection        from '@/components/sections/AboutSection'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import SectionHeading      from '@/components/ui/SectionHeading'
import { TESTIMONIALS, WHATSAPP_URL } from '@/constants'

export default function AboutPage() {
  return (
    <>
      <section className="bg-white border-b border-orange-100 px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            eyebrow="About"
            title="Built for bakers who need dependable stock, fast answers, and supply they can trust."
            description="We help home bakers, cake studios, and growing production teams source premium ingredients without the friction that slows down daily operations."
          />
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/catalog"
              className="w-full sm:w-auto text-center bg-brand-orange text-white font-extrabold px-8 py-4 rounded-2xl hover:bg-brand-brown transition-all shadow-lg active:scale-95 font-display text-sm uppercase tracking-wide"
            >
              Browse Catalog
            </Link>
            {WHATSAPP_URL && (
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto text-center bg-brand-cream text-brand-darkGray font-extrabold px-8 py-4 rounded-2xl hover:bg-orange-100 transition-all border border-orange-100 font-display text-sm uppercase tracking-wide"
              >
                Chat on WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>
      <AboutSection withBorder={false} />
      <TestimonialsSection testimonials={TESTIMONIALS} />
    </>
  )
}