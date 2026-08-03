import React from 'react'
import { Link } from 'react-router'
import SectionHeading from '@/components/ui/SectionHeading'
import { WHATSAPP_URL } from '@/constants'

const STEPS = [
    {
        number: '01',
        title: 'Browse the vault',
        body: 'Head to the catalog and search by product name or filter by category. Every product has a description and an AI assistant you can ask questions to.',
        cta: { label: 'Browse Catalog', to: '/catalog' },
    },
    {
        number: '02',
        title: 'Add items to your order',
        body: 'Click "Add to Order" on anything you need. You can add as many products as you want. Adjust quantities in your order summary before checking out.',
        cta: null,
    },
    {
        number: '03',
        title: 'Request a quote on WhatsApp',
        body: 'When you\'re ready, tap "Request a Quote on WhatsApp." This sends us your order list automatically. No need to type it out; we get everything.',
        cta: null,
    },
    {
        number: '04',
        title: 'We confirm price and availability',
        body: 'Our team sends you the full price breakdown, including delivery. Orders above ₦50,000 qualify for wholesale pricing, which we apply automatically. You confirm, we proceed.',
        cta: null,
    },
    {
        number: '05',
        title: 'Pay via bank transfer',
        body: 'Once you\'ve confirmed the quote, we send our account details. Payment is made via bank transfer. We don\'t ask for payment until you\'ve seen and agreed to the final amount.',
        cta: null,
    },
    {
        number: '06',
        title: 'We deliver, or you pick up',
        body: 'Lagos orders placed and paid before 2PM are delivered the same day. Nationwide orders go out the same day and arrive in 1 to 3 business days. You\'ll get a confirmation when your order is on its way.',
        cta: null,
    },
]

const TIPS = [
    {
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        title: 'Order before 2PM for same-day delivery',
        body: 'Lagos deliveries placed and confirmed before 2PM go out the same day.',
    },
    {
        icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
        title: 'Add everything in one go',
        body: 'Fewer orders means fewer delivery fees. Add everything you need in one session.',
    },
    {
        icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        title: "Don't see what you need?",
        body: 'Use the product request form on the catalog page. We source on request.',
    },
]

export default function HowToOrderPage() {
    return (
        <main className="flex-grow">
            {/* Hero */}
            <section className="bg-white border-b border-orange-100 px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                <div className="max-w-3xl mx-auto text-left sm:text-center">
                    <button
                        onClick={() => window.history.back()}
                        className="sm:hidden inline-flex items-center gap-2 text-xs font-bold text-brand-brown uppercase tracking-wider mb-6"
                    >
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                    <SectionHeading
                        eyebrow="How to Order"
                        title="Ordering from BakeVault is straightforward"
                        description="Browse, add to order, request a quote on WhatsApp. We handle the rest."
                    />
                </div>
            </section>

            {/* Steps */}
            <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="space-y-4">
                    {STEPS.map((step, i) => (
                        <div
                            key={step.number}
                            className="bg-white border border-orange-100 rounded-2xl p-6 sm:p-7 shadow-sm flex gap-5 sm:gap-7"
                        >
                            <div className="shrink-0">
                                <span className="text-3xl sm:text-4xl font-extrabold text-brand-orange/20 font-display leading-none">
                                    {step.number}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-extrabold text-brand-darkGray font-display mb-2">
                                    {step.title}
                                </h3>
                                <p className="text-sm text-brand-darkGray/70 leading-relaxed font-medium">
                                    {step.body}
                                </p>
                                {step.cta && (
                                    <Link
                                        to={step.cta.to}
                                        className="inline-flex mt-3 items-center gap-1.5 text-xs font-extrabold text-brand-orange hover:text-brand-brown transition-colors uppercase tracking-wider"
                                    >
                                        {step.cta.label} →
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tips */}
                <div className="mt-12">
                    <h2 className="text-lg font-extrabold text-brand-darkGray font-display uppercase tracking-wider mb-5">
                        A few things worth knowing
                    </h2>
                    <div className="grid sm:grid-cols-3 gap-4">
                        {TIPS.map(tip => (
                            <div
                                key={tip.title}
                                className="bg-brand-cream border border-orange-100 rounded-2xl p-5"
                            >
                                <div className="w-9 h-9 bg-brand-orange/10 rounded-xl flex items-center justify-center mb-3">
                                    <svg className="w-5 h-5 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tip.icon} />
                                    </svg>
                                </div>
                                <h4 className="text-sm font-bold text-brand-darkGray font-display mb-1">{tip.title}</h4>
                                <p className="text-xs text-brand-darkGray/60 leading-relaxed">{tip.body}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-10 bg-white border border-orange-100 rounded-2xl px-6 py-7 text-center shadow-sm">
                    <h3 className="text-base font-extrabold text-brand-darkGray font-display mb-2">
                        Ready to order?
                    </h3>
                    <p className="text-sm text-brand-darkGray/60 font-medium mb-5">
                        Browse the catalog, add what you need, and we'll take it from there.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            to="/catalog"
                            className="w-full sm:w-auto text-center bg-brand-orange hover:bg-brand-brown text-white font-extrabold px-8 py-3 rounded-2xl transition-all active:scale-95 text-sm font-display uppercase tracking-wide"
                        >
                            Browse the Vault
                        </Link>
                        {WHATSAPP_URL && (
                            <a
                                href={WHATSAPP_URL}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full sm:w-auto text-center bg-white hover:bg-orange-50 text-brand-darkGray border border-orange-100 font-extrabold px-8 py-3 rounded-2xl transition-all text-sm font-display uppercase tracking-wide"
                            >
                                Order on WhatsApp
                            </a>
                        )}
                    </div>
                </div>
            </section>
        </main>
    )
}