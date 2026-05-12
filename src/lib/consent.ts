export const CONSENT_KEY = 'bakevault:cookie_consent'

export function getConsent(): boolean | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY)
    if (v === '1') return true
    if (v === '0') return false
    return null
  } catch {
    return null
  }
}

export function hasConsent(): boolean {
  return getConsent() === true
}

export function setConsent(value: boolean): void {
  try {
    localStorage.setItem(CONSENT_KEY, value ? '1' : '0')
    try { window.dispatchEvent(new Event('bakevault:consent_change')) } catch {}
  } catch {}
}

export function clearConsent(): void {
  try {
    localStorage.removeItem(CONSENT_KEY)
    try { window.dispatchEvent(new Event('bakevault:consent_change')) } catch {}
  } catch {}
}
