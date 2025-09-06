import React from "react";
import ReactDOM from "react-dom/client";

// Use the combined root App (auth + requests shell)
//import App from "./App.jsx";
import MainApp from "./MainApp";

// Global styles used by the auth flow
import "./index.css";      // from the auth app

// UI styles used by the PWD requests shell
import "./requests/pwdIndex.css";   // from the PWD app

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MainApp />
  </React.StrictMode>
);
