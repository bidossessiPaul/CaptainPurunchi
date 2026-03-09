"use client";

import { useState, useRef } from "react";
import type { Testimonial } from "@/app/types/testimonial";

interface TestimonialFormProps {
  testimonial?: Testimonial;
  onSubmit: (data: {
    text: string;
    name: string;
    role: string;
    stars: number;
    image: string | null;
    avatar: string | null;
  }) => Promise<void>;
  onCancel: () => void;
}

async function uploadImage(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/testimonials/upload", {
    method: "POST",
    body: formData,
  });
  if (res.ok) {
    const data = await res.json();
    return data.src;
  }
  return null;
}

export default function TestimonialForm({ testimonial, onSubmit, onCancel }: TestimonialFormProps) {
  const [text, setText] = useState(testimonial?.text || "");
  const [name, setName] = useState(testimonial?.name || "");
  const [role, setRole] = useState(testimonial?.role || "");
  const [stars, setStars] = useState(testimonial?.stars ?? 5);
  const [avatar, setAvatar] = useState<string | null>(testimonial?.avatar || null);
  const [image, setImage] = useState<string | null>(testimonial?.image || null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const src = await uploadImage(file);
    if (src) setAvatar(src);
    setUploadingAvatar(false);
    if (avatarRef.current) avatarRef.current.value = "";
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const src = await uploadImage(file);
    if (src) setImage(src);
    setUploadingImage(false);
    if (imageRef.current) imageRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !name.trim()) return;
    setSubmitting(true);
    await onSubmit({
      text: text.trim(),
      name: name.trim(),
      role: role.trim(),
      stars,
      image,
      avatar,
    });
    setSubmitting(false);
  };

  return (
    <div className="card">
      <div className="card-body">
        <h6 className="mb-3">{testimonial ? "Modifier l'avis" : "Nouvel avis"}</h6>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* Avatar (photo de profil) */}
            <div className="col-md-6">
              <label className="form-label fs-13">Photo de profil</label>
              <div className="d-flex align-items-center gap-3">
                {avatar ? (
                  <div style={{ position: "relative" }}>
                    <img
                      src={avatar}
                      alt="Avatar"
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid #e9ecef",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setAvatar(null)}
                      style={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "#dc3545",
                        color: "#fff",
                        border: "none",
                        fontSize: 12,
                        lineHeight: "20px",
                        padding: 0,
                        cursor: "pointer",
                      }}
                      title="Retirer"
                    >
                      &times;
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      background: "#f0f2f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#95a0c5",
                      fontSize: 24,
                    }}
                  >
                    <i className="iconoir-user"></i>
                  </div>
                )}
                <div>
                  <input
                    ref={avatarRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={handleAvatarUpload}
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => avatarRef.current?.click()}
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? (
                      <span className="spinner-border spinner-border-sm me-1" />
                    ) : (
                      <i className="iconoir-upload me-1"></i>
                    )}
                    {avatar ? "Changer" : "Ajouter"}
                  </button>
                  <p className="text-muted fs-12 mb-0 mt-1">Photo du client</p>
                </div>
              </div>
            </div>

            {/* Image (photo du lieu/repas) */}
            <div className="col-md-6">
              <label className="form-label fs-13">Photo (lieu, repas, etc.)</label>
              <div className="d-flex align-items-center gap-3">
                {image ? (
                  <div style={{ position: "relative" }}>
                    <img
                      src={image}
                      alt="Photo"
                      style={{
                        width: 80,
                        height: 56,
                        borderRadius: 8,
                        objectFit: "cover",
                        border: "2px solid #e9ecef",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setImage(null)}
                      style={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "#dc3545",
                        color: "#fff",
                        border: "none",
                        fontSize: 12,
                        lineHeight: "20px",
                        padding: 0,
                        cursor: "pointer",
                      }}
                      title="Retirer"
                    >
                      &times;
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      width: 80,
                      height: 56,
                      borderRadius: 8,
                      background: "#f0f2f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#95a0c5",
                      fontSize: 24,
                    }}
                  >
                    <i className="iconoir-media-image"></i>
                  </div>
                )}
                <div>
                  <input
                    ref={imageRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => imageRef.current?.click()}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <span className="spinner-border spinner-border-sm me-1" />
                    ) : (
                      <i className="iconoir-upload me-1"></i>
                    )}
                    {image ? "Changer" : "Ajouter"}
                  </button>
                  <p className="text-muted fs-12 mb-0 mt-1">Lieu, repas, ambiance...</p>
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="col-12">
              <label className="form-label fs-13">Témoignage *</label>
              <textarea
                className="form-control form-control-sm"
                placeholder="Ex: Un cadre magnifique avec une vue imprenable..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                required
              />
            </div>

            {/* Name */}
            <div className="col-md-4">
              <label className="form-label fs-13">Nom *</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Ex: Amina K."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Role */}
            <div className="col-md-4">
              <label className="form-label fs-13">Rôle</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Ex: Cliente régulière"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>

            {/* Stars */}
            <div className="col-md-4">
              <label className="form-label fs-13">Note</label>
              <select
                className="form-select form-select-sm"
                value={stars}
                onChange={(e) => setStars(parseFloat(e.target.value))}
              >
                <option value={5}>5 étoiles</option>
                <option value={4.5}>4.5 étoiles</option>
                <option value={4}>4 étoiles</option>
                <option value={3.5}>3.5 étoiles</option>
                <option value={3}>3 étoiles</option>
                <option value={2.5}>2.5 étoiles</option>
                <option value={2}>2 étoiles</option>
                <option value={1.5}>1.5 étoile</option>
                <option value={1}>1 étoile</option>
              </select>
            </div>

            {/* Actions */}
            <div className="col-12 d-flex gap-2">
              <button
                type="submit"
                className="btn btn-sm btn-primary"
                disabled={submitting || !text.trim() || !name.trim()}
              >
                {submitting ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  <><i className="iconoir-check me-1"></i>{testimonial ? "Enregistrer" : "Créer"}</>
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
