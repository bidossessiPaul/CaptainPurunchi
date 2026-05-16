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

  // Form state (création)
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formPreview, setFormPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state (édition)
  const [editTarget, setEditTarget] = useState<Specialty | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDetails, setEditDetails] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);

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

  // Ouvrir le formulaire d'édition
  const handleEditClick = (item: Specialty) => {
    setEditTarget(item);
    setEditTitle(item.title);
    setEditDesc(item.description);
    setEditDetails((item as Specialty & { details?: string }).details || "");
    setEditFile(null);
    setEditPreview(item.src || null);
    if (editFileRef.current) editFileRef.current.value = "";
  };

  // Sauvegarder les modifications
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget || !editTitle.trim() || !editDesc.trim()) return;
    setEditSubmitting(true);

    let src = editTarget.src;

    // Si nouvelle image sélectionnée, uploader d'abord
    if (editFile) {
      const formData = new FormData();
      formData.append("file", editFile);
      const uploadRes = await fetch("/api/specialties/upload", { method: "POST", body: formData });
      if (uploadRes.ok) {
        const data = await uploadRes.json();
        src = data.src;
      }
    }

    await fetch(`/api/specialties/${editTarget.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle.trim(), description: editDesc.trim(), details: editDetails.trim(), src }),
    });

    await fetchItems();
    setEditTarget(null);
    setEditSubmitting(false);
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
            {items.length} spécialité{items.length !== 1 ? "s" : ""} •{" "}
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
                onEdit={handleEditClick}
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

      {/* Modal d'édition */}
      {editTarget && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Modifier la spécialité</h5>
                <button className="btn-close" onClick={() => setEditTarget(null)} />
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label fs-13">Image (optionnel — laisser vide pour garder l&apos;actuelle)</label>
                      <input
                        ref={editFileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        className="form-control form-control-sm"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) { setEditFile(file); setEditPreview(URL.createObjectURL(file)); }
                        }}
                      />
                      {editPreview && (
                        <div className="mt-2" style={{ height: "120px", backgroundImage: `url(${editPreview})`, backgroundSize: "cover", backgroundPosition: "center", borderRadius: "8px" }} />
                      )}
                    </div>
                    <div className="col-md-8">
                      <div className="mb-3">
                        <label className="form-label fs-13">Titre</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fs-13">Description courte</label>
                        <textarea
                          className="form-control form-control-sm"
                          rows={2}
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fs-13">Contenu détaillé <span className="text-muted">(page dédiée — Markdown simplifié)</span></label>
                        <textarea
                          className="form-control form-control-sm"
                          rows={8}
                          value={editDetails}
                          onChange={(e) => setEditDetails(e.target.value)}
                          placeholder="## Titre&#10;### Sous-titre&#10;- Liste&#10;Paragraphe normal"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditTarget(null)}>Annuler</button>
                  <button type="submit" className="btn btn-primary" disabled={editSubmitting}>
                    {editSubmitting ? <><span className="spinner-border spinner-border-sm me-2" />Enregistrement...</> : <><i className="iconoir-check me-1"></i>Enregistrer</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
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
