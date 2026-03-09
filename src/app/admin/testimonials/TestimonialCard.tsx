"use client";

import type { Testimonial } from "@/app/types/testimonial";

interface TestimonialCardProps {
  testimonial: Testimonial;
  index: number;
  onToggleActive: (id: string, active: boolean) => void;
  onEdit: (testimonial: Testimonial) => void;
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

function Stars({ count }: { count: number }) {
  const full = Math.floor(count);
  const half = count % 1 >= 0.5;
  return (
    <span style={{ color: "#f4c150" }}>
      {Array.from({ length: full }).map((_, i) => (
        <i key={i} className="fa fa-star"></i>
      ))}
      {half && <i className="fa fa-star-half-o"></i>}
    </span>
  );
}

export default function TestimonialCard({
  testimonial,
  index,
  onToggleActive,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  dragHandlers,
}: TestimonialCardProps) {
  return (
    <div
      className="card"
      draggable
      onDragStart={(e) => dragHandlers.onDragStart(e, index)}
      onDragOver={dragHandlers.onDragOver}
      onDrop={(e) => dragHandlers.onDrop(e, index)}
      onDragEnd={dragHandlers.onDragEnd}
      style={{ cursor: "grab", opacity: testimonial.active ? 1 : 0.6 }}
    >
      <div className="card-body py-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <span className="badge bg-dark">#{index + 1}</span>
          <Stars count={testimonial.stars} />
        </div>

        <p className="mb-2 fs-13" style={{
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          &laquo; {testimonial.text} &raquo;
        </p>

        {testimonial.image && (
          <div className="mb-2">
            <img
              src={testimonial.image}
              alt="Photo"
              style={{
                width: "100%",
                height: 80,
                borderRadius: 6,
                objectFit: "cover",
              }}
            />
          </div>
        )}

        <div className="d-flex align-items-center gap-2 mb-2">
          {testimonial.avatar ? (
            <img
              src={testimonial.avatar}
              alt={testimonial.name}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#f0f2f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#95a0c5",
              fontSize: 14,
            }}>
              <i className="fa fa-user"></i>
            </div>
          )}
          <div>
            <h6 className="mb-0 fs-14">{testimonial.name}</h6>
            <p className="text-muted mb-0 fs-12">{testimonial.role}</p>
          </div>
        </div>

        {!testimonial.active && (
          <span className="badge bg-secondary mb-2">Désactivé</span>
        )}

        <div className="admin-card-actions">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              checked={testimonial.active}
              onChange={() => onToggleActive(testimonial.id, !testimonial.active)}
              id={`active-${testimonial.id}`}
            />
            <label className="form-check-label" htmlFor={`active-${testimonial.id}`}>
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
              className="btn btn-sm btn-outline-primary"
              onClick={() => onEdit(testimonial)}
              title="Modifier"
            >
              <i className="iconoir-edit-pencil"></i>
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => onDelete(testimonial.id)}
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
