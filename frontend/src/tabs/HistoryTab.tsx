// src/tabs/HistoryTab.tsx
import { useEffect, useState } from "react";
import { API } from "../api";

type Item = {
  id: string;
  title: string;
  description?: string;
  location?: string | null;
  endedAt?: string | null;
  role?: "beneficiary" | "volunteer" | "other";
};

export default function HistoryTab({ userId }:{ userId: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`${API}/api/history`, { headers: { "X-User-Id": userId } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      setItems(Array.isArray(d?.items) ? d.items : []);
    } catch (e:any) {
      setErr(e?.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [userId]);

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', margin:'6px 0 10px 0' }}>
        <h2 style={{ fontSize:20, fontWeight:700, margin:0, flex:1 }}>History</h2>
        <button
          onClick={load}
          style={{ padding:'8px 10px', borderRadius:10, border:'1px solid #E5E7EB', background:'#fff', color:'#111827', cursor:'pointer', fontWeight:600, fontSize:12 }}
        >
          Refresh
        </button>
      </div>

      {loading && <div style={{ color:'#6B7280' }}>Loading…</div>}
      {err && <div style={{ color:'#ef4444' }}>{err}</div>}
      {!loading && !err && items.length === 0 && (
        <div style={{ color:'#6B7280', textAlign:'center', padding:'24px 0' }}>
          No completed sessions yet
        </div>
      )}

      <div style={{ display:'grid', gap:10 }}>
        {items.map((it) => (
          <div key={it.id} style={{ border:'1px solid #E5E7EB', borderRadius:16, background:'#FFFFFF', padding:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:'#E5EDFF', display:'grid', placeItems:'center', color:'#2563EB', fontWeight:700 }}>
                  {(it.title || "R")[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight:700 }}>{it.title}</div>
                  {it.description && (
                    <div style={{ fontSize:13, color:'#6B7280', maxWidth:300, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={it.description}>
                      {it.description}
                    </div>
                  )}
                </div>
              </div>
              <span style={{ fontSize:12, background:'#E5E7EB', color:'#374151', padding:'4px 8px', borderRadius:8 }}>
                {it.role === "beneficiary" ? "As beneficiary" : it.role === "volunteer" ? "As volunteer" : "Past request"}
              </span>
            </div>

            <div style={{ display:'flex', flexWrap:'wrap', gap:12, color:'#6B7280', fontSize:12, margin:'10px 0' }}>
              {it.location && <span>📍 {it.location}</span>}
              {it.endedAt && <span>✅ Completed</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
