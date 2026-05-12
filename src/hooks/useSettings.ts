// src/hooks/useSettings.ts
import { useEffect, useState, useContext } from 'react'
import { getSettings } from '@/lib/api'
import SettingsContext, { SettingsMap } from '@/lib/settings-context'

interface SiteSettings {
    whatsapp_number: string
    instagram_handle: string
    contact_email: string
    // Optional admin-controlled fields
    business_hours?: string
    terms_last_updated?: string
    privacy_last_updated?: string
}

const DEFAULT: SiteSettings = {
    whatsapp_number: '',
    instagram_handle: '',
    contact_email: '',
    business_hours: '',
    terms_last_updated: '',
    privacy_last_updated: '',
}

function mapRaw(raw: SettingsMap | null | undefined): SiteSettings {
    return {
        whatsapp_number: raw?.['whatsapp_number'] ?? '',
        instagram_handle: raw?.['instagram_handle'] ?? '',
        contact_email: raw?.['contact_email'] ?? '',
        business_hours: raw?.['business_hours'] ?? '',
        terms_last_updated: raw?.['terms_last_updated'] ?? '',
        privacy_last_updated: raw?.['privacy_last_updated'] ?? '',
    }
}

export function useSettings() {
    // If a SettingsContext is present (provided by PublicLayout), use it and avoid refetching.
    const ctx = useContext(SettingsContext)
    if (ctx) {
        return { settings: mapRaw(ctx.settings), loading: ctx.loading }
    }

    const [settings, setSettings] = useState<SiteSettings>(DEFAULT)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        getSettings()
            .then(raw => {
                if (!cancelled) {
                    setSettings(mapRaw(raw))
                }
            })
            .catch(() => { /* fall back to defaults silently */ })
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [])

    return { settings, loading }
}