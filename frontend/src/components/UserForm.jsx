import { useState } from "react";

export default function UserForm() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!email || !displayName) {
      setMsg("Both fields are required.");
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, displayName }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create user");
      }
      const data = await resp.json();
      setMsg(`User created with id: ${data.id}`);
      setEmail("");
      setDisplayName("");
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ maxWidth: 400, margin: "2rem auto", display: "grid", gap: "1rem" }}>
      <h2>Create User</h2>
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: "8px" }}
        />
      </label>

      <label>
        Display Name
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          style={{ width: "100%", padding: "8px" }}
        />
      </label>

      <button type="submit" disabled={loading} style={{ padding: "10px" }}>
        {loading ? "Saving..." : "Save User"}
      </button>

      {msg && <p>{msg}</p>}
    </form>
  );
}
