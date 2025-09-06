// MainApp.tsx (only the relevant parts)
import { useState } from 'react'
import Messages from './chat/MessagesTab'
import RequestsTab from './tabs/RequestsTab'
import SearchTab from './tabs/SearchTab'

import './ui/reset.css'
import './ui/tabs.css'

export default function MainApp() {
  const [tab, setTab] = useState<'search'|'messages'|'history'|'myrequests'>('search')
  const [user, setUser] = useState<{ id: string; pwd: boolean }>({
    id: '00000000-0000-0000-0000-000000000001',
    pwd: true, // true = beneficiary, false = volunteer
  })
  const [preopenThreadId, setPreopenThreadId] = useState<string|null>(null)
  const [rerenderKey, setRerenderKey] = useState(0)

  function openMessagesWith(requestId: string) {
    setPreopenThreadId(requestId)
    setTab('messages')
  }

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
            isVolunteer={!user.pwd}
            onAccepted={openMessagesWith}
          />
        )}

        {tab === 'messages' && (
          <Messages
            key={rerenderKey}
            user={user}
            preopenThreadId={preopenThreadId}
            ui="light-mobile"
            onOpenThread={setPreopenThreadId}
            onCloseThread={() => setPreopenThreadId(null)}
          />
        )}

        {tab === 'myrequests' && (
          user.pwd
            ? <RequestsTab />
            : <div style={{ color:'#ef4444', textAlign:'center', padding:'40px 0' }}>
                You’re not eligible to create requests
              </div>
        )}

        {tab === 'history' && (
          <div style={{ color:'#6B7280', textAlign:'center', padding:'40px 0' }}>
            History coming soon…
          </div>
        )}
      </main>
    </div>
  )
}
