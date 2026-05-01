// src/hooks/useSettings.ts
import { useEffect, useState } from 'react'
import { getSettings } from '@/lib/api'

interface SiteSettings {
    whatsapp_number: string
    instagram_handle: string
    contact_email: string
}

const DEFAULT: SiteSettings = {
    whatsapp_number: '',
    instagram_handle: '',
    contact_email: '',
}

export function useSettings() {
    const [settings, setSettings] = useState<SiteSettings>(DEFAULT)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        getSettings()
            .then(raw => {
                if (!cancelled) {
                    setSettings({
                        whatsapp_number: raw['whatsapp_number'] ?? '',
                        instagram_handle: raw['instagram_handle'] ?? '',
                        contact_email: raw['contact_email'] ?? '',
                    })
                }
            })
            .catch(() => { /* fall back to defaults silently */ })
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [])

    return { settings, loading }
}