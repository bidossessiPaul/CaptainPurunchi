"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { HeroSlide } from "@/app/types/hero";
import SlideCard from "./SlideCard";
import ConfirmModal from "../ConfirmModal";

export default function HeroManager() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSlides = useCallback(async () => {
    const res = await fetch("/api/hero");
    const data = await res.json();
    setSlides(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const uploadRes = await fetch("/api/hero/upload", {
      method: "POST",
      body: formData,
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.json();
      alert(err.error || "Erreur lors de l'upload");
      setUploading(false);
      return;
    }

    const { src } = await uploadRes.json();

    const createRes = await fetch("/api/hero", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ src }),
    });

    if (createRes.ok) {
      await fetchSlides();
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    setSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active } : s))
    );
    await fetch(`/api/hero/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTarget(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget;
    setDeleteTarget(null);
    setSlides((prev) => prev.filter((s) => s.id !== id));
    await fetch(`/api/hero/${id}`, { method: "DELETE" });
    await fetchSlides();
  };

  const reorder = async (newSlides: HeroSlide[]) => {
    setSlides(newSlides);
    await fetch("/api/hero/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: newSlides.map((s) => s.id) }),
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const arr = [...slides];
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    reorder(arr);
  };

  const handleMoveDown = (index: number) => {
    if (index === slides.length - 1) return;
    const arr = [...slides];
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
      const arr = [...slides];
      const [dragged] = arr.splice(dragIndex, 1);
      arr.splice(dropIndex, 0, dragged);
      reorder(arr);
      setDragIndex(null);
    },
    onDragEnd: () => {
      setDragIndex(null);
    },
  };

  const activeCount = slides.filter((s) => s.active).length;
  const inactiveCount = slides.length - activeCount;

  if (loading) {
    return (
      <div className="card">
        <div className="card-body admin-loading">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p>Chargement des slides...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header bar with stats */}
      <div className="admin-header">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="d-none"
            onChange={handleUpload}
          />
          <button
            className="btn btn-primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Upload en cours...
              </>
            ) : (
              <>
                <i className="iconoir-plus me-2"></i>
                Ajouter un slide
              </>
            )}
          </button>

          <div className="admin-stats-bar">
            <span className="admin-stat-badge stat-total">
              <i className="iconoir-media-image-list"></i>
              {slides.length} slide{slides.length !== 1 ? "s" : ""}
            </span>
            <span className="admin-stat-badge stat-active">
              <i className="iconoir-check-circle"></i>
              {activeCount} actif{activeCount !== 1 ? "s" : ""}
            </span>
            {inactiveCount > 0 && (
              <span className="admin-stat-badge stat-inactive">
                <i className="iconoir-xmark-circle"></i>
                {inactiveCount} inactif{inactiveCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Slides grid */}
      {slides.length === 0 ? (
        <div className="card">
          <div className="card-body admin-empty-state">
            <div className="empty-icon">
              <i className="iconoir-media-image-list"></i>
            </div>
            <h5>Aucun slide</h5>
            <p>Ajoutez votre première image pour le hero slideshow.</p>
            <button
              className="btn btn-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              <i className="iconoir-plus me-2"></i>
              Ajouter un slide
            </button>
          </div>
        </div>
      ) : (
        <div className="row">
          {slides.map((slide, i) => (
            <div key={slide.id} className="col-sm-6 col-lg-4 col-xl-3">
              <SlideCard
                slide={slide}
                index={i}
                onToggleActive={handleToggleActive}
                onDelete={handleDeleteClick}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                isFirst={i === 0}
                isLast={i === slides.length - 1}
                dragHandlers={dragHandlers}
              />
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        title="Supprimer le slide"
        message="Cette action est irréversible. Voulez-vous vraiment supprimer ce slide ?"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
