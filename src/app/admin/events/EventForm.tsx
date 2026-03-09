"use client";

import { useState, useRef } from "react";
import type { Event } from "@/app/types/event";

interface EventFormProps {
  event?: Event;
  onSubmit: (data: {
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
  }) => Promise<void>;
  onCancel: () => void;
}

const MONTHS = ["JAN", "FÉV", "MAR", "AVR", "MAI", "JUN", "JUL", "AOÛ", "SEP", "OCT", "NOV", "DÉC"];

export default function EventForm({ event, onSubmit, onCancel }: EventFormProps) {
  const [featured, setFeatured] = useState(event?.featured || false);
  const [tag, setTag] = useState(event?.tag || "");
  const [title, setTitle] = useState(event?.title || "");
  const [shortDesc, setShortDesc] = useState(event?.shortDesc || "");
  const [description, setDescription] = useState(event?.description || "");
  const [day, setDay] = useState(event?.day || "");
  const [month, setMonth] = useState(event?.month || "");
  const [time, setTime] = useState(event?.time || "");
  const [location, setLocation] = useState(event?.location || "");
  const [price, setPrice] = useState(event?.price || "");
  const [thumb, setThumb] = useState(event?.thumb || "");
  const [gallery, setGallery] = useState<string[]>(event?.gallery || []);
  const [includes, setIncludes] = useState<string[]>(event?.includes || []);
  const [newInclude, setNewInclude] = useState("");
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
    const res = await fetch("/api/events/upload", { method: "POST", body: formData });
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

  const addInclude = () => {
    const trimmed = newInclude.trim();
    if (trimmed && !includes.includes(trimmed)) {
      setIncludes([...includes, trimmed]);
      setNewInclude("");
    }
  };

  const removeInclude = (index: number) => {
    setIncludes(includes.filter((_, i) => i !== index));
  };

  const removeGalleryImage = (index: number) => {
    setGallery(gallery.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !tag.trim()) return;
    setSubmitting(true);
    await onSubmit({
      featured,
      tag: tag.trim(),
      title: title.trim(),
      shortDesc: shortDesc.trim(),
      description: description.trim(),
      day: day.trim(),
      month: month.trim(),
      time: time.trim(),
      location: location.trim(),
      price: price.trim(),
      thumb,
      gallery,
      includes,
    });
    setSubmitting(false);
  };

  return (
    <div className="card">
      <div className="card-body">
        <h6 className="mb-3">{event ? "Modifier l'\u00e9v\u00e9nement" : "Nouvel \u00e9v\u00e9nement"}</h6>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* Title + Tag */}
            <div className="col-md-6">
              <label className="form-label fs-13">Titre *</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Ex: Soir\u00e9e DJ \u2014 Tropical Vibes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fs-13">Tag *</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Ex: Soir\u00e9e, Brunch..."
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fs-13">Prix</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Ex: Entr\u00e9e : 5.000 F"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            {/* Date + Time + Location */}
            <div className="col-md-2">
              <label className="form-label fs-13">Jour</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="15"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                maxLength={2}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label fs-13">Mois</label>
              <select
                className="form-select form-select-sm"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                <option value="">--</option>
                {MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label fs-13">Horaire</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Ex: 20h \u2013 03h"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fs-13">Lieu</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Ex: Rooftop"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* Short description */}
            <div className="col-12">
              <label className="form-label fs-13">Description courte</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Affich\u00e9 sur la carte de l'\u00e9v\u00e9nement"
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
              />
            </div>

            {/* Full description */}
            <div className="col-12">
              <label className="form-label fs-13">Description compl\u00e8te</label>
              <textarea
                className="form-control form-control-sm"
                rows={3}
                placeholder="Description d\u00e9taill\u00e9e visible dans la modale"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Featured toggle */}
            <div className="col-md-3">
              <div className="form-check form-switch mt-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  id="form-featured"
                />
                <label className="form-check-label fs-13" htmlFor="form-featured">
                  &Agrave; la une
                </label>
              </div>
            </div>

            {/* Thumbnail */}
            <div className="col-md-9">
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

            {/* Includes */}
            <div className="col-md-6">
              <label className="form-label fs-13">Inclus</label>
              <div className="d-flex gap-1 mb-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ex: 1 cocktail offert"
                  value={newInclude}
                  onChange={(e) => setNewInclude(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addInclude();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={addInclude}
                  disabled={!newInclude.trim()}
                >
                  <i className="iconoir-plus"></i>
                </button>
              </div>
              <div className="d-flex flex-wrap gap-1">
                {includes.map((inc, i) => (
                  <span key={i} className="badge bg-light text-dark border">
                    {inc}
                    <button
                      type="button"
                      className="btn-close ms-1"
                      style={{ fontSize: "8px" }}
                      onClick={() => removeInclude(i)}
                    />
                  </span>
                ))}
              </div>
            </div>

            {/* Gallery images */}
            <div className="col-md-6">
              <label className="form-label fs-13">Galerie</label>
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
                    <><i className="iconoir-plus me-1"></i>Ajouter</>
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
                disabled={submitting || !title.trim() || !tag.trim()}
              >
                {submitting ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  <><i className="iconoir-check me-1"></i>{event ? "Enregistrer" : "Cr\u00e9er"}</>
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
