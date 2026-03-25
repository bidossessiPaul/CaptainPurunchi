"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { GalleryImage } from "@/app/types/gallery";
import GalleryCard from "./GalleryCard";
import ConfirmModal from "../ConfirmModal";

export default function GalleryManager() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = useCallback(async () => {
    const res = await fetch("/api/gallery");
    const data = await res.json();
    setImages(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Upload multiple images
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress({ done: 0, total: files.length });
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/gallery/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          errors.push(`${file.name}: ${err.error || "Erreur"}`);
          setUploadProgress((p) => ({ ...p, done: p.done + 1 }));
          continue;
        }

        const { src, type } = await uploadRes.json();

        await fetch("/api/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ src, alt: "", type }),
        });
      } catch {
        errors.push(`${file.name}: Erreur réseau`);
      }
      setUploadProgress((p) => ({ ...p, done: p.done + 1 }));
    }

    await fetchImages();
    setUploading(false);
    setUploadProgress({ done: 0, total: 0 });
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (errors.length > 0) {
      alert(`${errors.length} erreur(s) :\n${errors.join("\n")}`);
    }
  };

  // Toggle active
  const handleToggleActive = async (id: string, active: boolean) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, active } : img))
    );

    await fetch(`/api/gallery/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
  };

  // Update alt text
  const handleUpdateAlt = async (id: string, alt: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, alt } : img))
    );

    await fetch(`/api/gallery/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alt }),
    });
  };

  // Delete
  const handleDeleteClick = (id: string) => {
    setDeleteTarget(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget;
    setDeleteTarget(null);

    setImages((prev) => prev.filter((img) => img.id !== id));

    await fetch(`/api/gallery/${id}`, { method: "DELETE" });
    await fetchImages();
  };

  // Reorder
  const reorderingRef = useRef(false);
  const reorder = async (newImages: GalleryImage[]) => {
    setImages(newImages);

    if (reorderingRef.current) return;
    reorderingRef.current = true;

    try {
      await fetch("/api/gallery/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: newImages.map((img) => img.id) }),
      });
      await fetchImages();
    } finally {
      reorderingRef.current = false;
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const arr = [...images];
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    reorder(arr);
  };

  const handleMoveDown = (index: number) => {
    if (index === images.length - 1) return;
    const arr = [...images];
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
      const arr = [...images];
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
          <p className="mt-3 text-muted">Chargement de la galerie...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Add button */}
      <div className="row mb-3">
        <div className="col">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
            className="d-none"
            multiple
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
                Upload {uploadProgress.done}/{uploadProgress.total}...
              </>
            ) : (
              <>
                <i className="iconoir-plus me-1"></i>
                Ajouter images / vidéos
              </>
            )}
          </button>
          <span className="text-muted ms-3 fs-13">
            {images.length} média{images.length !== 1 ? "s" : ""} •{" "}
            {images.filter((img) => img.active).length} actif{images.filter((img) => img.active).length !== 1 ? "s" : ""}
            {images.filter((img) => img.type === "video").length > 0 && (
              <> • {images.filter((img) => img.type === "video").length} vidéo{images.filter((img) => img.type === "video").length !== 1 ? "s" : ""}</>
            )}
          </span>
        </div>
      </div>

      {/* Images grid */}
      {images.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="iconoir-media-image-list" style={{ fontSize: "48px", color: "#95a0c5" }}></i>
            <h5 className="mt-3">Aucune image</h5>
            <p className="text-muted">Ajoutez votre première image à la galerie.</p>
            <button
              className="btn btn-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              <i className="iconoir-plus me-1"></i>
              Ajouter une image
            </button>
          </div>
        </div>
      ) : (
        <div className="row">
          {images.map((image, i) => (
            <div key={image.id} className="col-md-6 col-lg-4 col-xl-3">
              <GalleryCard
                image={image}
                index={i}
                onToggleActive={handleToggleActive}
                onDelete={handleDeleteClick}
                onUpdateAlt={handleUpdateAlt}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                isFirst={i === 0}
                isLast={i === images.length - 1}
                dragHandlers={dragHandlers}
              />
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        open={deleteTarget !== null}
        title="Supprimer l'image"
        message="Cette action est irréversible. Voulez-vous vraiment supprimer cette image ?"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
