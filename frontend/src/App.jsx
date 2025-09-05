import { useEffect, useState } from "react";
import "./index.css";
import { startPhoneSignIn, auth, logoutFirebase } from "./firebase";
import { getMe, updateMe } from "./api";

/* ------------------- tiny UI helpers ------------------- */
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

/* --------------------- utils --------------------------- */
const asE164 = (s) => (!s ? "" : s.startsWith("+") ? s : `+${s}`);

// prefer Firebase phoneNumber, fall back to cached
const getSignedInPhone = () =>
  auth.currentUser?.phoneNumber || localStorage.getItem("kk_phone") || "";

/* ----------------------- app --------------------------- */
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
        phone: p,                // <-- REQUIRED by the backend
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

  // Home / Dashboard
  if (screen === "home") {
    content = (
      <div className="max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 text-xl">👤</span>
          </div>
          <span className="text-sm text-blue-600 font-medium">KampungKaki</span>
        </div>

        <Card>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Volunteers", value: 0 },
              { label: "Requests", value: 0 },
              { label: "Helped", value: 0 },
            ].map((it) => (
              <div
                key={it.label}
                className="rounded-xl border bg-white px-4 py-3 text-center"
              >
                <div className="text-blue-600 font-bold text-xl">{it.value}</div>
                <div className="text-xs text-gray-500">{it.label}</div>
              </div>
            ))}
          </div>

          <h2 className="mt-6 mb-2 font-semibold">Welcome</h2>
          <p className="text-sm text-gray-600">
            Logged in as <b>{user?.phone || phone}</b>
          </p>

          <div className="mt-6 space-y-3">
            <button
              className="w-full rounded-2xl px-5 py-3 font-medium bg-gray-200 text-gray-800"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </Card>
      </div>
    );
  }

  /* -------- root wrapper + single recaptcha div ---------- */
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      {content}

      {/* One hidden container for Firebase reCAPTCHA */}
      <div
        id="recaptcha-container"
        style={{ height: 0, width: 0, overflow: "hidden" }}
      />
    </div>
  );
}
