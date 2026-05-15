"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Types exposés par le contexte
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

interface NotificationContextValue {
  pendingOrders: number;
  pendingReservations: number;
  unreadMessages: number;
  pendingComments: number;
  lowStockCount: number;
  notifItems: NotifItem[];
}

const NotificationContext = createContext<NotificationContextValue>({
  pendingOrders: 0,
  pendingReservations: 0,
  unreadMessages: 0,
  pendingComments: 0,
  lowStockCount: 0,
  notifItems: [],
});

export function useNotifications() {
  return useContext(NotificationContext);
}

// Fournisseur : un seul polling toutes les 60s pour tous les consommateurs
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [pendingOrders, setPendingOrders] = useState(0);
  const [pendingReservations, setPendingReservations] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingComments, setPendingComments] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [notifItems, setNotifItems] = useState<NotifItem[]>([]);

  useEffect(() => {
    const safeFetch = (url: string) =>
      fetch(url).then((r) => (r.ok ? r.json() : [])).catch(() => []);

    const fetchAll = async () => {
      const [orders, tables, rooms, events, messages, comments, stockSummary] = await Promise.all([
        safeFetch("/api/orders?status=pending"),
        safeFetch("/api/table-reservations?status=pending"),
        safeFetch("/api/room-reservations?status=pending"),
        safeFetch("/api/event-reservations?status=pending"),
        safeFetch("/api/contact-messages"),
        safeFetch("/api/comments"),
        fetch("/api/stock/summary")
          .then((r) => (r.ok ? r.json() : { lowStockCount: 0 }))
          .catch(() => ({ lowStockCount: 0 })),
      ]);

      // Compteurs pour la Sidebar
      setPendingOrders(Array.isArray(orders) ? orders.length : 0);
      setPendingReservations(
        (Array.isArray(tables) ? tables.length : 0) +
        (Array.isArray(rooms) ? rooms.length : 0) +
        (Array.isArray(events) ? events.length : 0)
      );
      setUnreadMessages(
        Array.isArray(messages)
          ? messages.filter((m: { read: boolean }) => !m.read).length
          : 0
      );
      setPendingComments(
        Array.isArray(comments)
          ? comments.filter((c: { approved: boolean }) => !c.approved).length
          : 0
      );
      setLowStockCount(stockSummary?.lowStockCount || 0);

      // Items de notification pour AdminShell (cloche)
      const items: NotifItem[] = [];

      for (const o of Array.isArray(orders) ? orders : []) {
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
      for (const t of Array.isArray(tables) ? tables : []) {
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
      for (const r of Array.isArray(rooms) ? rooms : []) {
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
      for (const e of Array.isArray(events) ? events : []) {
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
      setNotifItems(items);
    };

    fetchAll();
    const interval = setInterval(fetchAll, 60000); // 60s au lieu de 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ pendingOrders, pendingReservations, unreadMessages, pendingComments, lowStockCount, notifItems }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
