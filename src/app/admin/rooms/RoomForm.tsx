"use client";

import { useState, useRef } from "react";
import type { Room } from "@/app/types/room";

interface RoomFormProps {
  room?: Room;
  onSubmit: (data: {
    name: string;
    shortDesc: string;
    price: string;
    thumb: string;
    capacity: string;
    features: string[];
    description: string;
    gallery: string[];
  }) => Promise<void>;
  onCancel: () => void;
}

export default function RoomForm({ room, onSubmit, onCancel }: RoomFormProps) {
  const [name, setName] = useState(room?.name || "");
  const [shortDesc, setShortDesc] = useState(room?.shortDesc || "");
  const [price, setPrice] = useState(room?.price || "");
  const [thumb, setThumb] = useState(room?.thumb || "");
  const [capacity, setCapacity] = useState(room?.capacity || "");
  const [features, setFeatures] = useState<string[]>(room?.features || []);
  const [newFeature, setNewFeature] = useState("");
  const [description, setDescription] = useState(room?.description || "");
  const [gallery, setGallery] = useState<string[]>(room?.gallery || []);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (
    file: File,
    setUrl: (url: string) => void,
    setLoading: (v: boolean) => void
  ) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/rooms/upload", { method: "POST", body: formData });
    if (res.ok) {
      const { src } = await res.json();
      setUrl(src);
    } else {
      const err = await res.json();
      alert(err.error || "Erreur upload");
    }
    setLoading(false);
  };

  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleUpload(file, setThumb, setUploadingThumb);
    if (thumbInputRef.current) thumbInputRef.current.value = "";
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleUpload(
      file,
      (src) => setGallery((prev) => [...prev, src]),
      setUploadingGallery
    );
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const addFeature = () => {
    const trimmed = newFeature.trim();
    if (trimmed && !features.includes(trimmed)) {
      setFeatures([...features, trimmed]);
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const removeGalleryImage = (index: number) => {
    setGallery(gallery.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price.trim()) return;
    setSubmitting(true);
    await onSubmit({
      name: name.trim(),
      shortDesc: shortDesc.trim(),
      price: price.trim(),
      thumb,
      capacity: capacity.trim(),
      features,
      description: description.trim(),
      gallery,
    });
    setSubmitting(false);
  };

  return (
    <div className="card">
      <div className="card-body">
        <h6 className="mb-3">{room ? "Modifier la chambre" : "Nouvelle chambre"}</h6>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* Name + Price */}
            <div className="col-md-6">
              <label className="form-label fs-13">Nom *</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Ex: Chambre Standard"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fs-13">Prix *</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Ex: 15.000 F / nuit"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fs-13">Capacité</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Ex: 2 personnes"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>

            {/* Short description */}
            <div className="col-12">
              <label className="form-label fs-13">Description courte</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Affiché sur la carte de la chambre"
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
              />
            </div>

            {/* Full description */}
            <div className="col-12">
              <label className="form-label fs-13">Description complète</label>
              <textarea
                className="form-control form-control-sm"
                rows={3}
                placeholder="Description détaillée visible dans la modale"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Thumbnail */}
            <div className="col-md-6">
              <label className="form-label fs-13">Image principale</label>
              <div className="d-flex align-items-center gap-2">
                <input
                  ref={thumbInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="d-none"
                  onChange={handleThumbUpload}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => thumbInputRef.current?.click()}
                  disabled={uploadingThumb}
                >
                  {uploadingThumb ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <><i className="iconoir-upload me-1"></i>Upload</>
                  )}
                </button>
                {thumb && (
                  <img
                    src={thumb}
                    alt="thumb"
                    style={{ height: 40, width: 60, objectFit: "cover", borderRadius: 4 }}
                  />
                )}
                {thumb && (
                  <span className="text-muted fs-12 text-truncate" style={{ maxWidth: 150 }}>
                    {thumb.split("/").pop()}
                  </span>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="col-md-6">
              <label className="form-label fs-13">Équipements</label>
              <div className="d-flex gap-1 mb-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ex: Climatisation"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={addFeature}
                  disabled={!newFeature.trim()}
                >
                  <i className="iconoir-plus"></i>
                </button>
              </div>
              <div className="d-flex flex-wrap gap-1">
                {features.map((f, i) => (
                  <span key={i} className="badge bg-light text-dark border">
                    {f}
                    <button
                      type="button"
                      className="btn-close ms-1"
                      style={{ fontSize: "8px" }}
                      onClick={() => removeFeature(i)}
                    />
                  </span>
                ))}
              </div>
            </div>

            {/* Gallery images */}
            <div className="col-12">
              <label className="form-label fs-13">Galerie de la chambre</label>
              <div className="d-flex align-items-center gap-2 mb-2">
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="d-none"
                  onChange={handleGalleryUpload}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={uploadingGallery}
                >
                  {uploadingGallery ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <><i className="iconoir-plus me-1"></i>Ajouter une photo</>
                  )}
                </button>
                <span className="text-muted fs-13">{gallery.length} photo{gallery.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {gallery.map((src, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <img
                      src={src}
                      alt={`Gallery ${i + 1}`}
                      style={{ height: 60, width: 80, objectFit: "cover", borderRadius: 4 }}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      style={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        width: 18,
                        height: 18,
                        padding: 0,
                        fontSize: 10,
                        lineHeight: 1,
                        borderRadius: "50%",
                      }}
                      onClick={() => removeGalleryImage(i)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="col-12 d-flex gap-2">
              <button
                type="submit"
                className="btn btn-sm btn-primary"
                disabled={submitting || !name.trim() || !price.trim()}
              >
                {submitting ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  <><i className="iconoir-check me-1"></i>{room ? "Enregistrer" : "Créer"}</>
                )}
              </button>
              <button type="button" className="btn btn-sm btn-light" onClick={onCancel}>
                Annuler
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
