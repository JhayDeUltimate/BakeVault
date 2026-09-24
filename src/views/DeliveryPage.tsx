import React from 'react'
import { Link } from 'react-router'
import { Helmet } from 'react-helmet-async'
import SectionHeading from '@/components/ui/SectionHeading'
import { WHATSAPP_URL } from '@/constants'

export default function DeliveryPage() {
    return (
        <main className="flex-grow">
            <Helmet>
                <link rel="canonical" href="https://bakevault.com.ng/delivery" />
            </Helmet>
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
                        eyebrow="Delivery"
                        title="Same day in Lagos. Nationwide in 1–3 days."
                        description="Order before 2PM and your ingredients are with you before the end of the day. Here's everything you need to know."
                    />
                </div>
            </section>

            <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-6">

                {/* Lagos */}
                <div className="bg-white border border-orange-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-brand-brown px-6 py-4 flex items-center gap-3">
                        <svg className="w-5 h-5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <h2 className="text-sm font-extrabold text-white font-display uppercase tracking-wider">Lagos Delivery</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="grid sm:grid-cols-3 gap-4">
                            {[
                                { label: 'Cut-off time', value: '2:00 PM' },
                                { label: 'Delivery time', value: 'Same day' },
                                { label: 'Fee range', value: '₦1,500 – ₦10,000' },
                            ].map(item => (
                                <div key={item.label} className="bg-brand-cream rounded-xl p-4 text-center">
                                    <p className="text-xs font-bold text-brand-darkGray/50 uppercase tracking-wider mb-1">{item.label}</p>
                                    <p className="text-base font-extrabold text-brand-brown font-display">{item.value}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-brand-darkGray/70 leading-relaxed">
                            Delivery fees within Lagos depend on your location. The exact fee is quoted before you confirm your order; nothing is added after the fact. Orders placed after 2PM are dispatched the next business day.
                        </p>
                    </div>
                </div>

                {/* Nationwide */}
                <div className="bg-white border border-orange-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-brand-orange px-6 py-4 flex items-center gap-3">
                        <svg className="w-5 h-5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                        </svg>
                        <h2 className="text-sm font-extrabold text-white font-display uppercase tracking-wider">Nationwide Shipping</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="grid sm:grid-cols-3 gap-4">
                            {[
                                { label: 'Dispatch', value: 'Same day' },
                                { label: 'Delivery time', value: '1–3 business days' },
                                { label: 'Fee', value: 'Based on weight' },
                            ].map(item => (
                                <div key={item.label} className="bg-brand-cream rounded-xl p-4 text-center">
                                    <p className="text-xs font-bold text-brand-darkGray/50 uppercase tracking-wider mb-1">{item.label}</p>
                                    <p className="text-base font-extrabold text-brand-brown font-display">{item.value}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-brand-darkGray/70 leading-relaxed">
                            We ship to all states through reliable courier partners. Shipping fees are calculated based on order weight and your location; we'll quote you the exact amount during order confirmation. You'll receive a tracking number once your order is dispatched.
                        </p>
                    </div>
                </div>

                {/* Notes */}
                <div className="bg-brand-cream border border-orange-100 rounded-2xl p-6 space-y-3">
                    <h3 className="text-sm font-extrabold text-brand-darkGray font-display uppercase tracking-wider">Good to know</h3>
                    {[
                        'Delivery fees are always confirmed before you pay; no surprises at the door.',
                        'If you\'re in Lagos and prefer to collect your order, that\'s available. Let us know when ordering.',
                        'For large or heavy bulk orders, we\'ll advise the best shipping option before confirming.',
                        'Always inspect your order on delivery. Report any issues within 24 hours via WhatsApp with photos.',
                    ].map(note => (
                        <div key={note} className="flex gap-3 items-start">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-orange mt-2 shrink-0" />
                            <p className="text-sm text-brand-darkGray/70 leading-relaxed">{note}</p>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="bg-white border border-orange-100 rounded-2xl px-6 py-7 text-center shadow-sm">
                    <h3 className="text-base font-extrabold text-brand-darkGray font-display mb-2">Questions about your delivery?</h3>
                    <p className="text-sm text-brand-darkGray/60 mb-5">Send us a WhatsApp message and we'll sort it out quickly.</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        {WHATSAPP_URL && (
                            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer"
                                className="w-full sm:w-auto text-center bg-brand-orange hover:bg-brand-brown text-white font-extrabold px-8 py-3 rounded-2xl transition-all active:scale-95 text-sm font-display uppercase tracking-wide">
                                Chat on WhatsApp
                            </a>
                        )}
                        <Link to="/catalog"
                            className="w-full sm:w-auto text-center bg-white hover:bg-orange-50 text-brand-darkGray border border-orange-100 font-extrabold px-8 py-3 rounded-2xl transition-all text-sm font-display uppercase tracking-wide">
                            Browse the Vault
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    )
}