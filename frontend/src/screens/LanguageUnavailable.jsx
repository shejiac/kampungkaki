// src/screens/LanguageUnavailable.jsx
export default function LanguageUnavailable({ name, onBack }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-[360px] bg-white rounded-2xl shadow border p-6 text-center">
        <h3 className="text-lg font-semibold mb-2">Language unavailable</h3>
        <p className="text-gray-600">
          Support for <span className="font-medium">{name}</span> is coming soon.
        </p>
        <button
          onClick={onBack}
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Back
        </button>
      </div>
    </div>
  );
}
