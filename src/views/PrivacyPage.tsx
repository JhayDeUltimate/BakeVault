import React from 'react'
import { Helmet } from 'react-helmet-async'
import SectionHeading from '@/components/ui/SectionHeading'
import { WHATSAPP_URL } from '@/constants'
import { useSettings } from '@/hooks'

export default function PrivacyPage() {
    const { settings } = useSettings()
    const email = settings.contact_email || 'sales@bakevault.com.ng'

    const sections = [
        {
            title: '1. What We Collect',
            body: `When you interact with BakeVault Lagos, we may collect the following:

Name and contact information (phone number, email, WhatsApp number) provided voluntarily when you place an order or submit a product request.

Order details including items, quantities, and delivery address.

Usage data collected automatically when you browse our website, including pages visited, products viewed, and items added to your order. This is used solely to improve the site experience and is not shared with third parties for advertising.`,
        },
        {
            title: '2. How We Use Your Information',
            body: `We use your information to process and fulfil your orders, communicate with you about your orders and enquiries, notify you about restocks or products you've requested, and improve our catalog and website based on usage patterns.

We do not sell your personal data to third parties. We do not use your information for advertising purposes.`,
        },
        {
            title: '3. WhatsApp Communications',
            body: `When you contact us via WhatsApp, your messages are subject to WhatsApp's own privacy policy. We use WhatsApp solely to communicate with you about your orders and enquiries. We do not add customers to broadcast lists without consent.`,
        },
        {
            title: '4. Data Storage',
            body: `Order data and enquiry records are stored securely using Supabase, a cloud database provider. We take reasonable steps to protect your data but cannot guarantee absolute security of information transmitted over the internet.`,
        },
        {
            title: '5. Your Rights',
            body: `You may request to view, correct, or delete the personal information we hold about you at any time by contacting us via WhatsApp or email at ${email}. We will respond within 5 business days.`,
        },
        {
            title: '6. Cookies',
            body: `Our website does not use advertising or tracking cookies. We use minimal functional storage (localStorage) to remember your cart items between sessions. No personal data is stored in cookies.`,
        },
        {
            title: '7. Changes to This Policy',
            body: `We may update this policy from time to time. The current version will always be available on this page. The date at the top of this page reflects when it was last updated.`,
        },
        {
            title: '8. Contact',
            body: `For privacy-related questions or data requests, contact us at ${email} or via WhatsApp.`,
        },
    ]

    return (
        <main className="flex-grow">
            <Helmet>
                <link rel="canonical" href="https://bakevault.com.ng/privacy" />
            </Helmet>
            <section className="bg-white border-b border-orange-100 px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                <div className="max-w-3xl mx-auto text-center">
                    <SectionHeading
                        eyebrow="Legal"
                        title="Privacy Policy"
                        description={settings.privacy_last_updated ? `Last updated: ${settings.privacy_last_updated}` : 'Last updated: May 2026'}
                    />
                </div>
            </section>

            <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="bg-white border border-orange-100 rounded-2xl shadow-sm divide-y divide-orange-50">
                    {sections.map(s => (
                        <div key={s.title} className="px-6 sm:px-8 py-6">
                            <h2 className="text-sm font-extrabold text-brand-darkGray font-display uppercase tracking-wider mb-3">
                                {s.title}
                            </h2>
                            {s.body.split('\n\n').map((para, i) => (
                                <p key={i} className="text-sm text-brand-darkGray/70 leading-relaxed mb-3 last:mb-0">
                                    {para}
                                </p>
                            ))}
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center">
                    {WHATSAPP_URL && (
                        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-2 bg-brand-orange hover:bg-brand-brown text-white font-bold px-6 py-3 rounded-2xl transition-all text-sm">
                            Questions? Chat on WhatsApp
                        </a>
                    )}
                </div>
            </section>
        </main>
    )
}