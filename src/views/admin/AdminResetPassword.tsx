import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import BrandLogo from '@/components/ui/BrandLogo'

export default function AdminResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [ready, setReady] = useState(false)   // true once Supabase confirms recovery session
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY when the hash fragment contains type=recovery
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }

    try {
      setSaving(true); setError(null)
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setDone(true)
      setTimeout(() => navigate('/admin/login', { replace: true }), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-dvh bg-gray-50 flex items-center justify-center px-4 py-8 overflow-x-hidden">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <BrandLogo iconClassName="h-10 w-auto" />
          <p className="text-sm text-gray-500 mt-2">Set a new password</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {done ? (
            <div className="text-center space-y-2">
              <p className="text-green-600 font-semibold">Password updated!</p>
              <p className="text-sm text-gray-400">Redirecting to login…</p>
            </div>
          ) : !ready ? (
            <div className="text-center text-sm text-gray-400 space-y-3">
              <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto" />
              <p>Verifying recovery link…</p>
              <p className="text-xs text-red-400">If this takes too long, your link may have expired. Request a new one.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">New Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    required minLength={8} placeholder="Min. 8 characters"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  <button type="button" onClick={() => setShowPassword(s => !s)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-orange-500 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Confirm Password</label>
                <div className="relative">
                  <input type={showConfirm ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)}
                    required placeholder="Repeat password"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  <button type="button" onClick={() => setShowConfirm(s => !s)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-orange-500 transition-colors"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                    {showConfirm ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={saving}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50">
                {saving ? 'Updating…' : 'Set New Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
