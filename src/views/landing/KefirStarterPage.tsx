import React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { WHATSAPP_URL } from '@/constants'
import RelatedLandingLinks from '@/components/RelatedLandingLinks'

export default function KefirStarterPage() {
  return (
    <>
      <Helmet>
        <title>Kefir Starter Culture in Lagos Nigeria | BakeVault</title>
        <meta name="description" content="Buy kefir starter culture in Lagos Nigeria. Make probiotic milk kefir at home or for your health food business. Same-day delivery. Wholesale and retail. Order via WhatsApp." />
        <meta property="og:title" content="Kefir Starter Culture in Lagos Nigeria | BakeVault" />
        <meta property="og:description" content="Buy kefir starter culture in Lagos Nigeria. Make probiotic milk kefir at home or for your health food business. Same-day delivery. Wholesale and retail. Order via WhatsApp." />
        <meta property="og:image" content="https://bakevault.com.ng/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://bakevault.com.ng/og-image.jpg" />
        <link rel="canonical" href="https://bakevault.com.ng/kefir-starter-lagos" />
      </Helmet>

      <section className="bg-white border-b border-orange-100 px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block text-xs font-black text-brand-orange uppercase tracking-widest mb-4">
            Kefir Starter · Lagos Nigeria
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-darkGray font-display tracking-tight leading-tight mb-6">
            Kefir Starter Culture in Lagos: Make Probiotic Kefir in Nigeria
          </h1>
          <p className="text-lg text-brand-darkGray/70 leading-relaxed mb-8">
            BakeVault is one of the few places in Lagos where you can buy a <strong>kefir starter culture</strong> without waiting weeks for international shipping. We stock freeze-dried kefir starters for home producers and health food businesses, available retail and wholesale.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/catalog?cat=Yogurt+%26+Dairy+Starters" className="w-full sm:w-auto text-center bg-brand-orange text-white font-extrabold px-8 py-4 rounded-2xl hover:bg-brand-brown transition-all shadow-lg active:scale-95 font-display text-sm uppercase tracking-wide">
              Shop Kefir Starters
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
          <h2 className="text-2xl font-extrabold text-brand-darkGray font-display mb-4">What Is Kefir?</h2>
          <p className="text-brand-darkGray/75 leading-relaxed">
            Kefir is a fermented milk drink: tangy, slightly effervescent, and packed with probiotics. Unlike yogurt, kefir ferments at <strong>room temperature</strong>, making it especially well-suited to Nigeria's warm climate (no incubator required). It contains up to 61 strains of beneficial bacteria and yeasts, making it one of the most potent natural probiotic foods available.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold text-brand-darkGray font-display mb-4">Health Benefits of Kefir</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: '🦠', title: 'Gut Health', body: 'Diverse probiotic strains restore microbiome balance and support healthy digestion.' },
              { icon: '🦴', title: 'Bone Strength', body: 'Rich in calcium and vitamin K2, which together maintain bone density.' },
              { icon: '🛡️', title: 'Immune Support', body: 'Bioactive compounds help reduce inflammation and strengthen immunity.' },
              { icon: '🥛', title: 'Lactose Friendly', body: 'Fermentation breaks down much of the lactose, making it easier to digest than plain milk.' },
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
          <h2 className="text-2xl font-extrabold text-brand-darkGray font-display mb-4">How to Make Kefir in Nigeria</h2>
          <p className="text-brand-darkGray/75 leading-relaxed mb-5">
            Making kefir is simpler than making yogurt: no heating, no incubator. The Lagos climate (25–30°C) is close to ideal.
          </p>
          <ol className="space-y-3 text-brand-darkGray/75 leading-relaxed list-none">
            {[
              { step: '1', title: 'Combine', detail: 'Add your kefir starter to 500ml of fresh whole milk in a clean glass jar.' },
              { step: '2', title: 'Cover loosely', detail: 'Use a breathable cloth secured with a rubber band, not an airtight lid, as gas needs to escape.' },
              { step: '3', title: 'Ferment', detail: 'Leave at room temperature out of direct sunlight for 18–24 hours. In Lagos warmth this often completes in 18 hours.' },
              { step: '4', title: 'Strain and chill', detail: 'Strain through a fine mesh. Refrigerate; kefir keeps up to 2 weeks chilled.' },
              { step: '5', title: 'Repeat', detail: 'Reserve a small portion to culture your next batch (follow your starter\'s re-culture instructions).' },
            ].map(({ step, title, detail }) => (
              <li key={step} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-brand-orange text-white text-sm font-extrabold rounded-full flex items-center justify-center">{step}</span>
                <div><strong className="text-brand-darkGray">{title}:</strong> {detail}</div>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold text-brand-darkGray font-display mb-4">The Kefir Business Opportunity in Nigeria</h2>
          <p className="text-brand-darkGray/75 leading-relaxed">
            Kefir is almost completely unknown to the mainstream Nigerian consumer, which means whoever builds a local kefir brand now has a significant first-mover advantage. Health-conscious buyers in Lagos and Abuja are already searching for it; the supply side is nearly empty. If you run a yogurt business or a health food brand, adding kefir is a low-cost product extension that commands premium pricing. BakeVault supplies starters at both retail and wholesale quantities. WhatsApp us to discuss commercial pricing.
          </p>
        </section>

        <RelatedLandingLinks current="kefir" />

        <section className="bg-brand-cream border border-orange-100 rounded-3xl px-6 py-8 text-center">
          <h2 className="text-xl font-extrabold text-brand-darkGray font-display mb-2">Get Your Kefir Starter in Lagos Today</h2>
          <p className="text-sm text-brand-darkGray/60 mb-6">Same-day delivery across Lagos. Retail and wholesale available.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/catalog?cat=Yogurt+%26+Dairy+Starters" className="w-full sm:w-auto text-center bg-brand-orange text-white font-extrabold px-6 py-3 rounded-2xl hover:bg-brand-brown transition-all text-sm uppercase tracking-wide font-display">
              View Kefir &amp; Dairy Starters →
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
