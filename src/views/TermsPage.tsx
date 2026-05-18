import React from 'react'
import SectionHeading from '@/components/ui/SectionHeading'
import { WHATSAPP_URL } from '@/constants'
import { useSettings } from '@/hooks'

export default function TermsPage() {
    const { settings } = useSettings()
    const email = settings.contact_email || 'sales@bakevault.com.ng'

    const sections = [
        {
            title: '1. Placing an Order',
            body: `Orders are placed via our website catalog and confirmed through WhatsApp. Browsing the catalog and adding items to your order does not constitute a confirmed purchase. An order is only confirmed once you have received a price quote from us via WhatsApp and communicated your acceptance.

We reserve the right to decline any order at our discretion, including in cases of stock unavailability or pricing errors.`,
        },
        {
            title: '2. Pricing',
            body: `All prices are quoted in Nigerian Naira (₦). Prices are communicated per order via WhatsApp and are subject to change without notice on the catalog. The price confirmed at the time of your order confirmation is the price that applies to that order.

Wholesale pricing applies to orders above ₦50,000. Retail pricing applies to all other orders. Delivery fees are quoted separately and confirmed before payment.`,
        },
        {
            title: '3. Payment',
            body: `Payment is accepted via bank transfer only. Payment details are provided during the WhatsApp order confirmation process. We do not request payment before your order total, including delivery, has been confirmed and agreed.

Orders are processed after payment confirmation. We are not responsible for delays caused by incorrect payment details provided by the customer.`,
        },
        {
            title: '4. Delivery',
            body: `Same-day delivery within Lagos is available for orders confirmed and paid before 2:00 PM on business days. Delivery fees range from ₦1,500 to ₦10,000 within Lagos depending on location, and are calculated by weight and courier rates for nationwide orders.

Delivery times are estimates. We are not liable for delays caused by circumstances outside our control, including but not limited to traffic, courier issues, or public holidays.`,
        },
        {
            title: '5. Returns and Refunds',
            body: `We accept return and refund requests under the following conditions:

Damaged or defective products: Full refund or replacement within 24 hours of delivery. You must report the issue via WhatsApp with clear photographs as proof.

Wrong items received: Exchange arranged within 24 hours of delivery.

Change of mind: No refund once an order is confirmed and dispatched. Please verify all items before confirming your order.

Opened or used products: Not eligible for return or refund under any circumstances.

Approved refunds are processed within 3 to 5 business days via bank transfer to the account from which payment was made.`,
        },
        {
            title: '6. Product Quality',
            body: `All products sold by BakeVault Lagos are sourced from verified manufacturers and distributors. We do not knowingly sell counterfeit or substandard products. If you have a quality concern, contact us within 24 hours of delivery with photographs.`,
        },
        {
            title: '7. Limitation of Liability',
            body: `BakeVault Lagos is not liable for any indirect, incidental, or consequential damages arising from the use of our products, including but not limited to losses resulting from product misuse, recipe failures, or third-party ingredient interactions.

Our total liability for any claim arising from a transaction is limited to the value of the order in question.`,
        },
        {
            title: '8. Changes to These Terms',
            body: `We may update these terms from time to time. The current version will always be available on this page. Continued use of our services after changes constitutes acceptance of the updated terms.`,
        },
        {
            title: '9. Contact',
            body: `For questions about these terms, contact us via WhatsApp or email at ${email}.`,
        },
    ]

    return (
        <main className="flex-grow">
            <section className="bg-white border-b border-orange-100 px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                <div className="max-w-3xl mx-auto text-center">
                    <SectionHeading
                        eyebrow="Legal"
                        title="Terms & Conditions"
                        description={settings.terms_last_updated ? `Last updated: ${settings.terms_last_updated}` : 'Last updated: May 2026'}
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
                    <p className="text-xs text-brand-darkGray/40 mb-4">
                        Questions? We're easier to reach than our legal page suggests.
                    </p>
                    {WHATSAPP_URL && (
                        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-2 bg-brand-orange hover:bg-brand-brown text-white font-bold px-6 py-3 rounded-2xl transition-all text-sm">
                            Chat on WhatsApp
                        </a>
                    )}
                </div>
            </section>
        </main>
    )
}