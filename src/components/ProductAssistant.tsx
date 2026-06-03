import React, { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Message { role: 'user' | 'assistant'; text: string }

interface Props {
  productName:        string
  productDescription: string
}

export default function ProductAssistant({ productName, productDescription }: Props) {
  const [open,     setOpen]     = useState(false)
  const [input,    setInput]    = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading,  setLoading]  = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    const userMsg: Message = { role: 'user', text }
    const next = [...messages, userMsg]
    setMessages(next)
    setLoading(true)

    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)

    try {
      const apiMessages = next.map(m => ({ role: m.role, content: m.text }))

      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          mode:           'chat',
          messages:       apiMessages,
          productContext: { name: productName, description: productDescription },
        },
      })

      // supabase-js throws on network failures but returns { data, error } for HTTP errors.
      // Our edge function always returns 200, so `error` here means a network/relay issue.
      if (error) {
        // Try to read the body — FunctionsHttpError has context
        let errMsg = 'Connection failed. Please check your internet and try again.'
        try {
          const body = await (error as { context?: Response }).context?.json?.()
          if (body?.error) errMsg = body.error
        } catch { /* ignore */ }
        setMessages(prev => [...prev, { role: 'assistant', text: errMsg }])
        return
      }

      // Our function always returns 200 — check for application-level error
      if (data?.error) {
        setMessages(prev => [...prev, { role: 'assistant', text: `⚠️ ${data.error}` }])
        return
      }

      const reply = data?.text ?? 'Sorry, I could not get a response. Please try again.'
      setMessages(prev => [...prev, { role: 'assistant', text: reply }])
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unexpected error'
      setMessages(prev => [...prev, { role: 'assistant', text: `Error: ${msg}` }])
    } finally {
      setLoading(false)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="border border-orange-100 rounded-2xl overflow-hidden">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-orange-50 hover:bg-orange-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-orange rounded-full flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"/>
            </svg>
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-brand-darkGray">Have a question about this product?</p>
            <p className="text-xs text-brand-darkGray/50">AI product guide · Powered by Gemini</p>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-brand-darkGray/40 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="flex flex-col bg-white" style={{ height: 320 }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-xs text-brand-darkGray/40">
                  What would you like to know about <strong className="text-brand-darkGray/70">{productName}</strong>?
                </p>
                <p className="text-xs text-brand-darkGray/30 mt-1">
                  e.g. "What's the recommended usage ratio per batch?" · "Is this suitable for vegan baking?"
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-brand-orange text-white rounded-br-sm'
                    : 'bg-orange-50 text-brand-darkGray rounded-bl-sm border border-orange-100'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-orange-50 border border-orange-100 px-3 py-2 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 bg-brand-orange/50 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-orange-100 flex flex-col bg-white">
            <div className="px-3 pt-2 pb-1 flex gap-2 flex-col">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value.slice(0, 500))}
                  onKeyDown={handleKey}
                  placeholder="Ask a question…"
                  disabled={loading}
                  maxLength={500}
                  className="flex-1 text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={loading || !input.trim()}
                  aria-label="Send"
                  className="w-8 h-8 bg-brand-orange hover:bg-brand-brown text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-40 shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              {input.length > 400 && (
                <p className="text-[10px] text-gray-400 text-right">{500 - input.length} characters remaining</p>
              )}
            </div>
            <p className="text-center text-xs text-brand-darkGray/60 pb-1.5 px-2">
              AI assistant — responses may be inaccurate. Always verify critical details.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
