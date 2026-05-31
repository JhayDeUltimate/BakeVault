import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SectionHeading from '@/components/ui/SectionHeading'
import { WHATSAPP_URL } from '@/constants'
import { getFAQs } from '@/lib/api'
import { FAQ_FALLBACK, type FAQCategoryData, type FAQItemData } from '@/lib/faq'

function ChevronIcon({ open }: { open: boolean }) {
    return (
        <svg
            className={`w-5 h-5 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''} text-brand-brown`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
    )
}

function FAQItem({ item }: { item: FAQItemData }) {
    const [open, setOpen] = useState(false)

    return (
        <div className="border-b border-orange-100 last:border-b-0">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-orange-50/50 transition-colors"
                aria-expanded={open}
            >
                <span className="text-sm font-bold text-brand-darkGray font-display">{item.question}</span>
                <ChevronIcon open={open} />
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <p className="px-5 pb-5 text-sm text-brand-darkGray/70 leading-relaxed font-medium">
                    {item.answer}
                </p>
            </div>
        </div>
    )
}

export default function FAQPage() {
    const [faqCategories, setFaqCategories] = useState<FAQCategoryData[]>(FAQ_FALLBACK)

    useEffect(() => {
        let cancelled = false

        getFAQs()
            .then(categories => {
                if (!cancelled && categories.length > 0) setFaqCategories(categories)
            })
            .catch(() => {
                if (!cancelled) setFaqCategories(FAQ_FALLBACK)
            })

        return () => { cancelled = true }
    }, [])

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
                        eyebrow="FAQ"
                        title="Questions bakers usually ask"
                        description="Everything you need to know before placing your first order, or your hundredth."
                    />
                    <p className="mt-6 text-sm text-brand-darkGray/50 font-medium">
                        Don't see your question?{' '}
                        {WHATSAPP_URL ? (
                            <a
                                href={WHATSAPP_URL}
                                target="_blank"
                                rel="noreferrer"
                                className="text-brand-orange font-bold hover:text-brand-brown transition-colors underline underline-offset-4"
                            >
                                Ask us on WhatsApp
                            </a>
                        ) : (
                            <span className="text-brand-orange font-bold">Send us a message on WhatsApp</span>
                        )}
                    </p>
                </div>
            </section>

            {/* FAQ Body */}
            <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
                {faqCategories.map(category => (
                    <div key={category.id ?? category.title}>
                        {/* Category heading */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 bg-brand-orange/10 rounded-xl flex items-center justify-center shrink-0">
                                <svg
                                    className="w-5 h-5 text-brand-orange"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d={category.icon}
                                    />
                                </svg>
                            </div>
                            <h2 className="text-base font-extrabold text-brand-darkGray font-display uppercase tracking-wider">
                                {category.title}
                            </h2>
                        </div>

                        {/* FAQ items */}
                        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
                            {category.items.map(item => (
                                <FAQItem key={item.id ?? item.question} item={item} />
                            ))}
                        </div>
                    </div>
                ))}

                {/* Still need help */}
                <div className="bg-brand-cream border border-orange-100 rounded-2xl px-6 py-8 text-center">
                    <h3 className="text-lg font-extrabold text-brand-darkGray font-display mb-2">
                        Still have a question?
                    </h3>
                    <p className="text-sm text-brand-darkGray/60 font-medium mb-5">
                        Our team responds within 1 hour during business hours. Send us a message and we'll sort
                        it out.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        {WHATSAPP_URL && (
                            <a
                                href={WHATSAPP_URL}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full sm:w-auto text-center bg-brand-orange hover:bg-brand-brown text-white font-extrabold px-8 py-3 rounded-2xl transition-all active:scale-95 text-sm font-display uppercase tracking-wide"
                            >
                                Chat on WhatsApp
                            </a>
                        )}
                        <Link
                            to="/catalog"
                            className="w-full sm:w-auto text-center bg-white hover:bg-orange-50 text-brand-darkGray border border-orange-100 font-extrabold px-8 py-3 rounded-2xl transition-all text-sm font-display uppercase tracking-wide"
                        >
                            Browse the Vault
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    )
}
