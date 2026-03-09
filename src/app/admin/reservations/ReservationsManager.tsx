"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import type { TableReservation } from "@/app/types/table-reservation";
import type { RoomReservation } from "@/app/types/room-reservation";
import type { EventReservation } from "@/app/types/event-reservation";
import TableReservationCard from "./TableReservationCard";
import RoomReservationCard from "./RoomReservationCard";
import EventReservationCard from "./EventReservationCard";
import ConfirmModal from "../ConfirmModal";

const TYPE_TABS = [
  { key: "all", label: "Toutes", icon: "fa-solid fa-layer-group" },
  { key: "table", label: "Tables", icon: "fa-solid fa-utensils" },
  { key: "room", label: "Chambres", icon: "fa-solid fa-bed" },
  { key: "event", label: "Événements", icon: "fa-solid fa-people-group" },
] as const;

const STATUS_TABS = [
  { key: "all", label: "Toutes" },
  { key: "pending", label: "En attente" },
  { key: "confirmed", label: "Confirmé" },
  { key: "completed", label: "Terminé" },
  { key: "cancelled", label: "Annulé" },
] as const;

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

type ActiveType = "all" | "table" | "room" | "event";
type DeleteTarget = { id: string; type: "table" | "room" | "event" } | null;

type UnifiedReservation =
  | { type: "table"; data: TableReservation; createdAt: string }
  | { type: "room"; data: RoomReservation; createdAt: string }
  | { type: "event"; data: EventReservation; createdAt: string };

const VALID_TYPES: ActiveType[] = ["all", "table", "room", "event"];

export default function ReservationsManager() {
  const searchParams = useSearchParams();
  const initialType = VALID_TYPES.includes(searchParams.get("type") as ActiveType)
    ? (searchParams.get("type") as ActiveType)
    : "all";

  const [activeType, setActiveType] = useState<ActiveType>(initialType);
  const [activeStatus, setActiveStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  const [tableReservations, setTableReservations] = useState<TableReservation[]>([]);
  const [roomReservations, setRoomReservations] = useState<RoomReservation[]>([]);
  const [eventReservations, setEventReservations] = useState<EventReservation[]>([]);

  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);

    if (activeType === "all") {
      const statusParam = activeStatus !== "all" ? `status=${activeStatus}` : "";
      const [tRes, rRes, eRes] = await Promise.all([
        fetch(`/api/table-reservations${statusParam ? `?${statusParam}` : ""}`),
        fetch(`/api/room-reservations${statusParam ? `?${statusParam}` : ""}`),
        fetch(`/api/event-reservations${statusParam ? `?${statusParam}` : ""}`),
      ]);
      setTableReservations(await tRes.json());
      setRoomReservations(await rRes.json());
      setEventReservations(await eRes.json());
    } else if (activeType === "table") {
      const params = new URLSearchParams();
      if (selectedDate) params.set("date", selectedDate);
      if (activeStatus !== "all") params.set("status", activeStatus);
      const qs = params.toString();
      const res = await fetch(`/api/table-reservations${qs ? `?${qs}` : ""}`);
      setTableReservations(await res.json());
    } else if (activeType === "room") {
      let url = `/api/room-reservations`;
      if (activeStatus !== "all") url += `?status=${activeStatus}`;
      const res = await fetch(url);
      setRoomReservations(await res.json());
    } else {
      let url = `/api/event-reservations`;
      if (activeStatus !== "all") url += `?status=${activeStatus}`;
      const res = await fetch(url);
      setEventReservations(await res.json());
    }

    setLoading(false);
  }, [activeType, activeStatus, selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChangeStatus = async (id: string, status: string, type?: "table" | "room" | "event") => {
    const resolvedType = type ?? (activeType === "all" ? "table" : activeType);
    const apiMap: Record<string, string> = {
      table: "table-reservations",
      room: "room-reservations",
      event: "event-reservations",
    };
    await fetch(`/api/${apiMap[resolvedType]}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await fetchData();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const { id, type } = deleteTarget;
    setDeleteTarget(null);
    const apiMap: Record<string, string> = {
      table: "table-reservations",
      room: "room-reservations",
      event: "event-reservations",
    };
    await fetch(`/api/${apiMap[type]}/${id}`, { method: "DELETE" });
    await fetchData();
  };

  // Build unified list for "all" view
  const allReservations: UnifiedReservation[] =
    activeType === "all"
      ? [
          ...tableReservations.map((r) => ({ type: "table" as const, data: r, createdAt: r.createdAt })),
          ...roomReservations.map((r) => ({ type: "room" as const, data: r, createdAt: r.createdAt })),
          ...eventReservations.map((r) => ({ type: "event" as const, data: r, createdAt: r.createdAt })),
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      : [];

  const currentCount =
    activeType === "all"
      ? allReservations.length
      : activeType === "table"
        ? tableReservations.length
        : activeType === "room"
          ? roomReservations.length
          : eventReservations.length;

  const pendingCount =
    activeType === "all"
      ? allReservations.filter((r) => r.data.status === "pending").length
      : activeType === "table"
        ? tableReservations.filter((r) => r.status === "pending").length
        : activeType === "room"
          ? roomReservations.filter((r) => r.status === "pending").length
          : eventReservations.filter((r) => r.status === "pending").length;

  const typeLabel: Record<string, { text: string; cls: string; icon: string }> = {
    table: { text: "Table", cls: "primary", icon: "fa-solid fa-utensils" },
    room: { text: "Chambre", cls: "warning", icon: "fa-solid fa-bed" },
    event: { text: "Événement", cls: "info", icon: "fa-solid fa-people-group" },
  };

  return (
    <>
      {/* Type tabs */}
      <div className="row mb-3">
        <div className="col">
          <div className="d-flex gap-2 mb-3 flex-wrap">
            {TYPE_TABS.map((tab) => (
              <button
                key={tab.key}
                className={`btn ${activeType === tab.key ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => {
                  setActiveType(tab.key);
                  setActiveStatus("all");
                  setSelectedDate("");
                }}
              >
                <i className={`${tab.icon} me-1`}></i>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Date picker for table reservations */}
          {activeType === "table" && (
            <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
              <button
                className={`btn ${selectedDate === "" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setSelectedDate("")}
              >
                Toutes
              </button>
              <button
                className={`btn ${selectedDate === todayStr() ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setSelectedDate(todayStr())}
              >
                Aujourd&apos;hui
              </button>
              <input
                type="date"
                className="form-control"
                style={{ width: "auto" }}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          )}

          {/* Count info */}
          <div className="d-flex align-items-center gap-2 mb-3">
            <span className="text-muted">
              {currentCount} réservation{currentCount !== 1 ? "s" : ""}
            </span>
            {pendingCount > 0 && (
              <span className="badge bg-warning">{pendingCount} en attente</span>
            )}
          </div>

          {/* Status tabs */}
          <ul className="nav nav-tabs">
            {STATUS_TABS.map((tab) => (
              <li key={tab.key} className="nav-item">
                <button
                  className={`nav-link ${activeStatus === tab.key ? "active" : ""}`}
                  onClick={() => setActiveStatus(tab.key)}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        </div>
      ) : currentCount === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="fa-solid fa-calendar-xmark" style={{ fontSize: "48px", color: "#95a0c5" }}></i>
            <h5 className="mt-3">Aucune réservation</h5>
            <p className="text-muted">Aucune réservation pour ce filtre.</p>
          </div>
        </div>
      ) : (
        <div className="row">
          {/* All view — mixed cards with type badge */}
          {activeType === "all" &&
            allReservations.map((item) => {
              const t = typeLabel[item.type];
              return (
                <div key={`${item.type}-${item.data.id}`} className="col-md-6 col-lg-4">
                  <div style={{ position: "relative" }}>
                    <span
                      className={`badge bg-${t.cls}`}
                      style={{ position: "absolute", top: 12, left: 12, zIndex: 1 }}
                    >
                      <i className={`${t.icon} me-1`}></i>{t.text}
                    </span>
                    {item.type === "table" && (
                      <TableReservationCard
                        reservation={item.data}
                        onChangeStatus={(id, status) => handleChangeStatus(id, status, "table")}
                        onDelete={(id) => setDeleteTarget({ id, type: "table" })}
                      />
                    )}
                    {item.type === "room" && (
                      <RoomReservationCard
                        reservation={item.data}
                        onChangeStatus={(id, status) => handleChangeStatus(id, status, "room")}
                        onDelete={(id) => setDeleteTarget({ id, type: "room" })}
                      />
                    )}
                    {item.type === "event" && (
                      <EventReservationCard
                        reservation={item.data}
                        onChangeStatus={(id, status) => handleChangeStatus(id, status, "event")}
                        onDelete={(id) => setDeleteTarget({ id, type: "event" })}
                      />
                    )}
                  </div>
                </div>
              );
            })}

          {/* Filtered views */}
          {activeType === "table" &&
            tableReservations.map((r) => (
              <div key={r.id} className="col-md-6 col-lg-4">
                <TableReservationCard
                  reservation={r}
                  onChangeStatus={(id, status) => handleChangeStatus(id, status, "table")}
                  onDelete={(id) => setDeleteTarget({ id, type: "table" })}
                />
              </div>
            ))}
          {activeType === "room" &&
            roomReservations.map((r) => (
              <div key={r.id} className="col-md-6 col-lg-4">
                <RoomReservationCard
                  reservation={r}
                  onChangeStatus={(id, status) => handleChangeStatus(id, status, "room")}
                  onDelete={(id) => setDeleteTarget({ id, type: "room" })}
                />
              </div>
            ))}
          {activeType === "event" &&
            eventReservations.map((r) => (
              <div key={r.id} className="col-md-6 col-lg-4">
                <EventReservationCard
                  reservation={r}
                  onChangeStatus={(id, status) => handleChangeStatus(id, status, "event")}
                  onDelete={(id) => setDeleteTarget({ id, type: "event" })}
                />
              </div>
            ))}
        </div>
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        title="Supprimer la réservation"
        message="Voulez-vous vraiment supprimer cette réservation ?"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
