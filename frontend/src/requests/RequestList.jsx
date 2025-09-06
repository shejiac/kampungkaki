// src/requests/RequestList.jsx
export default function RequestList({ embed = false, onCreate }) {
  // ...your existing hooks/fetch logic...

  return (
    <div className="list-wrap">
      {/* Hide header when embedded inside RequestsTab */}
      {!embed && (
        <div className="list-head" style={{ display:'flex', alignItems:'center', gap:12 }}>
          <h3 style={{ margin:0, flex:1 }}>My Requests</h3>
          <button className="btn primary" onClick={onCreate}>Create request</button>
        </div>
      )}

      {/* ...the rest of your list UI... */}
    </div>
  )
}
