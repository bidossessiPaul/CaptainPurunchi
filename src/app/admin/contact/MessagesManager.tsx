"use client";

import { useState, useEffect, useCallback } from "react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function MessagesManager() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    const res = await fetch("/api/contact-messages");
    const data = await res.json();
    setMessages(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const toggleRead = async (msg: ContactMessage) => {
    await fetch(`/api/contact-messages/${msg.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: !msg.read }),
    });
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, read: !m.read } : m))
    );
  };

  const deleteMessage = async (id: string) => {
    setDeleting(id);
    await fetch(`/api/contact-messages/${id}`, { method: "DELETE" });
    setMessages((prev) => prev.filter((m) => m.id !== id));
    setDeleting(null);
    if (expandedId === id) setExpandedId(null);
  };

  const markAllRead = async () => {
    const unread = messages.filter((m) => !m.read);
    await Promise.all(
      unread.map((m) =>
        fetch(`/api/contact-messages/${m.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ read: true }),
        })
      )
    );
    setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
  };

  const filtered = messages.filter((m) => {
    if (filter === "unread") return !m.read;
    if (filter === "read") return m.read;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.read).length;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3 text-muted">Chargement des messages...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="admin-header">
        <div>
          <div className="admin-stats-bar">
            <span className="admin-stat-badge stat-total">
              <i className="fa-solid fa-envelope"></i> {messages.length} message{messages.length !== 1 ? "s" : ""}
            </span>
            {unreadCount > 0 && (
              <span className="admin-stat-badge" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                <i className="fa-solid fa-circle-exclamation"></i> {unreadCount} non lu{unreadCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <select
            className="form-select form-select-sm"
            style={{ width: "auto" }}
            value={filter}
            onChange={(e) => setFilter(e.target.value as "all" | "unread" | "read")}
          >
            <option value="all">Tous</option>
            <option value="unread">Non lus</option>
            <option value="read">Lus</option>
          </select>
          {unreadCount > 0 && (
            <button className="btn btn-sm btn-outline-primary" onClick={markAllRead}>
              <i className="fa-solid fa-check-double me-1"></i>
              Tout marquer lu
            </button>
          )}
        </div>
      </div>

      {/* Messages list */}
      {filtered.length === 0 ? (
        <div className="admin-empty-state">
          <div className="empty-icon">
            <i className="fa-solid fa-envelope-open"></i>
          </div>
          <h5>Aucun message</h5>
          <p>
            {filter === "unread"
              ? "Tous les messages ont été lus."
              : filter === "read"
              ? "Aucun message lu."
              : "Aucun message reçu pour le moment."}
          </p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {filtered.map((msg) => (
            <div
              key={msg.id}
              className="card"
              style={{
                borderLeft: msg.read ? "3px solid #e2e8f0" : "3px solid #5BC0EB",
                marginBottom: 0,
              }}
            >
              <div
                className="card-body"
                style={{ cursor: "pointer", padding: "16px 20px" }}
                onClick={() => {
                  setExpandedId(expandedId === msg.id ? null : msg.id);
                  if (!msg.read) toggleRead(msg);
                }}
              >
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      {!msg.read && (
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#5BC0EB",
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <strong style={{ fontSize: 15, color: msg.read ? "#64748b" : "#1e293b" }}>
                        {msg.name}
                      </strong>
                      {msg.subject && (
                        <span style={{ fontSize: 13, color: "#94a3b8" }}>— {msg.subject}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: "#94a3b8", display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <span><i className="fa-solid fa-phone" style={{ fontSize: 11 }}></i> {msg.phone}</span>
                      {msg.email && <span><i className="fa-solid fa-envelope" style={{ fontSize: 11 }}></i> {msg.email}</span>}
                    </div>
                    {expandedId !== msg.id && (
                      <p style={{ fontSize: 13, color: "#64748b", margin: "6px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 500 }}>
                        {msg.message}
                      </p>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}>
                    {formatDate(msg.createdAt)}
                  </span>
                </div>

                {/* Expanded content */}
                {expandedId === msg.id && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f1f5f9" }}>
                    <p style={{ fontSize: 14, color: "#1e293b", whiteSpace: "pre-wrap", lineHeight: 1.6, margin: 0 }}>
                      {msg.message}
                    </p>
                    <div className="d-flex gap-2 mt-3">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={(e) => { e.stopPropagation(); toggleRead(msg); }}
                      >
                        <i className={`fa-solid ${msg.read ? "fa-envelope" : "fa-envelope-open"} me-1`}></i>
                        {msg.read ? "Non lu" : "Lu"}
                      </button>
                      {msg.phone && (
                        <a
                          href={`tel:${msg.phone}`}
                          className="btn btn-sm btn-outline-primary"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <i className="fa-solid fa-phone me-1"></i>
                          Appeler
                        </a>
                      )}
                      {msg.email && (
                        <a
                          href={`mailto:${msg.email}`}
                          className="btn btn-sm btn-outline-primary"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <i className="fa-solid fa-envelope me-1"></i>
                          Email
                        </a>
                      )}
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={(e) => { e.stopPropagation(); deleteMessage(msg.id); }}
                        disabled={deleting === msg.id}
                      >
                        <i className="fa-solid fa-trash me-1"></i>
                        {deleting === msg.id ? "..." : "Supprimer"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
