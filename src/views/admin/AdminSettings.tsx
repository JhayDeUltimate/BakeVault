// ─────────────────────────────────────────────────────────────────────────────
// pages/admin/AdminSettings.tsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react'
import { getSettings, upsertSetting } from '@/lib/api'

export function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  useEffect(() => {
    getSettings().then(setSettings).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSaving(true); setError(null)
      await Promise.all(Object.entries(settings).map(([k, v]) => upsertSetting(k, v)))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) { setError(err instanceof Error ? err.message : 'Save failed') }
    finally { setSaving(false) }
  }

  const fields = [
    { key: 'whatsapp_number', label: 'WhatsApp Number',    placeholder: '2349064652679', hint: 'Country code included, no + or spaces' },
    { key: 'instagram_handle', label: 'Instagram Handle', placeholder: 'bakevaultlagos', hint: 'Without the @' },
    { key: 'contact_email',   label: 'Contact Email',     placeholder: 'sales@bakevault.com.ng', hint: 'Shown in desktop footer' },
  ]

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        {error  && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">{error}</div>}
        {saved  && <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg mb-5">Settings saved ✓</div>}
        <form onSubmit={handleSave} className="space-y-5">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">{f.label}</label>
              <input
                type="text"
                value={settings[f.key] ?? ''}
                onChange={e => setSettings(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <p className="text-xs text-gray-400 mt-1">{f.hint}</p>
            </div>
          ))}
          <button type="submit" disabled={saving} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminSettings
