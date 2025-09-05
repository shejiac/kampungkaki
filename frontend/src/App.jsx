import { useEffect, useState, useMemo } from "react";

/* --- styles --- */
import "./index.css";         // from the auth app
import "./pwdIndex.css";      // from the PWD requests app

/* --- auth/api helpers (from your auth app) --- */
import { startPhoneSignIn, auth, logoutFirebase } from "./firebase";
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
  auth.currentUser?.phoneNumber || localStorage.getItem("kk_phone") || "";

/* ---------------------- Requests Shell -------------------------- */
/** This is your previous PWD “App” card, turned into a child component.
 * It renders inside the “home” screen after the user is signed in.
 */
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
/** This preserves your phone auth + profile creation flow.
 * When screen === "home", it shows <RequestsShell />.
 */
export default function App() {
  // screens:
  // landing | login_phone | login_otp
  // signup_language | signup_phone | signup_otp
  // create_profile | home
  const [screen, setScreen] = useState("landing");

  // auth state
  const [phone, setPhone] = useState(""); // E.164
  const [code, setCode] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  // profile state
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);

  // sign-up language (we only support English now)
  const [unavailableOpen, setUnavailableOpen] = useState(false);

  /* ------------- restore cached phone ------------------- */
  useEffect(() => {
    const cached = localStorage.getItem("kk_phone");
    if (cached) setPhone(cached);
  }, []);

  const resetAuthState = () => {
    setCode("");
    setConfirmation(null);
  };

  /* ---------------- phone auth -------------------------- */
  async function handleSendCode(nextScreen) {
    const p = asE164(phone);
    if (!p || p.length < 8) {
      alert("Enter phone in E.164 (e.g. +6591234567)");
      return;
    }
    try {
      const conf = await startPhoneSignIn(p);
      setPhone(p);
      setConfirmation(conf);
      setScreen(nextScreen); // login_otp or signup_otp
    } catch (err) {
      console.error(err);
      alert("Failed to send code");
    }
  }

  async function handleVerify(nextScreen) {
    if (!confirmation || !code) {
      alert("Enter the 6-digit code");
      return;
    }
    try {
      const cred = await confirmation.confirm(code);
      const p = cred.user.phoneNumber; // normalized E.164 from Firebase
      setPhone(p);
      localStorage.setItem("kk_phone", p);

      // load existing profile if any
      const me = await getMe(p).catch(() => null);
      setUser(me);

      setScreen(nextScreen); // "home" or "create_profile"
      resetAuthState();
    } catch (err) {
      console.error(err);
      alert("Invalid code");
    }
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

      const saved = await updateMe({
        phone: p, // REQUIRED by the backend
        fullName,
        age,
        address,
        avatarUrl: null,
      });

      setUser(saved);
      setScreen("home");
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try {
      await logoutFirebase();
    } catch {}
    localStorage.removeItem("kk_phone");
    setUser(null);
    setPhone("");
    resetAuthState();
    setScreen("landing");
  }

  /* ------------------- screen blocks -------------------- */
  let content = null;

  // (All the auth/profile screens are unchanged)
  // Landing
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

  // Login → phone
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

        <Btn onClick={() => handleSendCode("login_otp")}>Send Code</Btn>

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

  // Login → OTP
  if (screen === "login_otp") {
    content = (
      <Card>
        <h1 className="text-xl font-semibold text-blue-600 mb-2">Verify Code</h1>
        <p className="text-sm text-gray-600 mb-4">
          We sent a verification code to <b>{phone}</b>
        </p>
        <label className="block text-sm text-gray-700 mb-4">
          6-digit code
          <input
            className="mt-2 w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          />
        </label>

        <div className="flex gap-3">
          <Btn onClick={() => handleVerify("home")}>Continue</Btn>
          <button
            className="rounded-2xl px-5 py-3 font-medium bg-gray-200 text-gray-800 w-full"
            onClick={() => setScreen("login_phone")}
          >
            Back
          </button>
        </div>
      </Card>
    );
  }

  // Signup → language (only English enabled)
  if (screen === "signup_language") {
    content = (
      <>
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

            {["中文", "Melayu", "தமிழ்"].map((label) => (
              <button
                key={label}
                className="w-full bg-white border rounded-xl shadow-sm px-4 py-3 text-left hover:shadow transition"
                onClick={() => setUnavailableOpen(true)}
              >
                {label}
              </button>
            ))}
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

        {unavailableOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6">
            <Card>
              <h2 className="text-lg font-semibold mb-3">Language unavailable</h2>
              <p className="text-gray-600 mb-4">
                This language is coming soon. Please use English for now.
              </p>
              <Btn onClick={() => setUnavailableOpen(false)}>OK</Btn>
            </Card>
          </div>
        )}
      </>
    );
  }

  // Signup → phone
  if (screen === "signup_phone") {
    content = (
      <Card>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600">KampungKaki</h1>
          <p className="text-gray-500">Connecting volunteers with people in need</p>
        </div>

        <h2 className="text-blue-600 font-semibold mb-2">Sign up</h2>
        <label className="block text-sm text-gray-700 mb-3">
          Mobile Number (E.164, e.g. +65XXXXXXXX)
          <input
            className="mt-2 w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+65XXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>

        <Btn onClick={() => handleSendCode("signup_otp")}>Send Code</Btn>

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

  // Signup → OTP
  if (screen === "signup_otp") {
    content = (
      <Card>
        <h1 className="text-xl font-semibold text-blue-600 mb-2">Verify Code</h1>
        <p className="text-sm text-gray-600 mb-4">
          We sent a verification code to <b>{phone}</b>
        </p>
        <label className="block text-sm text-gray-700 mb-4">
          6-digit code
          <input
            className="mt-2 w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          />
        </label>

        <div className="flex gap-3">
          <Btn onClick={() => handleVerify("create_profile")}>Continue</Btn>
          <button
            className="rounded-2xl px-5 py-3 font-medium bg-gray-200 text-gray-800 w-full"
            onClick={() => setScreen("signup_phone")}
          >
            Back
          </button>
        </div>
      </Card>
    );
  }

  // Create Profile
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

  // Home → render the combined Requests UI
  if (screen === "home") {
    content = (
      <div className="max-w-4xl w-full">
        {/* small signed-in header */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 text-xl">👤</span>
          </div>
          <span className="text-sm text-blue-600 font-medium">KampungKaki</span>
        </div>

        {/* the PWD requests card */}
        <RequestsShell />

        {/* account actions */}
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

  /* -------- root wrapper + single recaptcha div ---------- */
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      {content}
    </div>
  );
}
