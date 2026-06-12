import React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { WHATSAPP_URL } from '@/constants'
import RelatedLandingLinks from '@/components/RelatedLandingLinks'

export default function YogurtStarterPage() {
  return (
    <>
      <Helmet>
        <title>Yogurt Starter Culture in Lagos Nigeria | BakeVault</title>
        <meta name="description" content="Buy yogurt starter culture in Lagos Nigeria. Yogourmet, Probio, and kefir starters available wholesale and retail. Same-day delivery within Lagos. Order via WhatsApp." />
        <meta property="og:title" content="Yogurt Starter Culture in Lagos Nigeria | BakeVault" />
        <meta property="og:description" content="Buy yogurt starter culture in Lagos Nigeria. Yogourmet, Probio, and kefir starters available wholesale and retail. Same-day delivery within Lagos. Order via WhatsApp." />
        <meta property="og:image" content="https://bakevault.com.ng/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://bakevault.com.ng/og-image.jpg" />
        <link rel="canonical" href="https://bakevault.com.ng/yogurt-starter-lagos" />
      </Helmet>

      {/* Hero */}
      <section className="bg-white border-b border-orange-100 px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block text-xs font-black text-brand-orange uppercase tracking-widest mb-4">
            Yogurt &amp; Dairy Starters · Lagos Nigeria
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-darkGray font-display tracking-tight leading-tight mb-6">
            Yogurt Starter Culture in Lagos, For Home Bakers &amp; Yogurt Businesses
          </h1>
          <p className="text-lg text-brand-darkGray/70 leading-relaxed mb-8">
            If you're looking to buy <strong>yogurt starter culture in Lagos</strong>, BakeVault stocks the most trusted brands: Yogourmet Original, Probio, and kefir varieties, available for both retail and wholesale pickup or same-day delivery across Lagos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/catalog?cat=Yogurt+%26+Dairy+Starters"
              className="w-full sm:w-auto text-center bg-brand-orange text-white font-extrabold px-8 py-4 rounded-2xl hover:bg-brand-brown transition-all shadow-lg active:scale-95 font-display text-sm uppercase tracking-wide"
            >
              Shop Yogurt Starters
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

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="prose prose-lg max-w-none space-y-10">

          {/* What is it */}
          <section>
            <h2 className="text-2xl font-extrabold text-brand-darkGray font-display mb-4">
              What Is a Yogurt Starter Culture?
            </h2>
            <p className="text-brand-darkGray/75 leading-relaxed">
              A yogurt starter culture is a freeze-dried blend of live beneficial bacteria,
              primarily <em>Lactobacillus bulgaricus</em> and <em>Streptococcus thermophilus</em>,
              that ferments warm milk into yogurt. When you add the starter to milk that has been
              heated and cooled to around 40–45°C, the bacteria activate and convert lactose (milk
              sugar) into lactic acid, giving yogurt its characteristic tangy flavour and thick texture.
            </p>
            <p className="text-brand-darkGray/75 leading-relaxed mt-4">
              Unlike using store-bought yogurt as a starter (which degrades in potency after 3–4 batches),
              a commercial freeze-dried starter produces consistent, reliable results every time;
              this is critical if you're running a yogurt business in Nigeria and need batch-to-batch uniformity.
            </p>
          </section>

          {/* How to use */}
          <section>
            <h2 className="text-2xl font-extrabold text-brand-darkGray font-display mb-4">
              How to Use Yogurt Starter Culture
            </h2>
            <ol className="space-y-3 text-brand-darkGray/75 leading-relaxed list-none">
              {[
                { step: '1', title: 'Heat the milk', detail: 'Bring fresh or powdered milk to 80–85°C, stirring continuously to prevent scorching. This sterilises the milk and improves the final texture.' },
                { step: '2', title: 'Cool to inoculation temperature', detail: 'Allow the milk to cool to 40–45°C (warm to the touch but not hot). Adding starter to hot milk kills the bacteria and the yogurt will not set.' },
                { step: '3', title: 'Add the starter', detail: 'Dissolve the starter sachet in a small cup of the warm milk, then stir it thoroughly into the main batch.' },
                { step: '4', title: 'Incubate', detail: 'Pour into clean containers and keep in a warm place (an oven with the light on, or wrapped in a thick blanket) for 8–12 hours undisturbed.' },
                { step: '5', title: 'Chill and serve', detail: 'Transfer to the fridge for at least 6 hours to firm up. The cold-set is what gives yogurt its smooth, spoonable consistency.' },
              ].map(({ step, title, detail }) => (
                <li key={step} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-brand-orange text-white text-sm font-extrabold rounded-full flex items-center justify-center">
                    {step}
                  </span>
                  <div>
                    <strong className="text-brand-darkGray">{title}:</strong>{' '}
                    <span>{detail}</span>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Starting a yogurt business */}
          <section>
            <h2 className="text-2xl font-extrabold text-brand-darkGray font-display mb-4">
              Starting a Yogurt Business in Nigeria? Here's What You Need
            </h2>
            <p className="text-brand-darkGray/75 leading-relaxed">
              The yogurt market in Nigeria is growing rapidly: demand is strong, margins are good,
              and barriers to entry are low. The single biggest variable between a successful yogurt
              brand and a failed one is <strong>starter culture quality</strong>. Here's what
              separates serious producers from hobbyists:
            </p>
            <ul className="mt-4 space-y-2 text-brand-darkGray/75 leading-relaxed list-disc pl-5">
              <li><strong>Certified commercial starters</strong> (not recycled homemade batches) for consistency batch after batch</li>
              <li><strong>Full-cream milk</strong>, because richer fat content gives a creamier, more stable product</li>
              <li><strong>Temperature control</strong>; invest in a thermometer, as guessing is the #1 cause of failed batches</li>
              <li><strong>Food-grade packaging</strong>: sealed cups or pouches maintain shelf life and signal quality to buyers</li>
            </ul>
            <p className="text-brand-darkGray/75 leading-relaxed mt-4">
              BakeVault supplies yogurt starter cultures to home producers and commercial yogurt
              businesses across Lagos. Whether you need a single box to test a recipe or wholesale
              quantities for your weekly production run, we have stock and we deliver same-day.
            </p>
          </section>

          <RelatedLandingLinks current="yogurt" />

          {/* CTA */}
          <section className="bg-brand-cream border border-orange-100 rounded-3xl px-6 py-8 text-center">
            <h2 className="text-xl font-extrabold text-brand-darkGray font-display mb-2">
              Ready to Order Yogurt Starter in Lagos?
            </h2>
            <p className="text-sm text-brand-darkGray/60 mb-6">
              Browse our full range of yogurt and dairy starters. Retail and wholesale pricing available.
              Same-day delivery within Lagos.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/catalog?cat=Yogurt+%26+Dairy+Starters"
                className="w-full sm:w-auto text-center bg-brand-orange text-white font-extrabold px-6 py-3 rounded-2xl hover:bg-brand-brown transition-all text-sm uppercase tracking-wide font-display"
              >
                View All Yogurt Starters →
              </Link>
              {WHATSAPP_URL && (
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto text-center text-green-700 font-bold text-sm hover:text-green-800 transition-colors"
                >
                  WhatsApp us for bulk pricing
                </a>
              )}
            </div>
          </section>

        </div>
      </main>
    </>
  )
}
