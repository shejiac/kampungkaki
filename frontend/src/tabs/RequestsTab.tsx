// src/tabs/RequestsTab.tsx
import { useState } from 'react'
import RequestList from '../requests/RequestList.jsx'
import RequestForm from '../requests/requestform.jsx'

export default function RequestsTab({
  requesterId,
  embed = true,
}: {
  requesterId: string
  embed?: boolean
}) {
  const [mode, setMode] = useState<'list' | 'form'>('list')

  return (
    <div>
      {/* Single header row with title + Create button */}
      {mode === 'list' && (
        <div style={{ display:'flex', alignItems:'center', gap:12, margin:'6px 0 16px' }}>
          <h2 style={{ fontSize:28, fontWeight:800, margin:0, flex:1 }}>My Requests</h2>
          <button className="btn primary" onClick={() => setMode('form')}>Create request</button>
        </div>
      )}

      {mode === 'list' ? (
        // Embedded list: no internal header, no extra create button
        <RequestList embed={true} onCreate={() => setMode('form')} />
      ) : (
        <RequestForm
          requesterId={requesterId}
          onSuccess={() => setMode('list')}
          onCancel={() => setMode('list')}
        />
      )}
    </div>
  )
}
