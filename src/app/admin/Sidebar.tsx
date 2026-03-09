"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const menuItems = [
  { label: "Navigation", type: "label" as const },
  { href: "/admin", icon: "fa-solid fa-table-columns", label: "Tableau de bord" },
  { href: "/admin/reservations", icon: "fa-solid fa-calendar-days", label: "Réservations", badge: "reservations" as const },
  { href: "/admin/menu", icon: "fa-solid fa-cart-shopping", label: "Notre Carte" },
  { href: "/admin/daily-menu", icon: "fa-solid fa-utensils", label: "Menu du Jour" },
  { href: "/admin/orders", icon: "fa-solid fa-bag-shopping", label: "Commandes", badge: "orders" as const },
  { label: "Contenu", type: "label" as const },
  { href: "/admin/hero", icon: "fa-solid fa-images", label: "Hero Slideshow" },
  { href: "/admin/specialties", icon: "fa-solid fa-utensils", label: "Spécialités" },
  { href: "/admin/gallery", icon: "fa-solid fa-image", label: "Galerie" },
  { href: "/admin/rooms", icon: "fa-solid fa-house", label: "Chambres" },
  { href: "/admin/events", icon: "fa-solid fa-people-group", label: "Événements" },
  { href: "/admin/testimonials", icon: "fa-solid fa-star", label: "Avis" },
  { href: "/admin/blog", icon: "fa-solid fa-file-pen", label: "Blog" },
  { href: "/admin/comments", icon: "fa-solid fa-comments", label: "Commentaires", badge: "comments" as const },
  { label: "Paramètres", type: "label" as const },
  { href: "/admin/contact", icon: "fa-solid fa-envelope", label: "Messages & Contact", badge: "messages" as const },
];

export default function Sidebar({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingOrders, setPendingOrders] = useState(0);
  const [pendingReservations, setPendingReservations] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingComments, setPendingComments] = useState(0);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const [orders, tables, rooms, events, messages, comments] = await Promise.all([
          fetch("/api/orders?status=pending").then((r) => r.json()),
          fetch("/api/table-reservations?status=pending").then((r) => r.json()),
          fetch("/api/room-reservations?status=pending").then((r) => r.json()),
          fetch("/api/event-reservations?status=pending").then((r) => r.json()),
          fetch("/api/contact-messages").then((r) => r.json()),
          fetch("/api/comments").then((r) => r.json()),
        ]);
        setPendingOrders(orders.length);
        setPendingReservations(tables.length + rooms.length + events.length);
        setUnreadMessages(Array.isArray(messages) ? messages.filter((m: { read: boolean }) => !m.read).length : 0);
        setPendingComments(Array.isArray(comments) ? comments.filter((c: { approved: boolean }) => !c.approved).length : 0);
      } catch {}
    };

    fetchPending();
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="startbar d-print-none">
      {/* Brand */}
      <div className="brand">
        <Link href="/admin" className="logo">
          <span>
            <img
              src="/images%20captain/logo%20normal.png"
              alt="Captain Purunchi"
              className="logo-lg logo-dark"
              style={{ height: "60px", marginLeft: "10px" }}
            />
            <img
              src="/images%20captain/logo%20pour%20fond%20noir.png"
              alt="Captain Purunchi"
              className="logo-lg logo-light"
              style={{ height: "60px", marginLeft: "10px" }}
            />
          </span>
        </Link>
      </div>

      {/* Menu */}
      <div className="startbar-menu">
        <div className="startbar-collapse" id="startbarCollapse">
          <div className="d-flex align-items-start flex-column w-100">
            <ul className="navbar-nav mb-auto w-100">
              {menuItems.map((item, i) => {
                if (item.type === "label") {
                  return (
                    <li key={i} className="menu-label mt-2">
                      <small className="label-border">
                        <div className="border_left hidden-xs"></div>
                        <div className="border_right"></div>
                      </small>
                      <span>{item.label}</span>
                    </li>
                  );
                }

                const isActive = item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href!);

                const badgeCount = item.badge === "orders" ? pendingOrders : item.badge === "reservations" ? pendingReservations : item.badge === "messages" ? unreadMessages : item.badge === "comments" ? pendingComments : 0;

                return (
                  <li key={i} className="nav-item">
                    <Link
                      href={item.href!}
                      className={`nav-link${isActive ? " active" : ""}`}
                      onClick={onClose}
                      style={{ position: "relative" }}
                    >
                      <i className={`${item.icon} menu-icon`} style={{ position: "relative" }}>
                        {badgeCount > 0 && (
                          <span
                            style={{
                              position: "absolute",
                              top: "-6px",
                              right: "-8px",
                              background: "#dc3545",
                              color: "#fff",
                              fontSize: "10px",
                              fontWeight: 700,
                              lineHeight: 1,
                              minWidth: "16px",
                              height: "16px",
                              borderRadius: "50px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "0 4px",
                              fontStyle: "normal",
                            }}
                          >
                            {badgeCount}
                          </span>
                        )}
                      </i>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="w-100" style={{ padding: "16px 20px", borderTop: "1px solid #e9ecef" }}>
              <button
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  router.push("/admin/login");
                  router.refresh();
                }}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "rgba(220,53,69,0.1)",
                  color: "#dc3545",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(220,53,69,0.2)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(220,53,69,0.1)")}
              >
                <i className="fa-solid fa-right-from-bracket"></i>
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
