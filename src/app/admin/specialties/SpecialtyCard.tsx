"use client";

import type { Specialty } from "@/app/types/specialty";

interface SpecialtyCardProps {
  item: Specialty;
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

export default function SpecialtyCard({
  item,
  index,
  onToggleActive,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  dragHandlers,
}: SpecialtyCardProps) {
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
      {/* Image thumbnail */}
      <div
        style={{
          height: "180px",
          backgroundImage: `url(${item.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "0.75rem 0.75rem 0 0",
          position: "relative",
        }}
      >
        {/* Order badge */}
        <span
          className="badge bg-dark"
          style={{ position: "absolute", top: "10px", left: "10px" }}
        >
          #{index + 1}
        </span>

        {/* Drag handle */}
        <span
          style={{ position: "absolute", top: "10px", right: "10px", color: "#fff", fontSize: "20px", cursor: "grab" }}
        >
          <i className="iconoir-drag-hand-gesture"></i>
        </span>

        {/* Inactive overlay */}
        {!item.active && (
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
            <span className="badge bg-secondary fs-14">Désactivé</span>
          </div>
        )}
      </div>

      <div className="card-body py-3">
        {/* Title */}
        <h6 className="mb-1 text-truncate" title={item.title}>
          {item.title}
        </h6>

        {/* Description */}
        <p
          className="text-muted mb-2 fs-13"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
          title={item.description}
        >
          {item.description}
        </p>

        {/* Actions */}
        <div className="admin-card-actions">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              checked={item.active}
              onChange={() => onToggleActive(item.id, !item.active)}
              id={`active-${item.id}`}
            />
            <label className="form-check-label" htmlFor={`active-${item.id}`}>
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
              onClick={() => onDelete(item.id)}
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
