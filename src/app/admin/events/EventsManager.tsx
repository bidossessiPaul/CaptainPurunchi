"use client";

import { useState, useEffect, useCallback } from "react";
import type { Event } from "@/app/types/event";
import EventCard from "./EventCard";
import EventForm from "./EventForm";
import ConfirmModal from "../ConfirmModal";

export default function EventsManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    const res = await fetch("/api/events");
    const data = await res.json();
    setEvents(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Create event
  const handleCreate = async (data: {
    featured: boolean;
    tag: string;
    title: string;
    shortDesc: string;
    description: string;
    day: string;
    month: string;
    time: string;
    location: string;
    price: string;
    thumb: string;
    gallery: string[];
    includes: string[];
  }) => {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      await fetchEvents();
      setShowForm(false);
    }
  };

  // Edit event
  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setShowForm(false);
  };

  const handleUpdate = async (data: {
    featured: boolean;
    tag: string;
    title: string;
    shortDesc: string;
    description: string;
    day: string;
    month: string;
    time: string;
    location: string;
    price: string;
    thumb: string;
    gallery: string[];
    includes: string[];
  }) => {
    if (!editingEvent) return;
    const res = await fetch(`/api/events/${editingEvent.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      await fetchEvents();
      setEditingEvent(null);
    }
  };

  // Toggle active
  const handleToggleActive = async (id: string, active: boolean) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, active } : e))
    );
    await fetch(`/api/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
  };

  // Toggle featured
  const handleToggleFeatured = async (id: string, featured: boolean) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, featured } : e))
    );
    await fetch(`/api/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured }),
    });
  };

  // Delete
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget;
    setDeleteTarget(null);
    setEvents((prev) => prev.filter((e) => e.id !== id));
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    await fetchEvents();
  };

  // Reorder
  const reorder = async (newEvents: Event[]) => {
    setEvents(newEvents);
    await fetch("/api/events/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: newEvents.map((e) => e.id) }),
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const arr = [...events];
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    reorder(arr);
  };

  const handleMoveDown = (index: number) => {
    if (index === events.length - 1) return;
    const arr = [...events];
    [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
    reorder(arr);
  };

  // Drag and drop
  const dragHandlers = {
    onDragStart: (_e: React.DragEvent, index: number) => {
      setDragIndex(index);
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
    },
    onDrop: (_e: React.DragEvent, dropIndex: number) => {
      if (dragIndex === null || dragIndex === dropIndex) return;
      const arr = [...events];
      const [dragged] = arr.splice(dragIndex, 1);
      arr.splice(dropIndex, 0, dragged);
      reorder(arr);
      setDragIndex(null);
    },
    onDragEnd: () => {
      setDragIndex(null);
    },
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3 text-muted">Chargement des événements...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Actions bar */}
      <div className="row mb-3">
        <div className="col">
          <button
            className="btn btn-primary"
            onClick={() => { setShowForm(true); setEditingEvent(null); }}
            disabled={showForm}
          >
            <i className="iconoir-plus me-1"></i>
            Ajouter un événement
          </button>
          <span className="text-muted ms-3 fs-13">
            {events.length} événement{events.length !== 1 ? "s" : ""} •{" "}
            {events.filter((e) => e.active).length} actif{events.filter((e) => e.active).length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <EventForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Edit form */}
      {editingEvent && (
        <EventForm
          event={editingEvent}
          onSubmit={handleUpdate}
          onCancel={() => setEditingEvent(null)}
        />
      )}

      {/* Events grid */}
      {events.length === 0 && !showForm ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="iconoir-community" style={{ fontSize: "48px", color: "#95a0c5" }}></i>
            <h5 className="mt-3">Aucun événement</h5>
            <p className="text-muted">Ajoutez votre premier événement.</p>
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              <i className="iconoir-plus me-1"></i>
              Ajouter un événement
            </button>
          </div>
        </div>
      ) : (
        <div className="row">
          {events.map((event, i) => (
            <div key={event.id} className="col-md-6 col-lg-4 col-xl-3">
              <EventCard
                event={event}
                index={i}
                onToggleActive={handleToggleActive}
                onToggleFeatured={handleToggleFeatured}
                onEdit={handleEdit}
                onDelete={(id) => setDeleteTarget(id)}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                isFirst={i === 0}
                isLast={i === events.length - 1}
                dragHandlers={dragHandlers}
              />
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        open={deleteTarget !== null}
        title="Supprimer l'événement"
        message="Cette action est irréversible. Voulez-vous vraiment supprimer cet événement ?"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
