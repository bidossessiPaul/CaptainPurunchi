"use client";

import type { BlogPost } from "@/app/types/blog";

interface BlogCardProps {
  post: BlogPost;
  index: number;
  onToggleActive: (id: string, active: boolean) => void;
  onEdit: (post: BlogPost) => void;
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

export default function BlogCard({
  post,
  index,
  onToggleActive,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  dragHandlers,
}: BlogCardProps) {
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
          backgroundImage: post.thumb ? `url(${post.thumb})` : undefined,
          backgroundColor: post.thumb ? undefined : "#e9ecef",
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

        {!post.active && (
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
        <h6 className="mb-1 text-truncate">{post.title}</h6>
        <p className="text-muted mb-1 fs-13">
          <i className="iconoir-calendar me-1"></i>{post.date}
        </p>
        <p className="text-muted mb-2 fs-13">
          <i className="iconoir-user me-1"></i>{post.author}
        </p>

        <div className="admin-card-actions">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              checked={post.active}
              onChange={() => onToggleActive(post.id, !post.active)}
              id={`active-${post.id}`}
            />
            <label className="form-check-label" htmlFor={`active-${post.id}`}>
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
              onClick={() => onEdit(post)}
              title="Modifier"
            >
              <i className="iconoir-edit-pencil"></i>
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => onDelete(post.id)}
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
