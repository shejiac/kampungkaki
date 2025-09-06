// src/requests/requestform.jsx
import { useEffect, useMemo, useState } from "react";
import "./requestform.css";
import { v4 as uuidv4 } from "uuid";
import { API } from "../api";

export default function RequestForm({ requesterId, onSuccess, onCancel }) {
  const [step, setStep] = useState(1);

  // fields...
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("OPEN");
  const [label, setLabel] = useState("");
  const [urgency, setUrgency] = useState("");
  const [location, setLocation] = useState("");
  const [initialMeet, setInitialMeet] = useState(false);
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("");

  // requester
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState(requesterId || "");

  useEffect(() => {
    // keep it in sync if parent prop changes
    if (requesterId) setUserId(requesterId);
  }, [requesterId]);

  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const canNext = useMemo(() => {
    if (step === 1) return !!label;
    if (step === 2) return !!title && !!description;
    if (step === 3) return !!time;
    if (step === 4) return !!urgency && !!userId;
    return true;
  }, [step, label, title, description, time, urgency, userId]);

  const progress = useMemo(() => (step / 4) * 100, [step]);

  const orNull = (v) => {
    const s = typeof v === "string" ? v.trim() : v;
    return s ? s : null;
  };

  function toPgInterval(input) {
    if (!input) return null;
    const s = String(input).trim();
    if (!s) return null;
    if (/^\d{1,3}:\d{2}(:\d{2})?$/.test(s)) {
      const parts = s.split(":");
      if (parts.length === 2) return `${parts[0].padStart(2, "0")}:${parts[1]}:00`;
      return `${parts[0].padStart(2, "0")}:${parts[1]}:${parts[2].padStart(2, "0")}`;
    }
    let days = 0, hours = 0, minutes = 0;
    const d = s.match(/(\d+)\s*d(ays?)?/i); if (d) days = parseInt(d[1], 10);
    const h = s.match(/(\d+)\s*h(ours?)?/i); if (h) hours = parseInt(h[1], 10);
    const m = s.match(/(\d+)\s*m(in(ute)?s?)?/i); if (m) minutes = parseInt(m[1], 10);
    if (!h && !m) {
      const compactH = s.match(/(\d+)h(\d+)?m?/i);
      if (compactH) { hours = parseInt(compactH[1], 10); if (compactH[2]) minutes = parseInt(compactH[2], 10); }
    }
    if (!d && !h && !m && /^\d+$/.test(s)) minutes = parseInt(s, 10);
    if (days === 0 && hours === 0 && minutes === 0) return s;
    hours += days * 24;
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    return `${hh}:${mm}:00`;
  }

  async function submit(e) {
    e?.preventDefault?.();
    setMsg("");
    const missing = [];
    if (!title || !title.trim()) missing.push("title");
    if (!userId) missing.push("userId");
    if (missing.length) {
      setMsg(`Missing: ${missing.join(", ")}`);
      return;
    }

    try {
      setSaving(true);

      const trimmedTitle = (title ?? "").trim();
      const trimmedDescription = (description ?? "").trim();
      const payload = {
        request_id: uuidv4(),
        requester_id: userId,
        request_title: trimmedTitle,
        title: trimmedTitle,
        request_description: trimmedDescription,
        description: trimmedDescription,
        request_status: status,
        request_initial_meet: !!initialMeet,
      };

      const request_type = orNull(label);         if (request_type) payload.request_type = request_type;
      const request_priority = orNull(urgency);   if (request_priority) payload.request_priority = request_priority;
      const request_location = orNull(location);  if (request_location) payload.request_location = request_location;
      const isoTime = /^\d{4}-\d{2}-\d{2}T/.test(time) ? time : null;
      if (isoTime) payload.request_time = isoTime;
      const interval = toPgInterval(duration);
      if (interval && String(interval).trim()) payload.request_approx_duration = interval;

      const resp = await fetch(`${API}/api/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save");
      }

      // reset
      setTitle(""); setDescription(""); setStatus("OPEN");
      setLabel(""); setUrgency(""); setLocation("");
      setInitialMeet(false); setTime(""); setDuration("");
      setStep(1); setMsg("Request saved!");
      onSuccess?.();
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  }

  // …(render stays the same; keep your nice steps)…
  // Just ensure the <form onSubmit={submit}> is wired to this submit().

  return (
    // (your existing JSX steps exactly as before)
    // make sure the submit button triggers onSubmit and uses userId from props
    // …
    <form className="form-wrap" onSubmit={submit}>
      {/* your current content unchanged */}
    </form>
  )
}
