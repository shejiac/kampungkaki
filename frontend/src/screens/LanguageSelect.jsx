// src/screens/LanguageSelect.jsx
export default function LanguageSelect({ onEnglish, onUnavailable, onBack }) {
  const Btn = ({ children, onClick }) => (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl shadow border px-4 py-3 text-left text-gray-700 hover:shadow-md transition"
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-[360px] mx-auto p-6">
        <h2 className="text-center text-xl font-semibold text-blue-600 mb-8">
          Select a language
        </h2>

        <div className="space-y-4">
          <Btn onClick={onEnglish}>English</Btn>
          <Btn onClick={() => onUnavailable("中文")}>中文</Btn>
          <Btn onClick={() => onUnavailable("Melayu")}>Melayu</Btn>
          <Btn onClick={() => onUnavailable("தமிழ்")}>தமிழ்</Btn>
        </div>

        <div className="mt-6 text-center">
          <button onClick={onBack} className="text-sm text-gray-500 hover:underline">
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
