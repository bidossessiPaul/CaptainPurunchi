"use client";

import { useState } from "react";
import type { GalleryImage } from "@/app/types/gallery";

interface GalleryCardProps {
  image: GalleryImage;
  index: number;
  onToggleActive: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
  onUpdateAlt: (id: string, alt: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  isFirst: boolean;
  isLast: boolean;
  dragHandlers: {
    onDragStart: (e: React.DragEvent, index: number) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, index: number) => void;
    onDragEnd: () => void;
  };
}

export default function GalleryCard({
  image,
  index,
  onToggleActive,
  onDelete,
  onUpdateAlt,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  dragHandlers,
}: GalleryCardProps) {
  const [editing, setEditing] = useState(false);
  const [alt, setAlt] = useState(image.alt);

  const handleSaveAlt = () => {
    onUpdateAlt(image.id, alt);
    setEditing(false);
  };

  return (
    <div
      className="card"
      draggable
      onDragStart={(e) => dragHandlers.onDragStart(e, index)}
      onDragOver={dragHandlers.onDragOver}
      onDrop={(e) => dragHandlers.onDrop(e, index)}
      onDragEnd={dragHandlers.onDragEnd}
      style={{ cursor: "grab" }}
    >
      {/* Thumbnail */}
      <div
        style={{
          height: "180px",
          borderRadius: "0.75rem 0.75rem 0 0",
          position: "relative",
          overflow: "hidden",
          background: "#1a1a2e",
          ...(image.type !== "video" ? {
            backgroundImage: `url(${image.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          } : {}),
        }}
      >
        {image.type === "video" && (
          <video
            src={image.src}
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
            onMouseLeave={(e) => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
          />
        )}

        <span
          className="badge bg-dark"
          style={{ position: "absolute", top: "10px", left: "10px" }}
        >
          #{index + 1}
        </span>

        {image.type === "video" && (
          <span
            className="badge bg-info"
            style={{ position: "absolute", top: "10px", left: "50px" }}
          >
            VID&Eacute;O
          </span>
        )}

        <span
          style={{ position: "absolute", top: "10px", right: "10px", color: "#fff", fontSize: "20px", cursor: "grab" }}
        >
          <i className="iconoir-drag-hand-gesture"></i>
        </span>

        {!image.active && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              borderRadius: "0.75rem 0.75rem 0 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span className="badge bg-secondary fs-14">D&eacute;sactiv&eacute;</span>
          </div>
        )}
      </div>

      <div className="card-body py-3">
        {/* Alt text */}
        {editing ? (
          <div className="d-flex gap-1 mb-2">
            <input
              type="text"
              className="form-control form-control-sm"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveAlt()}
              autoFocus
            />
            <button className="btn btn-sm btn-primary" onClick={handleSaveAlt}>
              <i className="iconoir-check"></i>
            </button>
            <button className="btn btn-sm btn-light" onClick={() => { setAlt(image.alt); setEditing(false); }}>
              <i className="iconoir-xmark"></i>
            </button>
          </div>
        ) : (
          <p
            className="text-muted mb-2 fs-13 text-truncate"
            title={image.alt}
            style={{ cursor: "pointer" }}
            onClick={() => setEditing(true)}
          >
            <i className="iconoir-edit-pencil me-1"></i>
            {image.alt || <em>Sans description</em>}
          </p>
        )}

        {/* Actions */}
        <div className="admin-card-actions">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              checked={image.active}
              onChange={() => onToggleActive(image.id, !image.active)}
              id={`active-${image.id}`}
            />
            <label className="form-check-label" htmlFor={`active-${image.id}`}>
              Actif
            </label>
          </div>

          <div className="btn-group-actions">
            <button
              className="btn btn-sm btn-light"
              disabled={isFirst}
              onClick={() => onMoveUp(index)}
              title="Monter"
            >
              <i className="iconoir-arrow-up"></i>
            </button>
            <button
              className="btn btn-sm btn-light"
              disabled={isLast}
              onClick={() => onMoveDown(index)}
              title="Descendre"
            >
              <i className="iconoir-arrow-down"></i>
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => onDelete(image.id)}
              title="Supprimer"
            >
              <i className="iconoir-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
