import { useEffect, useState } from "react";

/* --- styles --- */
import "./index.css";         // from the auth app
import "./pwdIndex.css";      // from the PWD requests app

/* --- auth/api helpers (from your auth app) --- */
import { logoutFirebase } from "./firebase";
import { getMe, updateMe } from "./api";

/* --- requests UI (from your PWD app) --- */
import RequestForm from "./components/requestform.jsx";
import RequestList from "./components/RequestList.jsx";

/* ---------------- tiny UI helpers (from auth app) ---------------- */
function Card({ children }) {
  return (
    <div className="bg-white rounded-2xl shadow border p-6 max-w-md w-full">
      {children}
    </div>
  );
}
function Btn({ children, ...props }) {
  return (
    <button
      className="w-full rounded-2xl px-5 py-3 font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
      {...props}
    >
      {children}
    </button>
  );
}

/* ----------------- utilities (from auth app) -------------------- */
const asE164 = (s) => (!s ? "" : s.startsWith("+") ? s : `+${s}`);
const getSignedInPhone = () =>
  localStorage.getItem("kk_phone") || "";

/* ---------------------- Requests Shell -------------------------- */
function RequestsShell() {
  const [view, setView] = useState("list");

  function ErrorBoundary({ children }) {
    try {
      return children;
    } catch (e) {
      return <pre style={{ color: "crimson" }}>{String(e)}</pre>;
    }
  }

  return (
    <div className="center-frame">
      <div className="app-card">
        {/* Card header stays fixed */}
        <div className="app-header">
          <h1 className="brand">KampungKaki</h1>
          {view === "list" ? (
            <button className="btn primary" onClick={() => setView("form")}>
              Create request
            </button>
          ) : (
            <button className="btn" onClick={() => setView("list")}>
              Back to list
            </button>
          )}
        </div>

        {/* Only this area scrolls */}
        <div className="app-content">
          <h2>My Requests</h2>
          <ErrorBoundary>
            {view === "list" ? (
              <RequestList embed />
            ) : (
              <RequestForm
                onSuccess={() => setView("list")}
                onCancel={() => setView("list")}
              />
            )}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

/* ------------------------ Root App ------------------------------ */
export default function App() {
  const [screen, setScreen] = useState("landing");

  // auth state
  const [phone, setPhone] = useState(""); // E.164
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);

  /* ------------- restore cached phone ------------------- */
  useEffect(() => {
    const cached = localStorage.getItem("kk_phone");
    if (cached) {
      setPhone(cached);
      // Auto-login if phone exists in cache
      handleLogin("home");
    }
  }, []);

  /* ---------------- phone auth -------------------------- */
  async function handleLogin(nextScreen) {
    const p = asE164(phone);
    if (!p || p.length < 8) {
      alert("Enter phone in E.164 (e.g. +6591234567)");
      return;
    }

    // Replace with your phone verification logic
    const authenticated = true; // Placeholder for actual phone verification
    if (authenticated) {
      setScreen(nextScreen);
      localStorage.setItem("kk_phone", p);

      // Load user profile
      const me = await getMe(p).catch(() => null);
      setUser(me);
      
      // If user doesn't have a profile, redirect to create profile
      if (!me || !me.fullName) {
        setScreen("create_profile");
      }
    } else {
      alert("Failed to authenticate phone number");
    }
  }

  async function handleLogout() {
    localStorage.removeItem("kk_phone");
    setUser(null);
    setPhone("");
    setScreen("landing");
  }

  /* ---------------- profile create/update ---------------- */
  async function handleCreateProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const p = getSignedInPhone();
      if (!p) {
        alert("You are not signed in. Please log in again.");
        return;
      }

      const form = new FormData(e.currentTarget);
      const fullName = (form.get("fullName") || "").trim();
      const ageVal = form.get("age");
      const age = ageVal ? Number(ageVal) : null;
      const address = (form.get("address") || "").trim();

      console.log("Saving profile with:", { phone: p, fullName, age, address });

      const saved = await updateMe({
        phone: p,
        fullName,
        age,
        address,
        avatarUrl: null,
      });

      console.log("Profile saved successfully:", saved);
      setUser(saved);
      setScreen("home");
      
    } catch (err) {
      console.error("Profile save error:", err);
      // Show specific error message if available
      const errorMessage = err.response?.data?.message || err.message || "Save failed";
      alert(`Save failed: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  }

  /* ------------------- screen blocks -------------------- */
  let content = null;

  // Landing screen
  if (screen === "landing") {
    content = (
      <Card>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600">KampungKaki</h1>
          <p className="text-gray-500 mt-2">
            Connecting volunteers with people in need
          </p>
        </div>

        <div className="space-y-4">
          <Btn onClick={() => setScreen("login_phone")}>Login</Btn>
          <Btn onClick={() => setScreen("signup_language")}>Sign up</Btn>
        </div>
      </Card>
    );
  }

  // Login screen
  if (screen === "login_phone") {
    content = (
      <Card>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600">KampungKaki</h1>
          <p className="text-gray-500">Connecting volunteers with people in need</p>
        </div>

        <h2 className="text-blue-600 font-semibold mb-2">Login</h2>
        <label className="block text-sm text-gray-700 mb-3">
          Mobile Number (E.164, e.g. +65XXXXXXXX)
          <input
            className="mt-2 w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+65XXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>

        <Btn onClick={() => handleLogin("home")}>Log in</Btn>

        <div className="mt-4">
          <button
            className="w-full rounded-2xl px-5 py-3 font-medium bg-gray-200 text-gray-800"
            onClick={() => setScreen("landing")}
          >
            Back
          </button>
        </div>
      </Card>
    );
  }

  // Signup language selection screen
  if (screen === "signup_language") {
    content = (
      <Card>
        <h1 className="text-xl font-semibold text-blue-600 mb-6 text-center">
          Select a language
        </h1>

        <div className="space-y-4">
          <button
            className="w-full bg-white border rounded-xl shadow-sm px-4 py-3 text-left hover:shadow transition"
            onClick={() => setScreen("signup_phone")}
          >
            English
          </button>
        </div>

        <div className="mt-5">
          <button
            className="w-full rounded-2xl px-5 py-3 font-medium bg-gray-200 text-gray-800"
            onClick={() => setScreen("landing")}
          >
            Back
          </button>
        </div>
      </Card>
    );
  }

  // Signup phone screen - FIXED: Only one definition
  if (screen === "signup_phone") {
    content = (
      <Card>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600">KampungKaki</h1>
          <p className="text-gray-500">Create your account</p>
        </div>

        <h2 className="text-blue-600 font-semibold mb-2">Sign Up</h2>
        <label className="block text-sm text-gray-700 mb-3">
          Mobile Number (E.164, e.g. +65XXXXXXXX)
          <input
            className="mt-2 w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+65XXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </label>

        <Btn onClick={() => {
          const p = asE164(phone);
          if (!p || p.length < 8) {
            alert("Enter phone in E.164 (e.g. +6591234567)");
            return;
          }
          localStorage.setItem("kk_phone", p);
          setScreen("create_profile");
        }}>
          Continue
        </Btn>

        <div className="mt-4">
          <button
            className="w-full rounded-2xl px-5 py-3 font-medium bg-gray-200 text-gray-800"
            onClick={() => setScreen("signup_language")}
          >
            Back
          </button>
        </div>
      </Card>
    );
  }

  // Create profile screen
  if (screen === "create_profile") {
    content = (
      <Card>
        <div className="text-center mb-4">
          <h1 className="text-xl font-semibold text-gray-800">Create Your Profile</h1>
          <p className="text-xs text-gray-500">KampungKaki</p>
        </div>

        <form onSubmit={handleCreateProfile} className="space-y-4">
          <label className="block text-sm text-gray-700">
            Full Name*
            <input
              name="fullName"
              className="mt-2 w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
              required
            />
          </label>

          <label className="block text-sm text-gray-700">
            Age*
            <input
              name="age"
              className="mt-2 w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your age"
              inputMode="numeric"
              required
            />
          </label>

          <label className="block text-sm text-gray-700">
            Address*
            <textarea
              name="address"
              className="mt-2 w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your address"
              required
            />
          </label>

          <Btn type="submit" disabled={saving}>
            {saving ? "Saving..." : "Complete Profile"}
          </Btn>

          <button
            className="w-full rounded-2xl px-5 py-3 font-medium bg-gray-200 text-gray-800"
            type="button"
            onClick={() => setScreen("landing")}
          >
            Cancel
          </button>
        </form>
      </Card>
    );
  }

  // Home screen - shows the integrated RequestsShell
  if (screen === "home") {
    content = (
      <div className="max-w-4xl w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 text-xl">👤</span>
          </div>
          <span className="text-sm text-blue-600 font-medium">KampungKaki</span>
        </div>

        <RequestsShell />

        <div className="mt-6">
          <button
            className="rounded-2xl px-5 py-3 font-medium bg-gray-200 text-gray-800"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      {content}
    </div>
  );
}