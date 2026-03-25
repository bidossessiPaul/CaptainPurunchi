"use client";

import type { Event } from "@/app/types/event";

interface EventCardProps {
  event: Event;
  index: number;
  onToggleActive: (id: string, active: boolean) => void;
  onToggleFeatured: (id: string, featured: boolean) => void;
  onEdit: (event: Event) => void;
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

export default function EventCard({
  event,
  index,
  onToggleActive,
  onToggleFeatured,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  dragHandlers,
}: EventCardProps) {
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
          height: "160px",
          backgroundImage: event.thumb ? `url(${event.thumb})` : undefined,
          backgroundColor: event.thumb ? undefined : "#e9ecef",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "0.75rem 0.75rem 0 0",
          position: "relative",
        }}
      >
        <span
          className="badge bg-dark"
          style={{ position: "absolute", top: "10px", left: "10px" }}
        >
          #{index + 1}
        </span>

        <span
          style={{ position: "absolute", top: "10px", right: "10px", color: "#fff", fontSize: "20px", cursor: "grab" }}
        >
          <i className="iconoir-drag-hand-gesture"></i>
        </span>

        {event.featured && (
          <span
            className="badge bg-warning text-dark"
            style={{ position: "absolute", bottom: "34px", right: "10px" }}
          >
            <i className="fa fa-star me-1"></i>À la une
          </span>
        )}

        <div style={{ position: "absolute", bottom: "10px", right: "10px", display: "flex", gap: "6px" }}>
          <span className="badge bg-primary">{event.day} {event.month}</span>
          {event.price && <span className="badge bg-success">{event.price}</span>}
        </div>

        {!event.active && (
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
        <div className="d-flex align-items-center gap-2 mb-1">
          <span className="badge bg-light text-dark border fs-11">{event.tag}</span>
          <h6 className="mb-0 text-truncate">{event.title}</h6>
        </div>

        <p className="text-muted mb-1 fs-13">
          <i className="fa fa-clock-o me-1"></i>{event.time}
          <span className="mx-2">|</span>
          <i className="fa fa-map-marker me-1"></i>{event.location}
        </p>

        <p className="text-muted mb-2 fs-13 text-truncate">{event.shortDesc}</p>

        {event.includes.length > 0 && (
          <div className="d-flex flex-wrap gap-1 mb-2">
            {event.includes.slice(0, 3).map((inc, i) => (
              <span key={i} className="badge bg-light text-dark border fs-11">{inc}</span>
            ))}
            {event.includes.length > 3 && (
              <span className="badge bg-light text-muted border fs-11">+{event.includes.length - 3}</span>
            )}
          </div>
        )}

        <div className="admin-card-actions">
          <div className="d-flex gap-2 flex-wrap">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                checked={event.active}
                onChange={() => onToggleActive(event.id, !event.active)}
                id={`active-${event.id}`}
              />
              <label className="form-check-label" htmlFor={`active-${event.id}`}>
                Actif
              </label>
            </div>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                checked={event.featured}
                onChange={() => onToggleFeatured(event.id, !event.featured)}
                id={`featured-${event.id}`}
              />
              <label className="form-check-label" htmlFor={`featured-${event.id}`}>
                Vedette
              </label>
            </div>
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
              className="btn btn-sm btn-outline-primary"
              onClick={() => onEdit(event)}
              title="Modifier"
            >
              <i className="iconoir-edit-pencil"></i>
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => onDelete(event.id)}
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
