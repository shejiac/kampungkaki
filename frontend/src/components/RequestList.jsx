import { useEffect, useMemo, useState } from "react";
import "./requestlist.css";

const API = import.meta.env.VITE_API_ORIGIN || "http://localhost:5000";
// case-insensitive equals
const eq = (a, b) => String(a || "").toUpperCase() === String(b || "").toUpperCase();

// map stored labels to human text
const LABEL_MAP = {
  COMPANIONSHIP: "Companionship",
  HOME_TASKS: "Home Tasks",
  TRANSPORTATION: "Transportation",
  SHOPPING: "Shopping",
  OTHER: "Other",
};
const prettyLabel = (v) => LABEL_MAP[v] || v || "—";
const urgencyClass = (u) => (u ? String(u).toLowerCase() : "");
const getLabel = (r) => r.label ?? r.type ?? r.tag ?? r.category ?? null;
const getUrgency = (r) => r.urgency ?? r.priority ?? null;
const getDuration = (r) => r.duration ?? r.approxDuration ?? r.expected_duration ?? null;

export default function RequestList({ onCreate, embed = false }) {
  const [rows, setRows] = useState([]);
  const [allRows, setAllRows] = useState([]); // raw data for client filtering
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // tip: set "" to show all by default while debugging
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");

  // must match the id used in RequestForm
  const defaultUserId = "u1";

  const params = useMemo(() => {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  p.set("userId", defaultUserId);
  return p.toString();
  }, [q]);


  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const resp = await fetch(`${API}/api/requests?${params}`);
      if (!resp.ok) throw new Error((await resp.json()).error || "Failed to fetch");
      const data = await resp.json();

      setAllRows(data);
      setRows(applyClientFilters(data, { status, q }));
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  // instant UI updates when status/search change
  useEffect(() => {
    if (!allRows.length) return;
    setRows(applyClientFilters(allRows, { status, q }));
  }, [status, q, allRows]);

 function applyClientFilters(list, { q }) {
    const qNorm = q.trim().toLowerCase();
    return list.filter((r) => {
        return qNorm
        ? (r.title || "").toLowerCase().includes(qNorm) ||
            (r.description || "").toLowerCase().includes(qNorm)
        : true;
    });
    }
 function formatDateTime(dt) {
    if (!dt) return "";
    const d = new Date(dt);
    if (isNaN(d)) return dt; // fallback if it's not a valid date
    return d.toLocaleString("en-SG", {
        weekday: "short",    // "Wed"
        year: "numeric",     // "2025"
        month: "short",      // "Sep"
        day: "numeric",      // "10"
        hour: "2-digit",     // "06 AM"
        minute: "2-digit",   // "29"
        hour12: true,        // 12h format with AM/PM
    });
    }

  const statusBadge = (s) => <span className={`badge ${s}`}>{s}</span>;
  const chip = (text, kind = "default") =>
    text ? <span className={`chip ${kind}`}>{text}</span> : null;

  return (
    <section className="list-wrap">
      {!embed && (
        <div
          className="list-header"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}
        >
          <div>
            <div className="subtitle">Browse</div>
            <h2 className="title">My Requests</h2>
          </div>
          <button type="button" className="btn primary" onClick={onCreate}>
            Create request
          </button>
        </div>
      )}

      {/* Filters row */}
      <div className="filters-row">
        <input
          className="field"
          placeholder="Search title/description…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <div className="spacer" />
        <button className="btn" onClick={load} type="button">
          Refresh
        </button>
      </div>


      {loading && (
        <ul className="list">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="card skeleton">
              <div className="row">
                <div className="skeleton-line w-60" />
                <div className="skeleton-line w-28" />
              </div>
              <div className="skeleton-line w-100" />
              <div className="skeleton-line w-80" />
            </li>
          ))}
        </ul>
      )}

      {err && <p className="error">{err}</p>}

      {!loading && !err && rows.length === 0 && (
        <div className="empty">
          <div className="empty-icon">∅</div>
          <div className="empty-title">No requests found</div>
          <div className="empty-meta">Try adjusting filters or search terms.</div>
        </div>
      )}

        <ul className="list">
        {rows.map((r) => {
            const label = getLabel(r);
            const urgency = getUrgency(r);
            const initial =
            r.user?.displayName?.trim()?.charAt(0)?.toUpperCase() ??
            r.user?.email?.trim()?.charAt(0)?.toUpperCase() ??
            r.title?.trim()?.charAt(0)?.toUpperCase() ??
            "•";

            return (
            <li key={r.id} className="card card-compact">
                <div className="row">
                {/* left avatar */}
                <div className="avatar">{initial}</div>

                {/* right content */}
                <div>
                    {/* title + top-right chips */}
                    <div className="card-head">
                    <strong className="card-title">{r.title}</strong>

                    <div className="badges">
                        {label && (
                        <span className="chip label">{prettyLabel(label)}</span>
                        )}
                        {urgency && (
                        <span
                            className={`chip priority ${String(
                            urgency
                            ).toLowerCase()}`}
                        >
                            {urgency}
                        </span>
                        )}
                    </div>
                    </div>

                    {/* optional status badge (if you want it visible) */}
                    {r.status && (
                    <div className="badges" style={{ marginTop: 6 }}>
                        {statusBadge(r.status)}
                    </div>
                    )}

                    {/* description */}
                    {r.description && <p className="desc">{r.description}</p>}

                    {/* meta row */}
                    <div className="meta">
                    {r.location && (
                        <span className="meta-item">
                        📍{" "}
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            r.location
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {r.location}
                        </a>
                        </span>
                    )}

                    {r.time && (
                        <span className="meta-item">🕒 {formatDateTime(r.time)}</span>
                    )}

                    {getDuration(r) && (
                        <span className="meta-item">⏱ {getDuration(r)}</span>
                    )}

                    {(r.initialMeet ?? r.initial_meet) && (
                        <span className="meta-item">🤝 Initial Meeting Needed</span>
                    )}

                    <span className="spacer" />

                    {r.distance && (
                        <span className="meta-item">{r.distance} km away</span>
                    )}
                    </div>

                    {/* footer */}
                    {r.user && (
                    <div className="footer">
                        <span className="by">
                        by {r.user.displayName} ({r.user.email})
                        </span>
                    </div>
                    )}
                </div>
                </div>
            </li>
            );
        })}
        </ul>


    </section>
  );
}
