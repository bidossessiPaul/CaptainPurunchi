"use client";

import { useState, useEffect, useCallback } from "react";
import type { Room } from "@/app/types/room";
import RoomCard from "./RoomCard";
import RoomForm from "./RoomForm";
import ConfirmModal from "../ConfirmModal";

export default function RoomsManager() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    const res = await fetch("/api/rooms");
    const data = await res.json();
    setRooms(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Create room
  const handleCreate = async (data: {
    name: string;
    shortDesc: string;
    price: string;
    thumb: string;
    capacity: string;
    features: string[];
    description: string;
    gallery: string[];
  }) => {
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      await fetchRooms();
      setShowForm(false);
    }
  };

  // Edit room
  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setShowForm(false);
  };

  const handleUpdate = async (data: {
    name: string;
    shortDesc: string;
    price: string;
    thumb: string;
    capacity: string;
    features: string[];
    description: string;
    gallery: string[];
  }) => {
    if (!editingRoom) return;
    const res = await fetch(`/api/rooms/${editingRoom.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      await fetchRooms();
      setEditingRoom(null);
    }
  };

  // Toggle active
  const handleToggleActive = async (id: string, active: boolean) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active } : r))
    );
    await fetch(`/api/rooms/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
  };

  // Delete
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget;
    setDeleteTarget(null);
    setRooms((prev) => prev.filter((r) => r.id !== id));
    await fetch(`/api/rooms/${id}`, { method: "DELETE" });
    await fetchRooms();
  };

  // Reorder
  const reorder = async (newRooms: Room[]) => {
    setRooms(newRooms);
    await fetch("/api/rooms/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: newRooms.map((r) => r.id) }),
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const arr = [...rooms];
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    reorder(arr);
  };

  const handleMoveDown = (index: number) => {
    if (index === rooms.length - 1) return;
    const arr = [...rooms];
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
      const arr = [...rooms];
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
          <p className="mt-3 text-muted">Chargement des chambres...</p>
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
            onClick={() => { setShowForm(true); setEditingRoom(null); }}
            disabled={showForm}
          >
            <i className="iconoir-plus me-1"></i>
            Ajouter une chambre
          </button>
          <span className="text-muted ms-3 fs-13">
            {rooms.length} chambre{rooms.length !== 1 ? "s" : ""} •{" "}
            {rooms.filter((r) => r.active).length} active{rooms.filter((r) => r.active).length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <RoomForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Edit form */}
      {editingRoom && (
        <RoomForm
          room={editingRoom}
          onSubmit={handleUpdate}
          onCancel={() => setEditingRoom(null)}
        />
      )}

      {/* Rooms grid */}
      {rooms.length === 0 && !showForm ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="iconoir-home-alt" style={{ fontSize: "48px", color: "#95a0c5" }}></i>
            <h5 className="mt-3">Aucune chambre</h5>
            <p className="text-muted">Ajoutez votre première chambre.</p>
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              <i className="iconoir-plus me-1"></i>
              Ajouter une chambre
            </button>
          </div>
        </div>
      ) : (
        <div className="row">
          {rooms.map((room, i) => (
            <div key={room.id} className="col-md-6 col-lg-4 col-xl-3">
              <RoomCard
                room={room}
                index={i}
                onToggleActive={handleToggleActive}
                onEdit={handleEdit}
                onDelete={(id) => setDeleteTarget(id)}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                isFirst={i === 0}
                isLast={i === rooms.length - 1}
                dragHandlers={dragHandlers}
              />
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        open={deleteTarget !== null}
        title="Supprimer la chambre"
        message="Cette action est irréversible. Voulez-vous vraiment supprimer cette chambre ?"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
