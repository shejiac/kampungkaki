import { useEffect, useMemo, useState } from "react";
import "./requestform.css";
import { v4 as uuidv4 } from 'uuid';

export default function RequestForm({ onSuccess, onCancel }) {
  const [step, setStep] = useState(1);

  // core fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("OPEN");
  const [label, setLabel] = useState("");
  const [urgency, setUrgency] = useState("");
  const [location, setLocation] = useState("");
  const [initialMeet, setInitialMeet] = useState(false);
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("");

  // user
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");

  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loggedInUser = { username: "JohnDoe", id: "1b4e28ba-2fa1-11d2-883f-0016d3cca427" };
    setUsername(loggedInUser.username);
    setUserId(loggedInUser.id);
  }, []);

  const canNext = useMemo(() => {
    if (step === 1) return !!label;
    if (step === 2) return !!title && !!description;
    if (step === 3) return !!time;
    if (step === 4) return !!urgency && !!userId; // require userId by final step
    return true;
  }, [step, label, title, description, time, urgency, userId]);

  const progress = useMemo(() => (step / 4) * 100, [step]);

  // ---- Helpers ----
  const orNull = (v) => {
    const s = typeof v === "string" ? v.trim() : v;
    return s ? s : null;
  };

  // Convert common inputs to a Postgres-friendly INTERVAL string (HH:MM:SS)
  // Accepts: "3 hours", "2h", "90 minutes", "1h 30m", "1:30", "01:30:00"
  function toPgInterval(input) {
    if (!input) return null;
    const s = String(input).trim();
    if (!s) return null;

    // Already HH:MM or HH:MM:SS -> normalize to HH:MM:SS
    if (/^\d{1,3}:\d{2}(:\d{2})?$/.test(s)) {
      const parts = s.split(":");
      if (parts.length === 2) return `${parts[0].padStart(2, "0")}:${parts[1]}:00`;
      return `${parts[0].padStart(2, "0")}:${parts[1]}:${parts[2].padStart(2, "0")}`;
    }

    // Parse tokens like "1h 30m", "2h", "90m", "3 hours", "45 minutes", "1 day"
    let days = 0, hours = 0, minutes = 0;

    const d = s.match(/(\d+)\s*d(ays?)?/i);
    if (d) days = parseInt(d[1], 10);

    const h = s.match(/(\d+)\s*h(ours?)?/i);
    if (h) hours = parseInt(h[1], 10);

    const m = s.match(/(\d+)\s*m(in(ute)?s?)?/i);
    if (m) minutes = parseInt(m[1], 10);

    // Support compact "1h30m" without spaces
    if (!h && !m) {
      const compactH = s.match(/(\d+)h(\d+)?m?/i);
      if (compactH) {
        hours = parseInt(compactH[1], 10);
        if (compactH[2]) minutes = parseInt(compactH[2], 10);
      }
    }

    // Support pure number as minutes (e.g., "90")
    if (!d && !h && !m && /^\d+$/.test(s)) {
      minutes = parseInt(s, 10);
    }

    if (days === 0 && hours === 0 && minutes === 0) {
      // Let Postgres parse natural text like "3 hours"
      return s;
    }

    hours += days * 24;
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    return `${hh}:${mm}:00`;
  }

  async function submit(e) {
    e?.preventDefault?.();
    setMsg("");

    // Granular validation so you see exactly what's missing
    const missing = [];
    if (!title || !title.trim()) missing.push("title");
    if (!userId) missing.push("userId");
    if (missing.length) {
      setMsg(`Missing: ${missing.join(", ")}`);
      return;
    }

    try {
      setSaving(true);

      const requestId = uuidv4();

      // Build payload using the snake_case keys your backend expects.
      // Include optional fields ONLY when they are defined (avoid sending "").
      const trimmedTitle = (title ?? "").trim();
      const trimmedDescription = (description ?? "").trim();

      const payload = {
        // always include both names in case the server expects either
        request_id: uuidv4(),
        requester_id: userId,

        // titles/descriptions: send BOTH snake_case and flat names, trimmed
        request_title: trimmedTitle,
        title: trimmedTitle,
        request_description: trimmedDescription,
        description: trimmedDescription,

        request_status: status,
        request_initial_meet: !!initialMeet,
      };

      // optional fields — only include if present
      const request_type = orNull(label);
      if (request_type) payload.request_type = request_type;

      const request_priority = orNull(urgency);
      if (request_priority) payload.request_priority = request_priority;

      const request_location = orNull(location);
      if (request_location) payload.request_location = request_location;

      const isoTime = /^\d{4}-\d{2}-\d{2}T/.test(time) ? time : null;
      if (isoTime) payload.request_time = isoTime;

      const interval = toPgInterval(duration);
      if (interval && String(interval).trim()) {
        payload.request_approx_duration = interval; // e.g., "03:00:00" or "3 hours"
      }

      // debug what you actually send
      console.log("Submitting payload:", payload);


      // Optional: quick debug
      // console.log("DEBUG payload", payload);

      const resp = await fetch("http://localhost:5000/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save");
      }

      // reset after success
      setTitle("");
      setDescription("");
      setStatus("OPEN");
      setLabel("");
      setUrgency("");
      setLocation("");
      setInitialMeet(false);
      setTime("");
      setDuration("");
      setStep(1);
      setMsg("Request saved!");
      onSuccess?.();
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="form-wrap" onSubmit={submit}>
      <div className="header">
        <button
          type="button"
          className="back"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
          aria-label="Go back"
        >
          ←
        </button>
        <div className="title-block">
          <div className="subtitle">Create Help Request</div>
          <div className="progress">
            <div className="bar" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <button type="button" className="btn" onClick={() => onCancel?.()}>
          Cancel
        </button>
      </div>

      {/* STEP 1 — Tag */}
      {step === 1 && (
        <div className="step-card">
          <div className="step-title">
            <span className="pill">1</span> What type of help do you need?
          </div>
          <div className="options" role="radiogroup" aria-label="Category">
            {[
              { v: "COMPANIONSHIP", t: "Companionship", d: "Social visits, conversation, or activities" },
              { v: "HOME_TASKS", t: "Home Tasks", d: "Light housework or technical help" },
              { v: "TRANSPORTATION", t: "Transportation", d: "Help getting to appointments" },
              { v: "SHOPPING", t: "Shopping", d: "Grocery shopping or other errands" },
              { v: "OTHER", t: "Other", d: "Something else" },
            ].map((o) => (
              <label
                key={o.v}
                className={`option ${label === o.v ? "selected" : ""}`}
                tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setLabel(o.v)}
              >
                <input
                  type="radio"
                  name="label"
                  checked={label === o.v}
                  onChange={() => setLabel(o.v)}
                />
                <div>
                  <div className="opt-title">{o.t}</div>
                  <div className="meta">{o.d}</div>
                </div>
              </label>
            ))}
          </div>
          <div className="actions sticky-actions">
            <span />
            <button
              type="button"
              className="btn primary"
              disabled={!canNext}
              onClick={() => setStep(2)}
            >
              Next Step
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 — Description */}
      {step === 2 && (
        <div className="step-card">
          <div className="step-title">
            <span className="pill">2</span> Give your request a title
          </div>
          <div className="row">
            <div className="input">
              <label>Title</label>
              <input
                placeholder="e.g., Help with weekly grocery shopping"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="input">
              <label>Describe what you need</label>
              <textarea
                placeholder="Provide details to help volunteers understand how they can help."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                required
              />
            </div>
            <div className="row two">
              <div className="input">
                <label>Location</label>
                <input
                  placeholder="Enter your location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="input" style={{ alignSelf: "end" }}>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={initialMeet}
                    onChange={(e) => setInitialMeet(e.target.checked)}
                  />
                  Initial Meeting Needed
                </label>
              </div>
            </div>
          </div>

          <div className="actions sticky-actions">
            <button type="button" className="btn" onClick={() => setStep(1)}>
              Back
            </button>
            <button
              type="button"
              className="btn primary"
              disabled={!canNext}
              onClick={() => setStep(3)}
            >
              Next Step
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 — Time */}
      {step === 3 && (
        <div className="step-card">
          <div className="step-title">
            <span className="pill">3</span> When do you need help?
          </div>

          <div className="options" role="radiogroup" aria-label="Preferred time">
            {[
              { v: "Morning (9:00 AM - 12:00 PM)", t: "Morning (9:00 AM – 12:00 PM)" },
              { v: "Afternoon (12:00 PM - 5:00 PM)", t: "Afternoon (12:00 PM – 5:00 PM)" },
              { v: "Evening (5:00 PM - 8:00 PM)", t: "Evening (5:00 PM – 8:00 PM)" },
              { v: "Anytime (I am flexible)", t: "Anytime (I am flexible)" },
            ].map((o) => (
              <label
                key={o.v}
                className={`option ${time === o.v ? "selected" : ""}`}
                tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setTime(o.v)}
              >
                <input
                  type="radio"
                  name="time"
                  checked={time === o.v}
                  onChange={() => setTime(o.v)}
                />
                <div className="opt-title">{o.t}</div>
              </label>
            ))}
          </div>

          <div className="row two" style={{ marginTop: 12 }}>
            <div className="input">
              <label>Specific date & time</label>
              <input
                type="datetime-local"
                value={/^\d{4}-\d{2}-\d{2}T/.test(time) ? time : ""}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
            <div className="input">
              <label>Duration</label>
              <input
                placeholder="e.g., 2 hours"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>

          <div className="actions sticky-actions">
            <button type="button" className="btn" onClick={() => setStep(2)}>
              Back
            </button>
            <button
              type="button"
              className="btn primary"
              disabled={!canNext}
              onClick={() => setStep(4)}
            >
              Next Step
            </button>
          </div>
        </div>
      )}

      {/* STEP 4 — Urgency */}
      {step === 4 && (
        <div className="step-card">
          <div className="step-title">
            <span className="pill">4</span> How urgent is this?
          </div>
          <div className="options" role="radiogroup" aria-label="Urgency">
            {[
              { v: "LOW", t: "Low Priority", d: "Within a week – I can wait" },
              { v: "MEDIUM", t: "Medium Priority", d: "Within 2–3 days – Quite important" },
              { v: "HIGH", t: "High Priority", d: "Today or tomorrow – Really need help" },
            ].map((o) => (
              <label
                key={o.v}
                className={`option ${urgency === o.v ? "selected" : ""}`}
                tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setUrgency(o.v)}
              >
                <input
                  type="radio"
                  name="urgency"
                  checked={urgency === o.v}
                  onChange={() => setUrgency(o.v)}
                />
                <div>
                  <div className="opt-title">{o.t}</div>
                  <div className="meta">{o.d}</div>
                </div>
              </label>
            ))}
          </div>

          {/* hidden fields kept for API completeness */}
          <input type="hidden" value={userId} readOnly />
          <input type="hidden" value={username} readOnly />
          <input type="hidden" value={status} readOnly />

          <div className="actions sticky-actions">
            <button type="button" className="btn" onClick={() => setStep(3)}>
              Back
            </button>
            <button type="submit" className="btn primary" disabled={saving || !userId}>
              {saving ? "Posting…" : "Post Request"}
            </button>
          </div>

          {msg && <p className="message">{msg}</p>}
        </div>
      )}
    </form>
  );
}
