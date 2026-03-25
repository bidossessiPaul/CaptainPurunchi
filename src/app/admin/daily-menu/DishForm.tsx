"use client";

import { useState, useRef } from "react";
import type { DailyDish } from "@/app/types/daily-dish";

const CATEGORIES = ["Entrée", "Plat Principal", "Accompagnement", "Dessert", "Boisson", "Spécial du Chef"];

interface DishFormProps {
  dish?: DailyDish | null;
  selectedDate: string;
  onSave: (data: Record<string, unknown>) => void;
  onCancel: () => void;
}

export default function DishForm({ dish, selectedDate, onSave, onCancel }: DishFormProps) {
  const [name, setName] = useState(dish?.name || "");
  const [description, setDescription] = useState(dish?.description || "");
  const [price, setPrice] = useState(dish?.price || "");
  const [category, setCategory] = useState(dish?.category || CATEGORIES[0]);
  const [photo, setPhoto] = useState(dish?.photo || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/daily-dishes/upload", { method: "POST", body: formData });
    if (res.ok) {
      const { src } = await res.json();
      setPhoto(src);
    } else {
      const err = await res.json();
      alert(err.error || "Erreur upload");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price.trim()) return;
    setSaving(true);
    await onSave({
      name: name.trim(),
      description: description.trim(),
      price: price.trim(),
      category,
      photo,
      availableDate: selectedDate,
    });
    setSaving(false);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">{dish ? "Modifier le plat" : "Ajouter un plat"}</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Nom *</label>
              <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Prix *</label>
              <input type="text" className="form-control" placeholder="3.000 F" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Catégorie *</label>
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label">Photo</label>
            <div className="d-flex align-items-center gap-3">
              {photo && (
                <img src={photo} alt="Preview" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8 }} />
              )}
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="form-control" onChange={handleUpload} />
              {uploading && <span className="spinner-border spinner-border-sm"></span>}
            </div>
          </div>
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
              {saving ? (
                <><span className="spinner-border spinner-border-sm me-2" />{dish ? "Modification..." : "Ajout..."}</>
              ) : (
                <><i className="iconoir-check me-1"></i>{dish ? "Modifier" : "Ajouter"}</>
              )}
            </button>
            <button type="button" className="btn btn-light" onClick={onCancel}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}
