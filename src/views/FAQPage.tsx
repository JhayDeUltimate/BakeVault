import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import SectionHeading from '@/components/ui/SectionHeading'
import { WHATSAPP_URL } from '@/constants'

interface FAQItem {
    question: string
    answer: string
}

interface FAQCategory {
    title: string
    icon: string
    items: FAQItem[]
}

const FAQ_DATA: FAQCategory[] = [
    {
        title: 'Ordering & Payment',
        icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
        items: [
            {
                question: 'How do I place an order?',
                answer:
                    'Browse the catalog, add the items you want to your order, then tap "Request a Quote on WhatsApp." We\'ll send you a price breakdown, confirm availability, and process your order from there. The whole thing usually takes a few minutes.',
            },
            {
                question: 'Do you sell wholesale or retail?',
                answer:
                    'Both. If you\'re a bakery or buy in bulk, you\'ll get wholesale pricing on orders above ₦50,000. For smaller quantities, our standard retail rates apply. Either way, you\'re getting the same quality products — just let us know what you need when you reach out.',
            },
            {
                question: 'What is the minimum order amount?',
                answer:
                    'There is no strict minimum for retail orders. For wholesale pricing to apply, your order needs to be above ₦50,000. If you\'re not sure which applies to you, just send us what you need and we\'ll work it out.',
            },
            {
                question: 'How do I pay?',
                answer:
                    'We accept bank transfers. Once your order is confirmed via WhatsApp, we\'ll send you our account details. We don\'t process payment until you\'ve seen and confirmed the final price — no surprises.',
            },
            {
                question: 'Can I pick up my order instead of getting it delivered?',
                answer:
                    'Yes. If you\'re in Lagos and prefer to collect, we can arrange that. Let us know when you\'re ordering and we\'ll confirm a pickup time. It\'s a good option if you\'re in a hurry and you\'re close to us.',
            },
        ],
    },
    {
        title: 'Delivery',
        icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0',
        items: [
            {
                question: 'Do you deliver the same day?',
                answer:
                    'Yes, for Lagos orders placed and confirmed before 2PM. Order in the morning, bake in the afternoon. If you\'re cutting it close, send us a message and we\'ll tell you honestly whether it\'s possible.',
            },
            {
                question: 'What is the delivery fee?',
                answer:
                    'Lagos delivery ranges from ₦1,500 to ₦10,000 depending on your location within the city. For nationwide shipping, we calculate the fee based on courier rates and the weight of your order. We\'ll quote you the exact amount before you confirm — nothing hidden.',
            },
            {
                question: 'Do you deliver outside Lagos?',
                answer:
                    'Yes. We ship nationwide through reliable courier partners. Delivery timelines outside Lagos are typically 1 to 3 business days depending on your state.',
            },
            {
                question: 'How long does delivery take?',
                answer:
                    'Same day for Lagos orders before 2PM. For orders after 2PM, delivery is the next business day. Nationwide orders take 1 to 3 business days. We\'ll always give you an estimated time when your order is confirmed.',
            },
        ],
    },
    {
        title: 'Products',
        icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
        items: [
            {
                question: 'What products do you stock?',
                answer:
                    'We carry a wide range of premium baking ingredients: milk flavourings and essences, yogurt and dairy starters, margarine and spreads, baking powder and improvers, food colours, syrups and toppings, preservatives and additives, and specialty ingredients. Browse the full catalog on the site — if you don\'t see what you need, request it and we\'ll look into sourcing it.',
            },
            {
                question: 'Are your products authentic and original?',
                answer:
                    'Yes. We source directly from verified manufacturers and trusted distributors. Every product we stock meets our quality standards before it gets to you. If something ever falls short, we want to know — that\'s what the 24-hour issue window is for.',
            },
            {
                question: 'What if I need a product that\'s not on the website?',
                answer:
                    'Use the "Request a Product" form on the catalog page. Tell us the product name, size, and how much you need. We source on request for both retail and bulk quantities and will update you once we\'ve looked into it.',
            },
            {
                question: 'I\'m not sure which product is right for my recipe. Can you help?',
                answer:
                    'Yes. Each product page has an AI assistant that can answer specific usage questions — dosage, substitutes, what it works best for. For more detailed advice, send us a WhatsApp message and our team will give you a direct answer. We know our products well.',
            },
            {
                question: 'Do you sell to home bakers or only professional bakeries?',
                answer:
                    'Both. Whether you\'re making one celebration cake or running a high-volume production kitchen, you\'re welcome here. We adjust pricing based on quantity, not on who you are.',
            },
        ],
    },
    {
        title: 'Returns & Refunds',
        icon: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6',
        items: [
            {
                question: 'What is your refund policy?',
                answer:
                    'If your order arrives damaged, defective, or incorrect, we\'ll replace or refund it — no argument. You need to report it within 24 hours of delivery with clear photos via WhatsApp. For change-of-mind cancellations after an order is confirmed and dispatched, we don\'t offer refunds, so please check your order carefully before confirming. Opened or used products cannot be returned.',
            },
            {
                question: 'How long does a refund take to process?',
                answer:
                    'Once we\'ve confirmed the issue, refunds are processed within 3 to 5 business days via bank transfer to the account you paid from.',
            },
            {
                question: 'What should I do if my order arrives with a problem?',
                answer:
                    'The moment you notice something wrong. Either wrong item, damaged packaging, missing product. Please take clear photos and send them to us on WhatsApp straight away. Don\'t wait. The 24-hour window starts from when your order is delivered. The faster you report it, the faster we fix it.',
            },
        ],
    },
]

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

function FAQItem({ item }: { item: FAQItem }) {
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
    return (
        <main className="flex-grow">
            {/* Hero */}
            <section className="bg-white border-b border-orange-100 px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                <div className="max-w-3xl mx-auto text-center">
                    <SectionHeading
                        eyebrow="FAQ"
                        title="Questions bakers usually ask"
                        description="Everything you need to know before placing your first order — or your hundredth."
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
                {FAQ_DATA.map(category => (
                    <div key={category.title}>
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
                                <FAQItem key={item.question} item={item} />
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