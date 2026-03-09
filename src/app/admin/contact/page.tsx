"use client";

import { useState } from "react";
import ContactManager from "./ContactManager";
import MessagesManager from "./MessagesManager";

export default function ContactAdminPage() {
  const [tab, setTab] = useState<"settings" | "messages">("messages");

  return (
    <>
      <div className="row">
        <div className="col-sm-12">
          <div className="page-title-box d-md-flex justify-content-md-between align-items-center">
            <h4 className="page-title">Contact</h4>
            <div>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><a href="/admin">Admin</a></li>
                <li className="breadcrumb-item active">Contact</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-4">
        <button
          className={`btn btn-sm ${tab === "messages" ? "btn-primary" : "btn-light"}`}
          onClick={() => setTab("messages")}
        >
          <i className="fa-solid fa-inbox me-1"></i>
          Messages re&ccedil;us
        </button>
        <button
          className={`btn btn-sm ${tab === "settings" ? "btn-primary" : "btn-light"}`}
          onClick={() => setTab("settings")}
        >
          <i className="fa-solid fa-gear me-1"></i>
          Param&egrave;tres
        </button>
      </div>

      {tab === "messages" ? <MessagesManager /> : <ContactManager />}
    </>
  );
}
