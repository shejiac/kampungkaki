import { useState } from "react";
import RequestList from "../requests/RequestList.jsx";
import RequestForm from "../requests/requestform.jsx";

import "../requests/requestlist.css";
import "../requests/requestform.css";
import "../requests/pwdIndex.css";

export default function RequestsTab() {
  const [view, setView] = useState<"list" | "form">("list");
  return (
    <div>
      {view === "list" ? (
        <RequestList embed onCreate={() => setView("form")} />
      ) : (
        <RequestForm onSuccess={() => setView("list")} onCancel={() => setView("list")} />
      )}
    </div>
  );
}
