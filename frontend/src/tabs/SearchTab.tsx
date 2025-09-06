import { useEffect, useMemo, useState } from "react";
import { API } from "../api";

type Req = {
  request_id: string;
  requester_id?: string;
  volunteer_id?: string | null;
  request_status?: string;     // 'open' | 'pending' | 'ongoing' | 'completed' | etc
  title?: string;              // some schemas use 'title'
  request_title?: string;      // fallback in case your schema differs
  description?: string;
  request_description?: string;
  location?: string;
  address?: string;
  time?: string;
  requested_time?: string;
  urgency?: string;
  label?: string;
};

export default function SearchTab({
  userId,
  isVolunteer,
  onAccepted,
}: {
  userId: string;
  isVolunteer: boolean;                 // volunteer can accept
  onAccepted: (threadId: string) => void; // open Messages with this request_id
}) {
  const [items, setItems] = useState<Req[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      // Your controller supports GET /api/requests
      const r = await fetch(`${API}/api/requests`);
      const d = await r.json();
      const list: Req[] = Array.isArray(d) ? d : (d.requests || d.data || []);
      setItems(list);
    } catch (e: any) {
      setErr(e?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  // show only requests that look "open-ish"
  const openRequests = useMemo(() => {
    return (items || []).filter((it) => {
      const status = (it.request_status || "").toLowerCase();
      // treat undefined or 'open'/'pending' as accept-able
      const looksOpen = !status || status === "open" || status === "pending";
      const notTaken = !it.volunteer_id; // if present and null/undefined means unassigned
      return looksOpen && notTaken;
    });
  }, [items]);

  async function accept(id: string) {
    const r = await fetch(`${API}/api/requests/${id}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-User-Id": userId },
      body: JSON.stringify({}),
    });
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      alert(`Accept failed (${r.status}) ${t}`);
      return;
    }
    const d = await r.json().catch(() => ({}));
    onAccepted(d.threadId || id); // backend usually returns {threadId}; fall back to id
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", margin: "6px 0 10px 0" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, flex: 1 }}>Help Requests</h2>
        <button
          onClick={load}
          style={{
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid #E5E7EB",
            background: "#fff",
            color: "#111827",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 12,
          }}
        >
          Refresh
        </button>
      </div>

      {loading && <div style={{ color: "#6B7280" }}>Loading…</div>}
      {err && <div style={{ color: "#ef4444" }}>{err}</div>}
      {!loading && !err && openRequests.length === 0 && (
        <div style={{ color: "#6B7280", textAlign: "center", padding: "24px 0" }}>
          No open requests right now
        </div>
      )}

      <div style={{ display: "grid", gap: 10 }}>
        {openRequests.map((it) => {
          const title = it.title || it.request_title || "Untitled request";
          const desc = it.description || it.request_description || "";
          const location = it.location || it.address;
          const time = it.time || it.requested_time;

          return (
            <div
              key={it.request_id}
              style={{
                border: "1px solid #E5E7EB",
                borderRadius: 16,
                background: "#FFFFFF",
                padding: 14,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "#E5EDFF",
                      display: "grid",
                      placeItems: "center",
                      color: "#2563EB",
                      fontWeight: 700,
                    }}
                  >
                    {title[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{title}</div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#6B7280",
                        maxWidth: 300,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={desc}
                    >
                      {desc || "—"}
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: 12,
                    background: "#FEF3C7",
                    color: "#92400E",
                    padding: "4px 8px",
                    borderRadius: 8,
                    whiteSpace: "nowrap",
                  }}
                >
                  {it.urgency || it.label || "–"}
                </span>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, color: "#6B7280", fontSize: 12, margin: "10px 0" }}>
                {location && <span>📍 {location}</span>}
                {time && <span>🕙 {time}</span>}
              </div>

              {isVolunteer ? (
                <button
                  onClick={() => {
  console.log("Request ID:", it.request_id);
  accept(it.request_id);
}}
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid #2563EB",
                    color: "#2563EB",
                    background: "#F8FAFF",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  ♡ I’ll Help!
                </button>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    color: "#6B7280",
                    fontSize: 12,
                    borderTop: "1px dashed #E5E7EB",
                    paddingTop: 8,
                  }}
                >
                  You’re a beneficiary — volunteers will see the “I’ll Help” button.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
