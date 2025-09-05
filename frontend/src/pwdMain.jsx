import React from "react";
import ReactDOM from "react-dom/client";
import App from "./pwdApp.jsx";
import "./pwdIndex.css";   // <--- this is where index.css is imported

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
