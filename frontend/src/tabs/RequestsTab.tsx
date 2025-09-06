import React, { useState } from "react";
import RequestForm from "../requests/requestform.jsx";
import RequestList from "../requests/RequestList.jsx";

type Props = {
  requesterId?: string;
  embed?: boolean;
  onCreate?: () => void; // this is for RequestsTab's own callback (optional)
};

export default function RequestsTab({ requesterId, embed = true, onCreate }: Props) {
  const [view, setView] = useState<"list" | "form">("list");

  return (
    <div>
      {view === "list" ? (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <h2 style={{ fontWeight: 700 }}>My Requests</h2>
            <button className="btn primary" onClick={() => setView("form")}>
              Create request
            </button>
          </div>

          {/* ✅ give RequestList the required onCreate prop */}
          <RequestList
            embed={embed}
            onCreate={() => {
              // no-op or open the form / refresh
              // setView("form")
            }}
          />
        </>
      ) : (
        <RequestForm
          requesterId={requesterId || ""}
          onSuccess={() => {
            setView("list");
            onCreate?.();
          }}
          onCancel={() => setView("list")}
        />
      )}
    </div>
  );
}
