"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

interface NotifItem {
  id: string;
  type: "order" | "table" | "room" | "event";
  label: string;
  sub: string;
  icon: string;
  color: string;
  href: string;
  time: string;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarSize, setSidebarSize] = useState<"default" | "collapsed">("default");
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [user, setUser] = useState<UserInfo | null>(null);
  const notifRef = useRef<HTMLLIElement>(null);
  const isLoginPage = pathname === "/admin/login";

  // Fetch current user
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setUser(data); })
      .catch(() => {});
  }, []);

  // On mobile start collapsed, on desktop start default
  useEffect(() => {
    if (window.innerWidth < 1200) {
      setSidebarSize("collapsed");
    }
  }, []);

  // Sync data-sidebar-size to body
  useEffect(() => {
    document.body.setAttribute("data-sidebar-size", sidebarSize);
  }, [sidebarSize]);

  const toggleSidebar = useCallback(() => {
    setSidebarSize((prev) => (prev === "collapsed" ? "default" : "collapsed"));
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarSize("collapsed");
  }, []);

  // Fetch pending notifications
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const [orders, tables, rooms, events] = await Promise.all([
          fetch("/api/orders?status=pending").then((r) => r.json()),
          fetch("/api/table-reservations?status=pending").then((r) => r.json()),
          fetch("/api/room-reservations?status=pending").then((r) => r.json()),
          fetch("/api/event-reservations?status=pending").then((r) => r.json()),
        ]);

        const items: NotifItem[] = [];

        for (const o of orders) {
          items.push({
            id: o.id,
            type: "order",
            label: o.customerName,
            sub: `${o.items?.length ?? 0} article(s) — ${o.totalAmount} FCFA`,
            icon: "fa-solid fa-bag-shopping",
            color: "info",
            href: "/admin/orders",
            time: o.createdAt,
          });
        }
        for (const t of tables) {
          items.push({
            id: t.id,
            type: "table",
            label: t.name,
            sub: `Table — ${t.numberOfPersons} pers.`,
            icon: "fa-solid fa-utensils",
            color: "primary",
            href: "/admin/reservations?type=table",
            time: t.createdAt,
          });
        }
        for (const r of rooms) {
          items.push({
            id: r.id,
            type: "room",
            label: r.customerName,
            sub: `Chambre — ${r.roomName}`,
            icon: "fa-solid fa-bed",
            color: "warning",
            href: "/admin/reservations?type=room",
            time: r.createdAt,
          });
        }
        for (const e of events) {
          items.push({
            id: e.id,
            type: "event",
            label: e.customerName,
            sub: `Événement — ${e.eventTitle}`,
            icon: "fa-solid fa-people-group",
            color: "danger",
            href: "/admin/reservations?type=event",
            time: e.createdAt,
          });
        }

        items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        setNotifications(items);
      } catch {}
    };

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "À l'instant";
    if (mins < 60) return `il y a ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `il y a ${hrs}h`;
    return `il y a ${Math.floor(hrs / 24)}j`;
  };

  // Login page: render children only, no shell
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div data-startbar="light" data-bs-theme="light">
      {/* Top Bar */}
      <div className="topbar d-print-none">
        <div className="container-fluid">
          <nav className="topbar-custom d-flex justify-content-between" id="topbar-custom">
            <ul className="topbar-item list-unstyled d-inline-flex align-items-center mb-0">
              <li>
                <button
                  className="nav-link mobile-menu-btn nav-icon"
                  onClick={toggleSidebar}
                >
                  <i className="fa-solid fa-bars"></i>
                </button>
              </li>
              <li className="mx-3 welcome-text">
                <span
                  className="mb-0 text-truncate"
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    letterSpacing: "1px",
                    color: "#1a3a5c",
                    fontFamily: "'nautilus_pompiliusregular', serif",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  Captain{" "}
                  <span
                    style={{
                      background: "linear-gradient(135deg, #5BC0EB, #3a9cc7)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Purunchi
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontFamily: "'Roboto', sans-serif",
                      fontWeight: 600,
                      color: "#fff",
                      background: "linear-gradient(135deg, #5BC0EB, #3a9cc7)",
                      padding: "3px 8px",
                      borderRadius: "4px",
                      letterSpacing: "0.5px",
                      lineHeight: 1,
                      marginLeft: "2px",
                    }}
                  >
                    ADMIN
                  </span>
                </span>
              </li>
            </ul>
            <ul className="topbar-item list-unstyled d-inline-flex align-items-center mb-0">
              <li className="topbar-item">
                <Link
                  href="/"
                  className="d-inline-flex align-items-center"
                  style={{
                    background: "linear-gradient(135deg, #5BC0EB, #3a9cc7)",
                    color: "#fff",
                    padding: "6px 16px",
                    borderRadius: "50px",
                    fontWeight: 600,
                    fontSize: "13px",
                    textDecoration: "none",
                    boxShadow: "0 2px 8px rgba(91, 192, 235, 0.3)",
                    transition: "all 0.25s ease",
                    gap: "6px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#1a3a5c";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "linear-gradient(135deg, #5BC0EB, #3a9cc7)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <i className="fa-solid fa-up-right-from-square" style={{ fontSize: "11px" }}></i>
                  Voir le site
                </Link>
              </li>
              <li className="dropdown topbar-item" ref={notifRef} style={{ position: "relative" }}>
                <button
                  className="nav-link nav-icon"
                  onClick={() => setNotifOpen((p) => !p)}
                  style={{ position: "relative", background: "none", border: "none", cursor: "pointer" }}
                >
                  <i className="fa-solid fa-bell"></i>
                  {notifications.length > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 2,
                        background: "#dc3545",
                        color: "#fff",
                        fontSize: "10px",
                        fontWeight: 700,
                        minWidth: "18px",
                        height: "18px",
                        borderRadius: "50px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 5px",
                        lineHeight: 1,
                      }}
                    >
                      {notifications.length}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 4px)",
                      right: -12,
                      width: 320,
                      maxHeight: 400,
                      background: "#fff",
                      borderRadius: 10,
                      boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
                      border: "1px solid #e9ecef",
                      zIndex: 1050,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        padding: "10px 14px",
                        borderBottom: "1px solid #eee",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "#f8f9fa",
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#1a3a5c" }}>
                        <i className="fa-solid fa-bell me-1" style={{ fontSize: 12 }}></i>
                        Notifications
                      </span>
                      {notifications.length > 0 && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#dc3545",
                            background: "rgba(220,53,69,0.1)",
                            padding: "2px 8px",
                            borderRadius: 20,
                          }}
                        >
                          {notifications.length} en attente
                        </span>
                      )}
                    </div>

                    <div style={{ maxHeight: 300, overflowY: "auto" }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: "28px 16px", textAlign: "center" }}>
                          <i className="fa-solid fa-circle-check" style={{ fontSize: 28, color: "#28a745" }}></i>
                          <p style={{ margin: "10px 0 0", color: "#6c757d", fontSize: 13 }}>Tout est à jour !</p>
                        </div>
                      ) : (
                        notifications.slice(0, 8).map((n) => (
                          <Link
                            key={`${n.type}-${n.id}`}
                            href={n.href}
                            onClick={() => setNotifOpen(false)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "10px 14px",
                              textDecoration: "none",
                              color: "inherit",
                              borderBottom: "1px solid #f5f5f5",
                              transition: "background 0.15s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f9fa")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <div
                              className={`flex-shrink-0 bg-${n.color}-subtle text-${n.color}`}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 13,
                              }}
                            >
                              <i className={n.icon}></i>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 600, fontSize: 12, color: "#1a3a5c" }}>{n.label}</div>
                              <div style={{ fontSize: 11, color: "#8a92a6", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {n.sub}
                              </div>
                            </div>
                            <span style={{ fontSize: 10, color: "#b0b7c3", whiteSpace: "nowrap" }}>
                              {timeAgo(n.time)}
                            </span>
                          </Link>
                        ))
                      )}
                    </div>

                    {notifications.length > 0 && (
                      <div style={{ padding: "8px 14px", borderTop: "1px solid #eee", textAlign: "center", background: "#f8f9fa" }}>
                        <Link
                          href="/admin/reservations"
                          onClick={() => setNotifOpen(false)}
                          style={{ fontSize: 12, fontWeight: 600, color: "#5BC0EB", textDecoration: "none" }}
                        >
                          Voir tout <i className="fa-solid fa-arrow-right ms-1" style={{ fontSize: 10 }}></i>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </li>
              <li className="dropdown topbar-item">
                <Link
                  href="/admin/profile"
                  className="nav-link dropdown-toggle arrow-none nav-icon"
                  title="Mon profil"
                >
                  <div className="d-flex align-items-center">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="thumb-md rounded-circle"
                        style={{ objectFit: "cover", width: 36, height: 36 }}
                      />
                    ) : (
                      <div
                        className="flex-shrink-0 thumb-md rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          background: "linear-gradient(135deg, #5BC0EB, #3a9cc7)",
                          color: "#fff",
                          width: 36,
                          height: 36,
                        }}
                      >
                        <span className="fw-bold" style={{ fontSize: 13 }}>
                          {user ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "A"}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar onClose={closeSidebar} />
      <div className="startbar-overlay d-print-none" onClick={closeSidebar} />

      {/* Page Content */}
      <div className="page-wrapper">
        <div className="page-content">
          <div className="container-fluid">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
