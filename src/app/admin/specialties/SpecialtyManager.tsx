"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Specialty } from "@/app/types/specialty";
import SpecialtyCard from "./SpecialtyCard";
import ConfirmModal from "../ConfirmModal";

export default function SpecialtyManager() {
  const [items, setItems] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formPreview, setFormPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch
  const fetchItems = useCallback(async () => {
    const res = await fetch("/api/specialties");
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Handle file selection for preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormFile(file);
    setFormPreview(URL.createObjectURL(file));
  };

  // Reset form
  const resetForm = () => {
    setShowForm(false);
    setFormTitle("");
    setFormDesc("");
    setFormFile(null);
    setFormPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Submit new specialty
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFile || !formTitle.trim() || !formDesc.trim()) return;

    setSubmitting(true);

    // 1. Upload image
    const formData = new FormData();
    formData.append("file", formFile);

    const uploadRes = await fetch("/api/specialties/upload", {
      method: "POST",
      body: formData,
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.json();
      alert(err.error || "Erreur lors de l'upload");
      setSubmitting(false);
      return;
    }

    const { src } = await uploadRes.json();

    // 2. Create record
    const createRes = await fetch("/api/specialties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: formTitle.trim(), description: formDesc.trim(), src }),
    });

    if (createRes.ok) {
      await fetchItems();
      resetForm();
    }

    setSubmitting(false);
  };

  // Toggle active
  const handleToggleActive = async (id: string, active: boolean) => {
    setItems((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active } : s))
    );
    await fetch(`/api/specialties/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
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

    setItems((prev) => prev.filter((s) => s.id !== id));
    await fetch(`/api/specialties/${id}`, { method: "DELETE" });
    await fetchItems();
  };

  // Reorder
  const reorder = async (newItems: Specialty[]) => {
    setItems(newItems);
    await fetch("/api/specialties/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: newItems.map((s) => s.id) }),
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const arr = [...items];
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    reorder(arr);
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const arr = [...items];
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
      const arr = [...items];
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
          <p className="mt-3 text-muted">Chargement des spécialités...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header bar */}
      <div className="row mb-3">
        <div className="col d-flex align-items-center">
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            <i className={`iconoir-${showForm ? "minus" : "plus"} me-1`}></i>
            {showForm ? "Annuler" : "Ajouter une spécialité"}
          </button>
          <span className="text-muted ms-3 fs-13">
            {items.length} spécialité{items.length !== 1 ? "s" : ""} &bull;{" "}
            {items.filter((s) => s.active).length} active{items.filter((s) => s.active).length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card mb-3">
          <div className="card-body">
            <h6 className="mb-3">Nouvelle spécialité</h6>
            <form onSubmit={handleSubmit}>
              <div className="row">
                {/* Image upload */}
                <div className="col-md-4 mb-3">
                  <label className="form-label fs-13">Image</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="form-control form-control-sm"
                    onChange={handleFileChange}
                    required
                  />
                  {formPreview && (
                    <div
                      className="mt-2"
                      style={{
                        height: "120px",
                        backgroundImage: `url(${formPreview})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        borderRadius: "8px",
                      }}
                    />
                  )}
                </div>

                {/* Title + Description */}
                <div className="col-md-8">
                  <div className="mb-3">
                    <label className="form-label fs-13">Titre</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Ex: HOMARD GRILLÉ"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fs-13">Description</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows={3}
                      placeholder="Description du plat..."
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-sm btn-primary"
                    disabled={submitting || !formFile || !formTitle.trim() || !formDesc.trim()}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <i className="iconoir-check me-1"></i>
                        Enregistrer
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Items grid */}
      {items.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="iconoir-dish" style={{ fontSize: "48px", color: "#95a0c5" }}></i>
            <h5 className="mt-3">Aucune spécialité</h5>
            <p className="text-muted">Ajoutez votre première spécialité.</p>
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              <i className="iconoir-plus me-1"></i>
              Ajouter une spécialité
            </button>
          </div>
        </div>
      ) : (
        <div className="row">
          {items.map((item, i) => (
            <div key={item.id} className="col-md-6 col-lg-4 col-xl-3">
              <SpecialtyCard
                item={item}
                index={i}
                onToggleActive={handleToggleActive}
                onDelete={handleDeleteClick}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                isFirst={i === 0}
                isLast={i === items.length - 1}
                dragHandlers={dragHandlers}
              />
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        open={deleteTarget !== null}
        title="Supprimer la spécialité"
        message="Cette action est irréversible. Voulez-vous vraiment supprimer cette spécialité ?"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
