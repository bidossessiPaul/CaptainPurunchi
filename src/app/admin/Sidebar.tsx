"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { canAccess, ROLES, type Role, type AdminPage } from "@/lib/permissions";

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
}

interface MenuItem {
  href?: string;
  icon?: string;
  label: string;
  type?: "label";
  badge?: "reservations" | "orders" | "messages" | "comments" | "stock";
  page?: AdminPage;
}

const menuItems: MenuItem[] = [
  // Général
  { label: "Général", type: "label" },
  { href: "/admin", icon: "fa-solid fa-table-columns", label: "Tableau de bord", page: "dashboard" },

  // Opérations quotidiennes
  { label: "Opérations", type: "label" },
  { href: "/admin/reservations", icon: "fa-solid fa-calendar-days", label: "Réservations", badge: "reservations", page: "reservations" },
  { href: "/admin/calendar", icon: "fa-solid fa-calendar", label: "Planning", page: "calendar" },
  { href: "/admin/orders", icon: "fa-solid fa-bag-shopping", label: "Commandes", badge: "orders", page: "orders" },
  { href: "/admin/menu", icon: "fa-solid fa-cart-shopping", label: "Notre Carte", page: "menu" },
  { href: "/admin/daily-menu", icon: "fa-solid fa-utensils", label: "Menu du Jour", page: "daily-menu" },
  { href: "/admin/stock", icon: "fa-solid fa-boxes-stacked", label: "Stock", badge: "stock", page: "stock" },
  { href: "/admin/ravitaillement", icon: "fa-solid fa-truck-field", label: "Ravitaillement", page: "ravitaillement" },

  // Comptabilité & Finance
  { label: "Comptabilité", type: "label" },
  { href: "/admin/finance", icon: "fa-solid fa-chart-line", label: "Finances", page: "finance" },
  { href: "/admin/caisse", icon: "fa-solid fa-cash-register", label: "Caisse", page: "caisse" },
  { href: "/admin/factures", icon: "fa-solid fa-file-invoice", label: "Factures", page: "factures" },

  // Contenu du site web
  { label: "Site Web", type: "label" },
  { href: "/admin/hero", icon: "fa-solid fa-images", label: "Hero Slideshow", page: "hero" },
  { href: "/admin/specialties", icon: "fa-solid fa-utensils", label: "Spécialités", page: "specialties" },
  { href: "/admin/gallery", icon: "fa-solid fa-image", label: "Galerie", page: "gallery" },
  { href: "/admin/rooms", icon: "fa-solid fa-house", label: "Chambres", page: "rooms" },
  { href: "/admin/events", icon: "fa-solid fa-people-group", label: "Événements", page: "events" },
  { href: "/admin/testimonials", icon: "fa-solid fa-star", label: "Avis", page: "testimonials" },
  { href: "/admin/blog", icon: "fa-solid fa-file-pen", label: "Blog", page: "blog" },
  { href: "/admin/comments", icon: "fa-solid fa-comments", label: "Commentaires", badge: "comments", page: "comments" },

  // Outils
  { label: "Outils", type: "label" },
  { href: "/admin/qrcode", icon: "fa-solid fa-qrcode", label: "QR Codes", page: "qrcode" },

  // Administration
  { label: "Administration", type: "label" },
  { href: "/admin/contact", icon: "fa-solid fa-envelope", label: "Messages", badge: "messages", page: "contact" },
  { href: "/admin/team", icon: "fa-solid fa-users-gear", label: "Équipe", page: "team" },
  { href: "/admin/activity", icon: "fa-solid fa-clock-rotate-left", label: "Journal d'activité", page: "activity" },
];

export default function Sidebar({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingOrders, setPendingOrders] = useState(0);
  const [pendingReservations, setPendingReservations] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingComments, setPendingComments] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setUser(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const safeFetch = (url: string) =>
      fetch(url).then((r) => (r.ok ? r.json() : [])).catch(() => []);

    const fetchPending = async () => {
      const [orders, tables, rooms, events, messages, comments, stockSummary] = await Promise.all([
        safeFetch("/api/orders?status=pending"),
        safeFetch("/api/table-reservations?status=pending"),
        safeFetch("/api/room-reservations?status=pending"),
        safeFetch("/api/event-reservations?status=pending"),
        safeFetch("/api/contact-messages"),
        safeFetch("/api/comments"),
        fetch("/api/stock/summary").then((r) => r.ok ? r.json() : { lowStockCount: 0 }).catch(() => ({ lowStockCount: 0 })),
      ]);
      setPendingOrders(Array.isArray(orders) ? orders.length : 0);
      setPendingReservations(
        (Array.isArray(tables) ? tables.length : 0) +
        (Array.isArray(rooms) ? rooms.length : 0) +
        (Array.isArray(events) ? events.length : 0)
      );
      setUnreadMessages(Array.isArray(messages) ? messages.filter((m: { read: boolean }) => !m.read).length : 0);
      setPendingComments(Array.isArray(comments) ? comments.filter((c: { approved: boolean }) => !c.approved).length : 0);
      setLowStockCount(stockSummary?.lowStockCount || 0);
    };

    fetchPending();
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, []);

  const userRole = user?.role || "staff";

  // Filter menu items based on role permissions
  const filteredItems = menuItems.filter((item) => {
    if (item.type === "label") return true;
    if (!item.page) return true;
    return canAccess(userRole, item.page);
  });

  // Remove section labels that have no visible items after them
  const visibleItems = filteredItems.filter((item, i) => {
    if (item.type !== "label") return true;
    // Check if there's at least one non-label item before the next label
    for (let j = i + 1; j < filteredItems.length; j++) {
      if (filteredItems[j].type === "label") return false;
      return true;
    }
    return false;
  });

  const initials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const roleLabel = (role: string) => ROLES[role as Role] || role;

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
              {visibleItems.map((item, i) => {
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

                const badgeCount = item.badge === "orders" ? pendingOrders : item.badge === "reservations" ? pendingReservations : item.badge === "messages" ? unreadMessages : item.badge === "comments" ? pendingComments : item.badge === "stock" ? lowStockCount : 0;

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

            {/* User info + logout */}
            <div className="sidebar-bottom w-100" style={{ borderTop: "1px solid #e9ecef" }}>
              {user && (
                <Link
                  href="/admin/profile"
                  onClick={onClose}
                  className="sidebar-user-link"
                  style={{ padding: "12px 20px", display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f9fa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #5BC0EB, #3a9cc7)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {initials(user.name)}
                    </div>
                  )}
                  <div className="sidebar-user-text" style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#1a3a5c", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {user.name}
                    </div>
                    <div style={{ fontSize: "11px", color: "#8a92a6" }}>
                      {roleLabel(user.role)}
                    </div>
                  </div>
                </Link>
              )}
              <div className="sidebar-logout-wrap" style={{ padding: "0 20px 16px" }}>
                <button
                  onClick={async () => {
                    await fetch("/api/auth/logout", { method: "POST" });
                    router.push("/admin/login");
                    router.refresh();
                  }}
                  className="sidebar-logout-btn"
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
                  <span className="sidebar-logout-text">Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
