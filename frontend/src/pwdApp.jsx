import { useState } from "react";
import RequestForm from "./requests/requestform.jsx";
import RequestList from "./requests/RequestList.jsx";
import "./requests/pwdIndex.css";
// remove import "./App.css"; if you don’t need the logo anymore


function ErrorBoundary({ children }) {
  try { return children; } catch (e) { return <pre style={{color:"crimson"}}>{String(e)}</pre>; }
}

function App() {
  const [view, setView] = useState("list");

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

export default App;
