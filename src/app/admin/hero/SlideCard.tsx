"use client";

import type { HeroSlide } from "@/app/types/hero";

interface SlideCardProps {
  slide: HeroSlide;
  index: number;
  onToggleActive: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
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

export default function SlideCard({
  slide,
  index,
  onToggleActive,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  dragHandlers,
}: SlideCardProps) {
  return (
    <div
      className="card"
      draggable
      onDragStart={(e) => dragHandlers.onDragStart(e, index)}
      onDragOver={dragHandlers.onDragOver}
      onDrop={(e) => dragHandlers.onDrop(e, index)}
      onDragEnd={dragHandlers.onDragEnd}
    >
      {/* Image thumbnail — 220px */}
      <div
        className="admin-slide-thumb"
        style={{ backgroundImage: `url(${slide.src})` }}
      >
        <span className="slide-order-badge">#{index + 1}</span>
        <span className="slide-drag-handle">
          <i className="iconoir-drag-hand-gesture"></i>
        </span>

        {!slide.active && (
          <div className="slide-inactive-overlay">
            <span className="badge">Désactivé</span>
          </div>
        )}
      </div>

      <div className="card-body">
        {/* File info */}
        <p className="admin-slide-filename" title={slide.src}>
          {slide.src.split("/").pop()}
        </p>

        {slide.title && (
          <p className="admin-slide-meta">
            <strong>Titre :</strong> {slide.title}
          </p>
        )}
        {slide.subtitle && (
          <p className="admin-slide-meta">
            <strong>Sous-titre :</strong> {slide.subtitle}
          </p>
        )}

        {/* Actions */}
        <div className="admin-slide-actions">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              checked={slide.active}
              onChange={() => onToggleActive(slide.id, !slide.active)}
              id={`active-${slide.id}`}
            />
            <label className="form-check-label" htmlFor={`active-${slide.id}`}>
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
              onClick={() => onDelete(slide.id)}
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
