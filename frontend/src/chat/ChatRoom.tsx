import { useEffect, useRef, useState } from 'react'

type User = { id: string; pwd: boolean }
type Msg = {
  id: string
  sender_id: string | null
  body: string
  kind: 'user'|'system'
  created_at: string
}

export default function ChatRoom({
  apiBase,
  user,
  threadId,
  ui = 'light-mobile',
}: {
  apiBase?: string
  user: User
  threadId: string | null
  ui?: 'light-mobile' | 'dark'
}) {
  const API = apiBase || (import.meta as any).env?.VITE_API_ORIGIN || 'http://localhost:5000'
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!threadId) return
    ;(async () => {
      setLoading(true)
      try {
        const r = await fetch(`${API}/api/threads/${threadId}`, { headers: { 'X-User-Id': user.id } })
        const d = await r.json()
        setMessages(d.messages || [])
      } catch {
        // ignore
      } finally {
        setLoading(false)
        setTimeout(() => scroller.current?.scrollTo(0, 999999), 0)
      }
    })()
  }, [threadId, user.id])

  async function send() {
    const body = input.trim()
    if (!body || !threadId) return
    setInput('')
    // optimistically render
    const optimistic: Msg = {
      id: crypto.randomUUID(),
      sender_id: user.id,
      body,
      kind: 'user',
      created_at: new Date().toISOString(),
    }
    setMessages(m => [...m, optimistic])
    setTimeout(() => scroller.current?.scrollTo(0, 999999), 0)

    await fetch(`${API}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Id': user.id },
      body: JSON.stringify({ threadId, body }),
    }).catch(() => {})
  }

  // light palette
  const border = '#E5E7EB'
  const mineBg = '#DBEAFE'   // blue-100
  const mineText = '#1E3A8A' // blue-900
  const otherBg = '#F3F4F6'  // gray-100
  const otherText = '#111827'

  return (
    <div style={{ background:'#fff', color:'#111827', display:'flex', flexDirection:'column', height:'60vh' }}>
      <div ref={scroller} style={{ flex:1, overflowY:'auto', padding:'8px 4px' }}>
        {loading && <div style={{ color:'#6B7280' }}>Loading…</div>}
        {messages.map(m => {
          const mine = m.sender_id === user.id
          return (
            <div key={m.id} style={{ display:'flex', justifyContent: mine ? 'flex-end' : 'flex-start', padding:'4px 0' }}>
              <div
                style={{
                  maxWidth: '80%',
                  background: mine ? mineBg : otherBg,
                  color: mine ? mineText : otherText,
                  border: `1px solid ${border}`,
                  borderRadius: 12,
                  padding: '8px 10px',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {m.body}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display:'flex', gap:8, borderTop:`1px solid ${border}`, paddingTop:8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') send() }}
          placeholder="Type a message…"
          style={{
            flex:1,
            padding:'10px 12px',
            border:`1px solid ${border}`,
            borderRadius:8,
            background:'#fff',
            color:'#111827'
          }}
        />
        <button
          onClick={send}
          style={{
            padding:'10px 14px',
            borderRadius:8,
            border:`1px solid ${border}`,
            background:'#2563EB', color:'#fff',
            fontWeight:700, cursor:'pointer'
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}
