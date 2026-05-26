import React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { WHATSAPP_URL } from '@/constants'
import RelatedLandingLinks from '@/components/RelatedLandingLinks'

export default function BreadImproverPage() {
  return (
    <>
      <Helmet>
        <title>Bread Improver &amp; Dough Conditioner in Lagos Nigeria | BakeVault</title>
        <meta name="description" content="Buy bread improver and dough conditioner in Lagos Nigeria. Dynamil Blue, enzymes, and emulsifiers for commercial bakeries. ADA and bromate-free. Wholesale pricing. Same-day delivery." />
        <link rel="canonical" href="https://bakevault.com.ng/bread-improver-lagos" />
      </Helmet>

      <section className="bg-white border-b border-orange-100 px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block text-xs font-black text-brand-orange uppercase tracking-widest mb-4">
            Bread Improver · Lagos Nigeria
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-darkGray font-display tracking-tight leading-tight mb-6">
            Bread Improver &amp; Dough Conditioner in Lagos, Wholesale &amp; Retail
          </h1>
          <p className="text-lg text-brand-darkGray/70 leading-relaxed mb-8">
            Looking for <strong>bread improver in Lagos</strong>? BakeVault stocks trusted commercial-grade dough conditioners, including Dynamil Blue by Lesaffre, at wholesale and retail quantities with same-day delivery across Lagos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/catalog?cat=Baking+Ingredients" className="w-full sm:w-auto text-center bg-brand-orange text-white font-extrabold px-8 py-4 rounded-2xl hover:bg-brand-brown transition-all shadow-lg active:scale-95 font-display text-sm uppercase tracking-wide">
              Shop Baking Ingredients
            </Link>
            {WHATSAPP_URL && (
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="w-full sm:w-auto text-center bg-brand-cream text-brand-darkGray font-extrabold px-8 py-4 rounded-2xl hover:bg-orange-100 transition-all border border-orange-100 font-display text-sm uppercase tracking-wide">
                Order on WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-10">

        <section>
          <h2 className="text-2xl font-extrabold text-brand-darkGray font-display mb-4">What Is a Bread Improver?</h2>
          <p className="text-brand-darkGray/75 leading-relaxed">
            A bread improver (also called a dough conditioner) is a carefully formulated blend of enzymes, emulsifiers, acids, and yeast nutrients that you add to flour before mixing. It doesn't replace good baking practice; it amplifies it. The result is a dough that's easier to handle, a crumb that's softer and more uniform, and a loaf that stays fresh longer on the shelf.
          </p>
          <p className="text-brand-darkGray/75 leading-relaxed mt-4">
            For commercial bakeries in Lagos producing hundreds of loaves per day, bread improver is not optional. It's the difference between consistent, sellable output and daily guesswork caused by flour quality variation, humidity changes, and proofing temperature swings.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold text-brand-darkGray font-display mb-4">What Does Bread Improver Actually Do?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: '🍞', title: 'Better Volume & Rise', body: 'Strengthens the gluten network so dough traps more gas during proofing, producing a taller, lighter loaf.' },
              { icon: '🤲', title: 'Easier Dough Handling', body: 'Reduces stickiness and improves elasticity, making the dough less frustrating to machine-cut or hand-shape.' },
              { icon: '📅', title: 'Longer Shelf Life', body: 'Slows down starch retrogradation (staling), keeping bread soft for days instead of hours.' },
              { icon: '✅', title: 'Batch Consistency', body: 'Compensates for natural variations in flour quality and weather; same result every bake, every day.' },
            ].map(({ icon, title, body }) => (
              <div key={title} className="bg-brand-cream border border-orange-100 rounded-2xl p-5">
                <div className="text-2xl mb-2">{icon}</div>
                <h3 className="font-extrabold text-brand-darkGray text-sm mb-1">{title}</h3>
                <p className="text-xs text-brand-darkGray/65 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold text-brand-darkGray font-display mb-4">How to Use Bread Improver</h2>
          <p className="text-brand-darkGray/75 leading-relaxed mb-5">
            Using bread improver is straightforward, but precision matters. It's a concentrate, not a bulk ingredient.
          </p>
          <ol className="space-y-3 text-brand-darkGray/75 leading-relaxed list-none">
            {[
              { step: '1', title: 'Measure accurately', detail: 'The standard dosage for most improvers (e.g. Dynamil Blue) is 0.2% of flour weight, which is 100g per 50kg bag of flour. More is not better.' },
              { step: '2', title: 'Add to flour first', detail: 'Mix the improver directly into the dry flour before adding water, yeast, or other ingredients. This ensures even distribution.' },
              { step: '3', title: 'Mix and knead as normal', detail: 'Proceed with your standard dough mixing, bulk fermentation, and proofing. The improver works silently in the background.' },
              { step: '4', title: 'Store properly', detail: 'Keep your improver in a cool, dry place (under 25°C) in a sealed container. Heat and moisture degrade the active enzymes.' },
            ].map(({ step, title, detail }) => (
              <li key={step} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-brand-orange text-white text-sm font-extrabold rounded-full flex items-center justify-center">{step}</span>
                <div><strong className="text-brand-darkGray">{title}:</strong> {detail}</div>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold text-brand-darkGray font-display mb-4">Dynamil Blue: The Standard for Nigerian Bakeries</h2>
          <p className="text-brand-darkGray/75 leading-relaxed">
            Dynamil Blue is manufactured by Lesaffre, the world's largest yeast and baking ingredient company, and formulated specifically for the African market. It's the go-to bread improver for sandwich loaves in Nigeria's commercial bakeries for three reasons:
          </p>
          <ul className="mt-4 space-y-2 text-brand-darkGray/75 leading-relaxed list-disc pl-5">
            <li><strong>ADA and bromate-free</strong>, compliant with NAFDAC guidelines and safe for consumers</li>
            <li><strong>Optimised for tropical conditions</strong>, performs consistently in Lagos heat and humidity</li>
            <li><strong>Proven at scale</strong>, used by industrial bakeries producing thousands of loaves daily</li>
          </ul>
          <p className="text-brand-darkGray/75 leading-relaxed mt-4">
            BakeVault stocks Dynamil Blue and other bread improver brands in both retail quantities (for small bakeries and home bakers) and wholesale bags (for commercial operations). WhatsApp us for current stock and bulk pricing.
          </p>
        </section>

        <RelatedLandingLinks current="bread" />

        <section className="bg-brand-cream border border-orange-100 rounded-3xl px-6 py-8 text-center">
          <h2 className="text-xl font-extrabold text-brand-darkGray font-display mb-2">Order Bread Improver in Lagos</h2>
          <p className="text-sm text-brand-darkGray/60 mb-6">Same-day delivery. Retail packs and wholesale bags. ADA and bromate-free options.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/catalog?cat=Baking+Ingredients" className="w-full sm:w-auto text-center bg-brand-orange text-white font-extrabold px-6 py-3 rounded-2xl hover:bg-brand-brown transition-all text-sm uppercase tracking-wide font-display">
              View Baking Ingredients →
            </Link>
            {WHATSAPP_URL && (
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="w-full sm:w-auto text-center text-green-700 font-bold text-sm hover:text-green-800 transition-colors">
                WhatsApp us for bulk pricing
              </a>
            )}
          </div>
        </section>

      </main>
    </>
  )
}
