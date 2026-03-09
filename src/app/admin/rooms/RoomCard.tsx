"use client";

import type { Room } from "@/app/types/room";

interface RoomCardProps {
  room: Room;
  index: number;
  onToggleActive: (id: string, active: boolean) => void;
  onEdit: (room: Room) => void;
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

export default function RoomCard({
  room,
  index,
  onToggleActive,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  dragHandlers,
}: RoomCardProps) {
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
          backgroundImage: room.thumb ? `url(${room.thumb})` : undefined,
          backgroundColor: room.thumb ? undefined : "#e9ecef",
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

        {room.price && (
          <span
            className="badge bg-primary"
            style={{ position: "absolute", bottom: "10px", right: "10px" }}
          >
            {room.price}
          </span>
        )}

        {!room.active && (
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
        <h6 className="mb-1">{room.name}</h6>
        {room.capacity && (
          <p className="text-muted mb-1 fs-13">
            <i className="fa fa-users me-1"></i>{room.capacity}
          </p>
        )}
        <p className="text-muted mb-2 fs-13 text-truncate">{room.shortDesc}</p>

        {room.features.length > 0 && (
          <div className="d-flex flex-wrap gap-1 mb-2">
            {room.features.slice(0, 3).map((f, i) => (
              <span key={i} className="badge bg-light text-dark border fs-11">{f}</span>
            ))}
            {room.features.length > 3 && (
              <span className="badge bg-light text-muted border fs-11">+{room.features.length - 3}</span>
            )}
          </div>
        )}

        <div className="admin-card-actions">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              checked={room.active}
              onChange={() => onToggleActive(room.id, !room.active)}
              id={`active-${room.id}`}
            />
            <label className="form-check-label" htmlFor={`active-${room.id}`}>
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
              onClick={() => onEdit(room)}
              title="Modifier"
            >
              <i className="iconoir-edit-pencil"></i>
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => onDelete(room.id)}
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
