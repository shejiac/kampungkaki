import { useEffect, useMemo, useState } from "react";
import "./requestlist.css";
import { API } from "../api";

const API = import.meta.env.VITE_API_ORIGIN || "http://localhost:5000";
const USER_ID = "1b4e28ba-2fa1-11d2-883f-0016d3cca427"; // <-- must exist in t_users

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

// normalize a row whether backend returns snake_case or camelCase
function normalizeRow(r) {
  // prefer existing UI shape; otherwise map snake_case
  return {
    id: r.id ?? r.request_id ?? r.requestId ?? null,
    userId: r.userId ?? r.requester_id ?? r.requesterId ?? null,
    title: r.title ?? r.request_title ?? r.requestTitle ?? "",
    description: r.description ?? r.request_description ?? r.requestDescription ?? "",
    type: r.type ?? r.request_type ?? r.requestType ?? null,
    location: r.location ?? r.request_location ?? r.requestLocation ?? null,
    initialMeet: (r.initialMeet ?? r.request_initial_meet ?? r.initial_meet) ?? false,
    time: r.time ?? r.request_time ?? null,
    approxDuration: r.approxDuration ?? r.request_approx_duration ?? r.requestApproxDuration ?? null,
    priority: r.priority ?? r.request_priority ?? r.requestPriority ?? null,
    status: r.status ?? r.request_status ?? r.requestStatus ?? "",

    // optional extras the UI knows how to show if present
    user: r.user ?? null,
    distance: r.distance ?? null,
  };
}

const getLabel = (r) => r.label ?? r.type ?? r.tag ?? r.category ?? null;
const getUrgency = (r) => r.urgency ?? r.priority ?? null;
const getDuration = (r) => r.duration ?? r.approxDuration ?? r.expected_duration ?? null;

export default function RequestList({ onCreate, embed = false }) {
  const [rows, setRows] = useState([]);
  const [allRows, setAllRows] = useState([]); // raw data for client filtering
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // set "" to show all by default while debugging
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    p.set("userId", USER_ID);
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
      if (!resp.ok) {
        let msg = "Failed to fetch";
        try {
          const j = await resp.json();
          msg = j?.error || msg;
        } catch (_) {}
        throw new Error(msg);
      }
      const data = await resp.json();

      // normalize everything
      const normalized = (Array.isArray(data) ? data : []).map(normalizeRow);

      setAllRows(normalized);
      setRows(applyClientFilters(normalized, { status, q }));
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  // instant UI updates when status/search change
  useEffect(() => {
    if (!allRows.length) return;
    setRows(applyClientFilters(allRows, { status, q }));
  }, [status, q, allRows]);

  function applyClientFilters(list, { status, q }) {
    const qNorm = (q || "").trim().toLowerCase();
    const sNorm = (status || "").trim().toUpperCase();

    return list.filter((r0) => {
      const r = normalizeRow(r0); // safe even if already normalized

      // status filter (no-op if status is "")
      const statusOk = !sNorm || eq(r.status, sNorm);

      // text search
      const text =
        (r.title || "").toLowerCase() +
        " " +
        (r.description || "").toLowerCase();
      const qOk = !qNorm || text.includes(qNorm);

      return statusOk && qOk;
    });
  }

  function formatDateTime(dt) {
    if (!dt) return "";
    const d = new Date(dt);
    if (isNaN(d)) return dt; // fallback if it's not a valid date
    return d.toLocaleString("en-SG", {
      weekday: "short", // Wed
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
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

        {/* (Optional) add a basic status filter dropdown later if you want */}
        {/* <select className="field" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="OPEN">OPEN</option>
          <option value="ACCEPTED">ACCEPTED</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select> */}

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
        {rows.map((r0) => {
          const r = normalizeRow(r0);
          const label = getLabel(r);
          const urgency = getUrgency(r);
          const initial =
            r.user?.displayName?.trim()?.charAt(0)?.toUpperCase() ??
            r.user?.email?.trim()?.charAt(0)?.toUpperCase() ??
            r.title?.trim()?.charAt(0)?.toUpperCase() ??
            "•";

          return (
            <li key={r.id || r.title} className="card card-compact">
              <div className="row">
                {/* left avatar */}
                <div className="avatar">{initial}</div>

                {/* right content */}
                <div>
                  {/* title + top-right chips */}
                  <div className="card-head">
                    <strong className="card-title">{r.title || "(untitled)"}</strong>

                    <div className="badges">
                      {label && <span className="chip label">{prettyLabel(label)}</span>}
                      {urgency && (
                        <span className={`chip priority ${urgencyClass(urgency)}`}>{urgency}</span>
                      )}
                    </div>
                  </div>

                  {/* optional status badge */}
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

                    {r.time && <span className="meta-item">🕒 {formatDateTime(r.time)}</span>}

                    {getDuration(r) && <span className="meta-item">⏱ {getDuration(r)}</span>}

                    {r.initialMeet && <span className="meta-item">🤝 Initial Meeting Needed</span>}

                    <span className="spacer" />

                    {r.distance && <span className="meta-item">{r.distance} km away</span>}
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
