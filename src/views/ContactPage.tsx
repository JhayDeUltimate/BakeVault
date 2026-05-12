import React from 'react'
import SectionHeading from '@/components/ui/SectionHeading'
import { WHATSAPP_URL, WHATSAPP_DISPLAY_NUMBER } from '@/constants'
import { useSettings } from '@/hooks'

export default function ContactPage() {
    const { settings } = useSettings()
    const instagram = settings.instagram_handle || 'bakevaultlagos'
    const email = settings.contact_email || 'sales@bakevault.com.ng'
    const waNumber = settings.whatsapp_number || WHATSAPP_DISPLAY_NUMBER
    const waUrl = waNumber ? `https://wa.me/${waNumber.replace(/\D/g, '')}` : WHATSAPP_URL
    // Default hours used when no admin setting is present or parsing fails
    const DEFAULT_HOURS = [
        { day: 'Monday – Friday', hours: '8:00 AM – 6:00 PM' },
        { day: 'Saturday', hours: '9:00 AM – 4:00 PM' },
        { day: 'Sunday', hours: 'Closed' },
    ]

    function parseBusinessHours(raw?: string) {
        if (!raw) return DEFAULT_HOURS
        // Try JSON first
        try {
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed)) {
                return parsed.map((r: any) => ({ day: String(r.day ?? r.name ?? ''), hours: String(r.hours ?? r.time ?? '') }))
            }
        } catch {}
        // Fallback: newline-separated lines like "Monday – Friday: 8:00 AM – 6:00 PM"
        const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)
        if (lines.length > 0) {
            return lines.map(line => {
                const pipe = line.split('|')
                if (pipe.length >= 2) return { day: pipe[0].trim(), hours: pipe.slice(1).join('|').trim() }
                const parts = line.split(':')
                if (parts.length >= 2) return { day: parts[0].trim(), hours: parts.slice(1).join(':').trim() }
                return { day: line, hours: '' }
            })
        }
        return DEFAULT_HOURS
    }

    const businessHours = parseBusinessHours(settings.business_hours)

    return (
        <main className="flex-grow">
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
                        eyebrow="Contact"
                        title="We respond fast. Reach out any time."
                        description="For orders, product questions, or anything else — WhatsApp is the quickest way to get us."
                    />
                </div>
            </section>

            <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-5">

                {/* WhatsApp — primary */}
                {waUrl && (
                    <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-5 bg-green-50 border border-green-100 rounded-2xl p-6 hover:shadow-md transition-all group"
                    >
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.019-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-green-700 mb-0.5">WhatsApp — Fastest response</p>
                            <p className="text-base font-bold text-brand-darkGray">{waNumber || 'Message us on WhatsApp'}</p>
                            <p className="text-xs text-brand-darkGray/50 mt-0.5">We reply within 1 hour during business hours</p>
                        </div>
                        <svg className="w-5 h-5 text-green-400 ml-auto shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                )}

                {/* Instagram */}
                <a
                    href={`https://instagram.com/${instagram}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-5 bg-white border border-orange-100 rounded-2xl p-6 hover:shadow-md transition-all group"
                >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" />
                            <circle cx="12" cy="12" r="3.2" />
                            <circle cx="18.406" cy="5.594" r="1.44" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-purple-600 mb-0.5">Instagram</p>
                        <p className="text-base font-bold text-brand-darkGray">@{instagram}</p>
                        <p className="text-xs text-brand-darkGray/50 mt-0.5">Product updates, restocks and baker features</p>
                    </div>
                    <svg className="w-5 h-5 text-brand-darkGray/20 ml-auto shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                </a>

                {/* Email */}
                <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-5 bg-white border border-orange-100 rounded-2xl p-6 hover:shadow-md transition-all group"
                >
                    <div className="w-12 h-12 bg-brand-brown/10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <svg className="w-6 h-6 text-brand-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-brand-brown mb-0.5">Email</p>
                        <p className="text-base font-bold text-brand-darkGray">{email}</p>
                        <p className="text-xs text-brand-darkGray/50 mt-0.5">For formal enquiries and business correspondence</p>
                    </div>
                    <svg className="w-5 h-5 text-brand-darkGray/20 ml-auto shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                </a>

                {/* Business hours */}
                <div className="bg-brand-cream border border-orange-100 rounded-2xl p-6">
                    <h3 className="text-sm font-extrabold text-brand-darkGray font-display uppercase tracking-wider mb-4">
                        Business Hours
                    </h3>
                        <div className="space-y-2">
                            {businessHours.map(row => (
                                <div key={row.day} className="flex items-center justify-between text-sm">
                                    <span className="text-brand-darkGray/60 font-medium">{row.day}</span>
                                    <span className={`font-bold ${row.hours === 'Closed' ? 'text-red-400' : 'text-brand-darkGray'}`}>
                                        {row.hours}
                                    </span>
                                </div>
                            ))}
                    </div>
                    <p className="text-xs text-brand-darkGray/40 mt-4 leading-relaxed">
                        Outside business hours, send us a WhatsApp message — we'll respond first thing when we're back.
                    </p>
                </div>
            </section>
        </main>
    )
}