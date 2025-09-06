import { useEffect, useRef, useState } from 'react'
import { API as BASE } from '../api'   // e.g. http://localhost:5000

type User = { id: string; pwd: boolean }
type Msg = {
  id: string
  sender_id: string | null
  body: string
  kind: 'user' | 'system'
  created_at: string
}

export default function ChatRoom({
  apiBase,
  user,
  threadId,                     // NOTE: this is the request_id (your BE maps -> chat_id)
  ui = 'light-mobile',
}: {
  apiBase?: string
  user: User
  threadId: string | null
  ui?: 'light-mobile' | 'dark'
}) {
  const baseUrl = apiBase || BASE            // final base, e.g. http://localhost:5000
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)

  // fetch messages for this request_id
  useEffect(() => {
    if (!threadId) return
    let alive = true
    ;(async () => {
      setLoading(true)
      try {
        const r = await fetch(`${baseUrl}/api/threads/${threadId}`, {
          headers: { 'X-User-Id': user.id },
        })
        const d = await r.json()
        if (alive) setMessages(d.messages || [])
      } catch {
        // ignore
      } finally {
        setLoading(false)
        setTimeout(() => scroller.current?.scrollTo(0, 9e9), 0)
      }
    })()
    return () => { alive = false }
  }, [threadId, user.id, baseUrl])

  async function send() {
    const body = input.trim()
    if (!body || !threadId) return
    setInput('')

    // optimistic bubble
    const optimistic: Msg = {
      id: (crypto as any).randomUUID?.() ?? String(Math.random()),
      sender_id: user.id,
      body,
      kind: 'user',
      created_at: new Date().toISOString(),
    }
    setMessages(m => [...m, optimistic])
    setTimeout(() => scroller.current?.scrollTo(0, 9e9), 0)

    try {
      await fetch(`${baseUrl}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': user.id },
        body: JSON.stringify({ threadId, body }),
      })
      // re-pull to get canonical message (ids, server time, any system replies)
      const r = await fetch(`${baseUrl}/api/threads/${threadId}`, {
        headers: { 'X-User-Id': user.id },
      })
      const d = await r.json()
      setMessages(d.messages || [])
      setTimeout(() => scroller.current?.scrollTo(0, 9e9), 0)
    } catch {
      /* keep optimistic; avoid UI crash */
    }
  }

  // light palette
  const border = '#E5E7EB'
  const mineBg = '#DBEAFE'   // blue-100
  const mineText = '#1E3A8A' // blue-900
  const otherBg = '#F3F4F6'  // gray-100
  const otherText = '#111827'
  const sysText = '#6B7280'

  return (
    <div style={{ background:'#fff', color:'#111827', display:'flex', flexDirection:'column', height:'60vh' }}>
      <div ref={scroller} style={{ flex:1, overflowY:'auto', padding:'8px 4px' }}>
        {loading && <div style={{ color:'#6B7280' }}>Loading…</div>}
        {messages.map(m => {
          if (m.kind === 'system') {
            return (
              <div key={m.id} style={{ display:'flex', justifyContent:'center', padding:'6px 0' }}>
                <div style={{ fontSize:12, color: sysText, textAlign:'center', maxWidth:'85%' }}>
                  {m.body}
                </div>
              </div>
            )
          }
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
