import React from 'react'
import { Link } from 'react-router-dom'
import AboutSection        from '@/components/sections/AboutSection'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import SectionHeading      from '@/components/ui/SectionHeading'
import { WHATSAPP_URL }    from '@/constants'
import { useTestimonials } from '@/hooks'

export default function AboutPage() {
  // FIX: use the DB-backed hook instead of the hardcoded TESTIMONIALS constant
  // so changes made in Admin → Testimonials are immediately reflected here.
  const { testimonials } = useTestimonials(true)

  return (
    <>
      <section className="bg-white border-b border-orange-100 px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            eyebrow="About"
            title="Your ingredients. In stock. Delivered today."
            description="BakeVault supplies baking ingredients to home bakers and professional bakeries across Nigeria. Same-day delivery in Lagos, competitive wholesale pricing, and a team that picks up when you have a question about a product."
          />
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/catalog"
              className="w-full sm:w-auto text-center bg-brand-orange text-white font-extrabold px-8 py-4 rounded-2xl hover:bg-brand-brown transition-all shadow-lg active:scale-95 font-display text-sm uppercase tracking-wide"
            >
              Browse the Vault
            </Link>
            {WHATSAPP_URL && (
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto text-center bg-brand-cream text-brand-darkGray font-extrabold px-8 py-4 rounded-2xl hover:bg-orange-100 transition-all border border-orange-100 font-display text-sm uppercase tracking-wide"
              >
                Order on WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>
      <AboutSection withBorder={false} />
      <TestimonialsSection testimonials={testimonials} />
    </>
  )
}