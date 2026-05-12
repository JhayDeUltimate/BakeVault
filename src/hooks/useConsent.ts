import { useEffect, useState } from 'react'
import { getConsent, setConsent as setConsentStorage } from '../lib/consent'

export default function useConsent() {
  const [consent, setConsentState] = useState<boolean | null>(() => {
    try {
      return getConsent()
    } catch {
      return null
    }
  })

  useEffect(() => {
    function handle() {
      setConsentState(getConsent())
    }
    window.addEventListener('bakevault:consent_change', handle)
    window.addEventListener('storage', handle)
    return () => {
      window.removeEventListener('bakevault:consent_change', handle)
      window.removeEventListener('storage', handle)
    }
  }, [])

  function accept() {
    setConsentStorage(true)
    setConsentState(true)
  }

  function decline() {
    setConsentStorage(false)
    setConsentState(false)
  }

  return { consent, accept, decline }
}
