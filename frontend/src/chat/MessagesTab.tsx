import { useEffect, useState } from 'react'
import ChatRoom from './ChatRoom'

type User = { id: string; pwd: boolean }
type Thread = {
  id: string
  request?: { title?: string }
  lastPreview?: string
  lastMessageAt?: string | null
}

export default function Messages({
  user,
  preopenThreadId,
  onOpenThread,
  onCloseThread,
  ui = 'light-mobile',
  apiBase,
}: {
  user: User
  preopenThreadId?: string | null
  onOpenThread?: (id: string) => void
  onCloseThread?: () => void
  ui?: 'light-mobile' | 'dark'
  apiBase?: string
}) {
  const [threads, setThreads] = useState<Thread[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const API = apiBase || (import.meta as any).env?.VITE_API_ORIGIN || 'http://localhost:5000'

  useEffect(() => {
    if (preopenThreadId) {
      setSelected(preopenThreadId)
      onOpenThread?.(preopenThreadId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preopenThreadId])

  async function load() {
    setLoading(true); setErr(null)
    try {
      const r = await fetch(`${API}/api/threads`, { headers: { 'X-User-Id': user.id } })
      const d = await r.json()
      setThreads(Array.isArray(d) ? d : (d.threads || []))
    } catch (e: any) {
      setErr(e?.message || 'Failed to load threads')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [user.id])

  // LIGHT MOBILE (single column, slide)
  const showChat = !!selected

  return (
    <div style={{ position:'relative', overflow:'hidden' }}>
      {/* List view */}
      <div
        style={{
          transition:'transform 220ms ease',
          transform: showChat ? 'translateX(-110%)' : 'translateX(0)',
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 700, margin: 0, flex: 1 }}>My Messages</div>

        {loading && <div style={{ color:'#6B7280' }}>Loading…</div>}
        {err && <div style={{ color:'#ef4444' }}>{err}</div>}
        {!loading && !err && threads.length === 0 && (
          <div style={{ color:'#6B7280' }}>No conversations yet</div>
        )}

        <div style={{ display:'grid', gap:8 }}>
          {threads.map(t => (
            <button
              key={t.id}
              onClick={() => { setSelected(t.id); onOpenThread?.(t.id) }}
              style={{
                textAlign:'left',
                padding:12,
                borderRadius:12,
                border:'1px solid #E5E7EB',
                background:'#FFFFFF',
                color:'#111827',
                cursor:'pointer'
              }}
            >
              <div style={{ fontWeight:700, marginBottom:4 }}>
                {t.request?.title || 'Request'}
              </div>
              <div style={{ fontSize:12, color:'#6B7280', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {t.lastPreview || 'No messages yet'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat view */}
      <div
        style={{
          position:'absolute',
          inset:0,
          transition:'transform 220ms ease',
          transform: showChat ? 'translateX(0)' : 'translateX(110%)',
          background:'#fff', borderRadius:12, border:'1px solid #E5E7EB',
          padding:12
        }}
      >
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 0 8px 0' }}>
          <button
            onClick={() => { setSelected(null); onCloseThread?.() }}
            style={{ padding:'6px 10px', border:'1px solid #E5E7EB', borderRadius:8, background:'#fff', color:'#111827', cursor:'pointer' }}
          >
            ← Back
          </button>
          <div style={{ fontWeight:700, color:'#6B7280' }}>Conversation</div>
        </div>

        {selected && (
          <ChatRoom
            threadId={selected}
            user={user}
            ui="light-mobile"
            apiBase={API}
          />
        )}
      </div>
    </div>
  )
}
