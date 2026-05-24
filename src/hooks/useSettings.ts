import { useEffect, useState, useContext } from 'react'
import { getSettings } from '@/lib/api'
import SettingsContext, { SettingsMap } from '@/lib/settings-context'

interface SiteSettings {
  whatsapp_number:      string
  instagram_handle:     string
  contact_email:        string
  business_hours?:      string
  terms_last_updated?:  string
  privacy_last_updated?: string
}

const DEFAULT: SiteSettings = {
  whatsapp_number:      '',
  instagram_handle:     '',
  contact_email:        '',
  business_hours:       '',
  terms_last_updated:   '',
  privacy_last_updated: '',
}

function mapRaw(raw: SettingsMap | null | undefined): SiteSettings {
  return {
    whatsapp_number:      raw?.['whatsapp_number']      ?? '',
    instagram_handle:     raw?.['instagram_handle']     ?? '',
    contact_email:        raw?.['contact_email']        ?? '',
    business_hours:       raw?.['business_hours']       ?? '',
    terms_last_updated:   raw?.['terms_last_updated']   ?? '',
    privacy_last_updated: raw?.['privacy_last_updated'] ?? '',
  }
}

export function useSettings() {
  // Always call all hooks — never conditionally. Return value varies based on ctx.
  const ctx = useContext(SettingsContext)

  const [standaloneSettings, setStandaloneSettings] = useState<SiteSettings>(DEFAULT)
  const [standaloneLoading,  setStandaloneLoading]  = useState(true)

  useEffect(() => {
    // If a SettingsContext is available (PublicLayout provides it), skip standalone fetch.
    // ctx is checked inside the effect, not as a conditional hook call.
    if (ctx) return

    let cancelled = false
    getSettings()
      .then(raw => { if (!cancelled) setStandaloneSettings(mapRaw(raw)) })
      .catch(() => { /* fall back to defaults silently */ })
      .finally(() => { if (!cancelled) setStandaloneLoading(false) })

    return () => { cancelled = true }
  }, [ctx])

  // Context provided by PublicLayout — use it
  if (ctx) {
    return { settings: mapRaw(ctx.settings), loading: ctx.loading }
  }

  // No context — return standalone fetch result
  return { settings: standaloneSettings, loading: standaloneLoading }
}