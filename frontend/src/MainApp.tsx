// src/MainApp.tsx
import { useState } from 'react'
import Messages from './chat/MessagesTab'
import RequestsTab from './tabs/RequestsTab'
import SearchTab from './tabs/SearchTab'

import './ui/reset.css'
import './ui/tabs.css'

export default function MainApp() {
  // tabs
  const [tab, setTab] = useState<'search'|'messages'|'history'|'myrequests'>('search')

  // user: id + independent abilities (pwd = can request, volunteer = can help)
  const [user, setUser] = useState<{ id: string; pwd: boolean; volunteer: boolean }>({
    id: '00000000-0000-0000-0000-000000000001',
    pwd: true,          // beneficiary
    volunteer: true,    // can help (toggleable)
  })

  // messages open state
  const [preopenThreadId, setPreopenThreadId] = useState<string|null>(null)
  const [rerenderKey, setRerenderKey] = useState(0)

  function openMessagesWith(requestId: string) {
    setPreopenThreadId(requestId)
    setTab('messages')
  }

  const isMessages = tab === 'messages'

  return (
    <div className="kk-root" style={{ fontFamily:'system-ui', maxWidth:480, margin:'0 auto' }}>
      {/* Header */}
      <header style={{ padding:'16px 16px 8px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:48, height:48, borderRadius:'50%', background:'#EEF2FF',
                        display:'grid', placeItems:'center', color:'#3B82F6', fontWeight:600 }}>
            <span style={{ fontSize:22 }}>👤</span>
          </div>
          <div style={{ color:'#1D4ED8', fontWeight:700, fontSize:18 }}>KampungKaki</div>
        </div>
      </header>

      {/* Animated stats row */}
      <AnimatedStatsRow hidden={isMessages} />

      {/* Tabs */}
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
            isVolunteer={user.volunteer}         // <- only volunteers see “I’ll Help!”
            onAccepted={openMessagesWith}
          />
        )}

        {tab === 'messages' && (
          <Messages
            key={rerenderKey}
            user={{ id: user.id, pwd: user.pwd }}  // Messages only needs id + pwd
            preopenThreadId={preopenThreadId}
            ui="light-mobile"
            onOpenThread={setPreopenThreadId}
            onCloseThread={() => setPreopenThreadId(null)}
          />
        )}

        {tab === 'myrequests' && (
          user.pwd ? (
            <RequestsTab />                       // <- beneficiaries can create requests
          ) : (
            <div style={{ color:'#ef4444', textAlign:'center', padding:'40px 0' }}>
              You’re not eligible to create requests
            </div>
          )
        )}

        {tab === 'history' && (
          <div style={{ color:'#6B7280', textAlign:'center', padding:'40px 0' }}>
            History coming soon…
          </div>
        )}
      </main>

      {/* Footer controls: role toggles + user id input */}
      <footer style={{ display:'flex', flexWrap:'wrap', gap:10, justifyContent:'center',
                       padding:'8px 0 24px', borderTop:'1px solid #eef2ff' }}>
        <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#6b7280' }}>
          Beneficiary (can request):
          <input
            type="checkbox"
            checked={user.pwd}
            onChange={e => setUser(u => ({ ...u, pwd: e.target.checked }))}
            title="Toggle beneficiary ability"
          />
        </label>

        <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#6b7280' }}>
          Volunteer (can help):
          <input
            type="checkbox"
            checked={user.volunteer}
            onChange={e => setUser(u => ({ ...u, volunteer: e.target.checked }))}
            title="Toggle volunteer ability"
          />
        </label>

        <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#6b7280' }}>
          User ID:
          <input
            value={user.id}
            onChange={e => setUser(u => ({ ...u, id: e.target.value }))}
            style={{ fontSize:12, padding:'4px 6px', borderRadius:8, border:'1px solid #e5e7eb', width:260 }}
            title="Change current user id"
          />
        </label>
      </footer>
    </div>
  )
}

/** --------- tiny UI bits (unchanged style) ---------- */
function AnimatedStatsRow({ hidden }:{ hidden:boolean }) {
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
        <Stat label="Volunteers" value={0}/>
        <Stat label="Requests" value={0}/>
        <Stat label="Helped" value={0}/>
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
