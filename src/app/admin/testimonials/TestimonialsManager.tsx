"use client";

import { useState, useEffect, useCallback } from "react";
import type { Testimonial } from "@/app/types/testimonial";
import TestimonialCard from "./TestimonialCard";
import TestimonialForm from "./TestimonialForm";
import ConfirmModal from "../ConfirmModal";

export default function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchTestimonials = useCallback(async () => {
    const res = await fetch("/api/testimonials");
    const data = await res.json();
    setTestimonials(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const handleCreate = async (data: {
    text: string;
    name: string;
    role: string;
    stars: number;
    image: string | null;
    avatar: string | null;
  }) => {
    const res = await fetch("/api/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      await fetchTestimonials();
      setShowForm(false);
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingItem(testimonial);
    setShowForm(false);
  };

  const handleUpdate = async (data: {
    text: string;
    name: string;
    role: string;
    stars: number;
    image: string | null;
    avatar: string | null;
  }) => {
    if (!editingItem) return;
    const res = await fetch(`/api/testimonials/${editingItem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      await fetchTestimonials();
      setEditingItem(null);
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, active } : t))
    );
    await fetch(`/api/testimonials/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget;
    setDeleteTarget(null);
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
    await fetchTestimonials();
  };

  const reorder = async (newItems: Testimonial[]) => {
    setTestimonials(newItems);
    await fetch("/api/testimonials/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: newItems.map((t) => t.id) }),
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const arr = [...testimonials];
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    reorder(arr);
  };

  const handleMoveDown = (index: number) => {
    if (index === testimonials.length - 1) return;
    const arr = [...testimonials];
    [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
    reorder(arr);
  };

  const dragHandlers = {
    onDragStart: (_e: React.DragEvent, index: number) => {
      setDragIndex(index);
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
    },
    onDrop: (_e: React.DragEvent, dropIndex: number) => {
      if (dragIndex === null || dragIndex === dropIndex) return;
      const arr = [...testimonials];
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
          <p className="mt-3 text-muted">Chargement des avis...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="row mb-3">
        <div className="col">
          <button
            className="btn btn-primary"
            onClick={() => { setShowForm(true); setEditingItem(null); }}
            disabled={showForm}
          >
            <i className="iconoir-plus me-1"></i>
            Ajouter un avis
          </button>
          <span className="text-muted ms-3 fs-13">
            {testimonials.length} avis &bull;{" "}
            {testimonials.filter((t) => t.active).length} actif{testimonials.filter((t) => t.active).length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {showForm && (
        <TestimonialForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingItem && (
        <TestimonialForm
          testimonial={editingItem}
          onSubmit={handleUpdate}
          onCancel={() => setEditingItem(null)}
        />
      )}

      {testimonials.length === 0 && !showForm ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="iconoir-star" style={{ fontSize: "48px", color: "#95a0c5" }}></i>
            <h5 className="mt-3">Aucun avis</h5>
            <p className="text-muted">Ajoutez votre premier témoignage client.</p>
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              <i className="iconoir-plus me-1"></i>
              Ajouter un avis
            </button>
          </div>
        </div>
      ) : (
        <div className="row">
          {testimonials.map((testimonial, i) => (
            <div key={testimonial.id} className="col-md-6 col-lg-4 col-xl-3">
              <TestimonialCard
                testimonial={testimonial}
                index={i}
                onToggleActive={handleToggleActive}
                onEdit={handleEdit}
                onDelete={(id) => setDeleteTarget(id)}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                isFirst={i === 0}
                isLast={i === testimonials.length - 1}
                dragHandlers={dragHandlers}
              />
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        title="Supprimer l'avis"
        message="Cette action est irréversible. Voulez-vous vraiment supprimer cet avis ?"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
