import { useEffect, useMemo, useState } from "react";
import "./requestform.css";

export default function RequestForm({ onSuccess, onCancel }) {

  const [step, setStep] = useState(1);

  // core fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("OPEN");      // fixed OPEN
  const [label, setLabel] = useState("");            // Tag (category)
  const [urgency, setUrgency] = useState("");        // LOW | MEDIUM | HIGH
  const [location, setLocation] = useState("");
  const [initialMeet, setInitialMeet] = useState(false);
  const [time, setTime] = useState("");              // Morning | Afternoon | Evening | Anytime | explicit datetime
  const [duration, setDuration] = useState("");      // e.g. 2 hours

  // user
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");

  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  

  useEffect(() => {
    // replace with real session/user
    const loggedInUser = { username: "JohnDoe", id: "1b4e28ba-2fa1-11d2-883f-0016d3cca427" };
    setUsername(loggedInUser.username);
    setUserId(loggedInUser.id);
  }, []);

  const canNext = useMemo(() => {
    if (step === 1) return !!label;
    if (step === 2) return !!title && !!description;
    if (step === 3) return !!time;
    if (step === 4) return !!urgency;
    return true;
  }, [step, label, title, description, time, urgency]);

  const progress = useMemo(() => (step / 4) * 100, [step]);

  async function submit(e) {
    e?.preventDefault?.();
    setMsg("");
    if (!title || !userId) {
      setMsg("Title and userId are required");
      return;
    }
    try {
      setSaving(true);
      const resp = await fetch("http://localhost:5000/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        // common fields
        title,
        description,
        username,
        userId,
        status,

        // map UI fields -> DB columns
        type: label || undefined,                // label -> type
        priority: urgency || undefined,          // urgency -> priority
        location: location || undefined,
        initialMeet,                             // camelCase (DB uses initialMeet)
        time: time || undefined,
        approxDuration: duration || undefined,   // duration -> approxDuration
      }),
      });
      if (!resp.ok) {
        const err = await resp.json();
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

      // return to list
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
        {/* Optional cancel to go back to list without posting */}
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
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? "Posting…" : "Post Request"}
            </button>
          </div>

          {msg && <p className="message">{msg}</p>}
        </div>
      )}
    </form>
  );
}
