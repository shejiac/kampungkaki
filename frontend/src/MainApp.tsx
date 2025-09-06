// src/MainApp.tsx
import { useEffect, useState } from 'react'
import { API } from './api'
import Messages from './chat/MessagesTab'
import RequestsTab from './tabs/RequestsTab'
import SearchTab from './tabs/SearchTab'
import HistoryTab from './tabs/HistoryTab' 

import './ui/reset.css'
import './ui/tabs.css'

type User = {
  id: string
  pwd: boolean        // beneficiary (can create requests)
  volunteer: boolean  // volunteer (can accept “I’ll Help!”)
}

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001' // seeded user you’ve been using

export default function MainApp() {
  const [tab, setTab] = useState<'search'|'messages'|'history'|'myrequests'>('search')
  const [user, setUser] = useState<User>(() => {
    // restore from localStorage if available (nice for teammates)
    const saved = localStorage.getItem('kk_user')
    if (saved) {
      try { return JSON.parse(saved) as User } catch {}
    }
    return { id: DEMO_USER_ID, pwd: true, volunteer: true }
  })
  const [preopenThreadId, setPreopenThreadId] = useState<string|null>(null)
  const [rerenderKey, setRerenderKey] = useState(0)

  // persist dev user locally so teammates don’t need to type anything
  useEffect(() => { localStorage.setItem('kk_user', JSON.stringify(user)) }, [user])

  // ---- live stats for the animated row ----
  const [stats, setStats] = useState({ volunteers: 0, requests: 0, helped: 0 })
  useEffect(() => {
    let alive = true
    async function load() {
      try {
        const r = await fetch(`${API}/api/stats`)
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const d = await r.json()
        if (alive) setStats({
          volunteers: Number(d?.volunteers) || 0,
          requests:   Number(d?.requests)   || 0,
          helped:     Number(d?.helped)     || 0,
        })
      } catch {}
    }
    load()
    const t = setInterval(load, 30000)
    return () => { alive = false; clearInterval(t) }
  }, [])

  function openMessagesWith(requestId: string) {
    setPreopenThreadId(requestId)
    setTab('messages')
  }

  const isMessages = tab === 'messages'

  return (
    <div className="kk-root">
      {/* Header (light) */}
      <header style={{ padding: '16px 16px 8px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:48, height:48, borderRadius:'50%', background:'#EEF2FF', display:'grid', placeItems:'center', color:'#3B82F6', fontWeight:600 }}>
            <span style={{ fontSize:22 }}>👤</span>
          </div>
          <div style={{ color:'#1D4ED8', fontWeight:700, fontSize:18 }}>KampungKaki</div>
        </div>
      </header>

      {/* Animated stats row (light, clean) */}
      <AnimatedStatsRow
        hidden={isMessages}
        volunteers={stats.volunteers}
        requests={stats.requests}
        helped={stats.helped}
      />

      {/* Tabs (CLEAN underline) */}
      <nav className="kk-tabs">
        <button
          className={`kk-tab ${tab==='myrequests' ? 'kk-tab--active' : user.pwd ? '' : 'kk-tab--muted'}`}
          onClick={() => setTab('myrequests')}
          aria-disabled={!user.pwd && tab!=='myrequests'}
          title={!user.pwd ? 'Only beneficiaries can create requests' : undefined}
        >
          My Requests
        </button>
        <button
          className={`kk-tab ${tab==='search' ? 'kk-tab--active' : ''}`}
          onClick={() => setTab('search')}
        >
          Search
        </button>
        <button
          className={`kk-tab ${tab==='messages' ? 'kk-tab--active' : ''}`}
          onClick={() => setTab('messages')}
        >
          Messages
        </button>
        <button
          className={`kk-tab ${tab==='history' ? 'kk-tab--active' : ''}`}
          onClick={() => setTab('history')}
        >
          History
        </button>
      </nav>

      {/* Content */}
      <main className="kk-phone-pad">
        {tab === 'search' && (
          <SearchTab
            userId={user.id}
            isVolunteer={user.volunteer}  // ONLY volunteers see “I’ll Help!”
            onAccepted={openMessagesWith}
          />
        )}

        {tab === 'messages' && (
          <Messages
            key={rerenderKey}
            user={{ id: user.id, pwd: user.pwd }} // Messages only needs id + pwd
            preopenThreadId={preopenThreadId}
            ui="light-mobile"
            onOpenThread={setPreopenThreadId}
            onCloseThread={() => setPreopenThreadId(null)}
          />
        )}

        {tab === 'myrequests' && (
          user.pwd
            ? <RequestsTab requesterId={user.id} />
            : <div style={{ color:'#ef4444', textAlign:'center', padding:'40px 0' }}>
                You’re not eligible to create requests
              </div>
        )}

        {tab === 'history' && (
          <HistoryTab userId={user.id} />
        )}
      </main>

      {/* Dev controls (compact) */}
      <details style={{ margin:'16px 0', padding:'8px 12px' }}>
        <summary style={{ cursor:'pointer', color:'#6B7280' }}>Dev controls</summary>
        <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginTop:8 }}>
          <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#6b7280' }}>
            Beneficiary (can request)
            <input type="checkbox" checked={user.pwd} onChange={e => setUser(u => ({ ...u, pwd: e.target.checked }))} />
          </label>
          <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#6b7280' }}>
            Volunteer (can help)
            <input type="checkbox" checked={user.volunteer} onChange={e => setUser(u => ({ ...u, volunteer: e.target.checked }))} />
          </label>
          <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#6b7280' }}>
            User ID
            <input
              value={user.id}
              onChange={e => setUser(u => ({ ...u, id: e.target.value }))}
              style={{ fontSize:12, padding:'4px 6px', borderRadius:8, border:'1px solid #e5e7eb', width:320 }}
              title="Change current user id"
            />
          </label>
        </div>
      </details>
    </div>
  )
}

/** ---------- UI bits ---------- **/
function AnimatedStatsRow({
  hidden, volunteers, requests, helped
}:{ hidden:boolean; volunteers:number; requests:number; helped:number }) {
  return (
    <div
      style={{
        overflow:'hidden',
        transition:'max-height 240ms ease, opacity 240ms ease, transform 240ms ease, padding 240ms ease',
        maxHeight:hidden ? 0 : 80,
        opacity:hidden ? 0 : 1,
        transform:hidden ? 'translateY(-4px)' : 'translateY(0)',
        padding: hidden ? '0 16px' : '8px 16px 4px 16px',
      }}
    >
      <div style={{ display:'flex', gap:12 }}>
        <Stat label="Volunteers" value={volunteers}/>
        <Stat label="Requests" value={requests}/>
        <Stat label="Helped" value={helped}/>
      </div>
    </div>
  )
}

function Stat({label, value}:{label:string; value:number}) {
  return (
    <div style={{
      flex:1, background:'#F9FAFB', border:'1px solid #E5E7EB', borderRadius:16,
      padding:'12px 8px', textAlign:'center'
    }}>
      <div style={{ fontSize:22, fontWeight:700 }}>{value}</div>
      <div style={{ fontSize:12, color:'#6B7280' }}>{label}</div>
    </div>
  )
}
