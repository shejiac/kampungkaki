
import { User } from "../backend/src/types/user";
import { RequestInfo } from "../backend/src/types/request";
import ViewRequests from "./pages/ViewRequests";
import React, { useEffect, useMemo, useState } from "react";

export default function App() {
  return <ViewRequests/>;
}

// UI item the page expects
type UIRequest = {
    id: number;
    requesterInitial: string;
    title: string;
    description: string;
    locationName: string;
    lat: number;
    lng: number;
    category: string;
    when: string;
    urgency: "High" | "Medium" | "Low";
  };
  
  // Example adapter (you’d call this after fetching rows)
  function toUI(
    r: RequestInfo,
    requester?: User,
    coords?: { lat: number; lng: number }
  ): UIRequest {
    return {
      id: r.request_id,
      requesterInitial: (requester?.user_name ?? "?").slice(0, 1).toUpperCase(),
      title: r.request_title,
      description: r.request_description,
      locationName: r.request_location,
      lat: coords?.lat ?? 1.3048,    // fallback
      lng: coords?.lng ?? 103.8318,  // fallback
      category: r.request_type,
      when: formatWhen(r.request_time),              // format timestamp → “Today 2:00 PM”
      urgency: r.request_priority as UIRequest["urgency"],
    };
  }
  
  function formatWhen(ts: number) {
    const d = new Date(ts);
    // keep it simple for now:
    return d.toLocaleString(); // later: humanize to “Today 2:00 PM”
  }
  

/** ---------- Types ---------- */
type Urgency = "High" | "Medium" | "Low";

type RequestItem = {
  id: string;
  requesterInitial: string;    // “L”, “S”, etc. (avatar circle)
  title: string;               // e.g., "Weekly Grocery Shopping"
  description: string;         // short summary
  locationName: string;        // e.g., "Ang Mo Kio"
  lat: number;
  lng: number;
  category: string;            // e.g., "Shopping", "Medical", "Home task"
  when: string;                // e.g., "Tomorrow 10:00 AM", "Today 2:00 PM"
  urgency: Urgency;
};

/** ---------- Mock data (matches your Figma cards) ---------- */
const MOCK_REQUESTS: RequestItem[] = [
  {
    id: "req-1",
    requesterInitial: "L",
    title: "Changing of bedsheet",
    description: "Help me with changing my bedsheet cover. It is too heavy for me.",
    locationName: "Ang Mo Kio",
    lat: 1.3691,
    lng: 103.8454,
    category: "Home task",
    when: "Tomorrow 10:00 AM",
    urgency: "Medium",
  },
  {
    id: "req-2",
    requesterInitial: "L",
    title: "Weekly Grocery Shopping",
    description:
      "Help me with my weekly grocery shopping at NTUC FairPrice. I need assistance carrying heavy items.",
    locationName: "Ang Mo Kio",
    lat: 1.3691,
    lng: 103.8454,
    category: "Shopping",
    when: "Tomorrow 10:00 AM",
    urgency: "Medium",
  },
  {
    id: "req-3",
    requesterInitial: "S",
    title: "Doctor's Appointment",
    description:
      "Need someone to accompany me to my doctor's appointment at Tan Tock Seng Hospital.",
    locationName: "Novena",
    lat: 1.3215,
    lng: 103.8430,
    category: "Medical",
    when: "Today 2:00 PM",
    urgency: "High",
  },
];

/** ---------- Helpers ---------- */
// Haversine distance (km) between two coordinates
function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const a =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** ---------- Main Page ---------- */
export default function ViewRequests() {
  // User location (used to show "near you" + distance filter)
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);

  // Filters
  const [urgency, setUrgency] = useState<"All" | Urgency>("All");
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(10); // default 10km

  // Local state of accepted requests
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());

  // Try to get browser geolocation; fall back to a central SG point if not allowed.
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      // Fallback: central SG (Orchard)
      setUserLat(1.3048);
      setUserLng(103.8318);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
      },
      () => {
        // Permission denied → sensible fallback
        setUserLat(1.3048);
        setUserLng(103.8318);
      }
    );
  }, []);

  // Compute distances and filtered list
  const itemsWithDistance = useMemo(() => {
    if (userLat == null || userLng == null) return [];

    return MOCK_REQUESTS.map((req) => {
      const dist = distanceKm(userLat, userLng, req.lat, req.lng);
      return { ...req, distanceKm: dist };
    });
  }, [userLat, userLng]);

  const filtered = useMemo(() => {
    return itemsWithDistance
      .filter((r) => (urgency === "All" ? true : r.urgency === urgency))
      .filter((r) => r.distanceKm <= maxDistanceKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [itemsWithDistance, urgency, maxDistanceKm]);

  function handleAccept(id: string) {
    // In a real app, you'd call your backend here to "claim" the request.
    setAcceptedIds((prev) => new Set(prev).add(id));
    alert("Thanks! You’ve accepted this request.");
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.avatar} aria-hidden>
          {/* simple user avatar circle */}
          <span role="img" aria-label="avatar">👤</span>
        </div>
        <div style={{ marginLeft: 8, fontWeight: 700, color: "#0E62F2" }}>KampungKaki</div>
      </header>

      {/* Stats row (placeholders for now) */}
      <div style={styles.statsRow}>
        <StatCard label="Volunteers" value="0" />
        <StatCard label="Requests" value={String(MOCK_REQUESTS.length)} />
        <StatCard label="Helped" value={String(acceptedIds.size)} />
      </div>

      {/* Tabs row (static look to match Figma) */}
      <nav style={styles.tabsRow} aria-label="Navigation">
        <Tab icon="♡" label="My Requests" />
        <Tab icon="🔍" label="Search" active />
        <Tab icon="💬" label="Messages" />
        <Tab icon="👤" label="Profile" />
      </nav>

      {/* Title */}
      <h2 style={styles.sectionTitle}>Help Requests Near You</h2>

      {/* Filters */}
      <div style={styles.filters}>
        <div>
          <label htmlFor="urgency" style={styles.label}>Urgency</label>
          <select
            id="urgency"
            value={urgency}
            onChange={(e) => setUrgency(e.target.value as any)}
            style={styles.select}
            aria-label="Filter by urgency"
          >
            <option>All</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>

        <div>
          <label htmlFor="distance" style={styles.label}>
            Max Distance ({maxDistanceKm} km)
          </label>
          <input
            id="distance"
            type="range"
            min={1}
            max={25}
            step={1}
            value={maxDistanceKm}
            onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
            style={{ width: 220 }}
            aria-label="Filter by distance"
          />
        </div>
      </div>

      {/* Cards */}
      <div style={styles.cardsWrap}>
        {userLat == null || userLng == null ? (
          <p style={{ color: "#666" }}>Detecting your location…</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: "#666" }}>No requests found with the current filters.</p>
        ) : (
          filtered.map((r) => (
            <RequestCard
              key={r.id}
              item={r}
              accepted={acceptedIds.has(r.id)}
              onAccept={() => handleAccept(r.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

/** ---------- Sub-components ---------- */

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.statCard} aria-label={`${label}: ${value}`}>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#0E62F2" }}>{value}</div>
      <div style={{ fontSize: 12, color: "#6B7280" }}>{label}</div>
    </div>
  );
}

function Tab({ icon, label, active = false }: { icon: string; label: string; active?: boolean }) {
  return (
    <div style={{ ...styles.tab, ...(active ? styles.tabActive : {}) }} role="button" aria-pressed={active}>
      <span style={{ marginRight: 6 }}>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function UrgencyBadge({ level }: { level: Urgency }) {
  const color =
    level === "High" ? "#FCA5A5" : level === "Medium" ? "#FDE68A" : "#A7F3D0";
  const textColor =
    level === "High" ? "#991B1B" : level === "Medium" ? "#92400E" : "#065F46";

  return (
    <span
      style={{
        background: color,
        color: textColor,
        fontSize: 12,
        fontWeight: 700,
        padding: "4px 8px",
        borderRadius: 12,
      }}
      aria-label={`Urgency ${level}`}
    >
      {level}
    </span>
  );
}

function RequestCard({
  item,
  accepted,
  onAccept,
}: {
  item: RequestItem & { distanceKm?: number };
  accepted: boolean;
  onAccept: () => void;
}) {
  return (
    <article style={styles.card} aria-label={`${item.title} request`}>
      <div style={styles.cardHeader}>
        <div style={styles.initialCircle} aria-hidden>
          {item.requesterInitial}
        </div>
        <div style={{ flex: 1 }}>
          <div style={styles.cardTitle}>{item.title}</div>
          <p style={styles.cardDesc}>{item.description}</p>
        </div>
        <UrgencyBadge level={item.urgency} />
      </div>

      <div style={styles.metaRow}>
        <Meta icon="📍" text={item.locationName} />
        <Meta icon="🕒" text={item.when} />
        <Meta icon={iconForCategory(item.category)} text={item.category} />
        {typeof item.distanceKm === "number" && (
          <Meta
            icon="📏"
            text={`${item.distanceKm.toFixed(1)} km away`}
          />
        )}
      </div>

      <button
        onClick={onAccept}
        disabled={accepted}
        style={{
          ...styles.helpBtn,
          ...(accepted ? styles.helpBtnDisabled : {}),
        }}
        aria-label={accepted ? "Already accepted" : "I'll help"}
      >
        {accepted ? "Accepted ✓" : "I’ll Help!"}
      </button>
    </article>
  );
}

function Meta({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={styles.meta}>
      <span style={{ marginRight: 6 }}>{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function iconForCategory(cat: string) {
  if (cat.toLowerCase().includes("medical")) return "🏥";
  if (cat.toLowerCase().includes("shopping")) return "🛒";
  if (cat.toLowerCase().includes("home")) return "🏠";
  return "🧩";
}

/** ---------- Inline styles (kept minimal, accessible) ---------- */
const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 480,
    margin: "0 auto",
    padding: "16px 14px 40px",
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
    color: "#0F172A",
    background: "#FFF",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#E6EEFF",
    display: "grid",
    placeItems: "center",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 10,
    margin: "8px 0 12px",
  },
  statCard: {
    background: "#F8FAFC",
    border: "1px solid #E5E7EB",
    borderRadius: 12,
    padding: "10px 12px",
    textAlign: "center" as const,
  },
  tabsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    gap: 10,
    marginBottom: 12,
  },
  tab: {
    border: "1px solid #E5E7EB",
    background: "#FFF",
    padding: "10px 8px",
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6B7280",
    cursor: "pointer",
    userSelect: "none" as const,
  },
  tabActive: {
    background: "#E7F0FF",
    color: "#0E62F2",
    borderColor: "#BFD7FF",
    fontWeight: 700,
  },
  sectionTitle: {
    fontSize: 18,
    margin: "10px 2px",
  },
  filters: {
    display: "flex",
    alignItems: "center",
    gap: 18,
    margin: "8px 2px 14px",
    flexWrap: "wrap" as const,
  },
  label: {
    fontSize: 12,
    color: "#6B7280",
    display: "block",
    marginBottom: 6,
  },
  select: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #E5E7EB",
    background: "#FFF",
  },
  cardsWrap: {
    display: "grid",
    gap: 12,
  },
  card: {
    background: "#F9FAFB",
    border: "1px solid #E5E7EB",
    borderRadius: 16,
    padding: 14,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  cardHeader: {
    display: "grid",
    gridTemplateColumns: "40px 1fr auto",
    gap: 10,
    alignItems: "start",
  },
  initialCircle: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#E5ECFF",
    display: "grid",
    placeItems: "center",
    fontWeight: 700,
    color: "#2D3A8C",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 4,
  },
  cardDesc: {
    margin: 0,
    color: "#475569",
    fontSize: 13,
    lineHeight: 1.3,
  },
  metaRow: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 12,
    marginTop: 10,
    marginBottom: 12,
    color: "#334155",
    fontSize: 13,
  },
  meta: {
    display: "flex",
    alignItems: "center",
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: 10,
    padding: "6px 8px",
  },
  helpBtn: {
    width: "100%",
    padding: "12px 10px",
    borderRadius: 12,
    background: "#E7F0FF",
    border: "1px solid #BFD7FF",
    color: "#0E62F2",
    fontWeight: 700,
    cursor: "pointer",
  },
  helpBtnDisabled: {
    background: "#E5E7EB",
    color: "#6B7280",
    borderColor: "#D1D5DB",
    cursor: "not-allowed",
  },
};
