"use client";

import type { DailyDish } from "@/app/types/daily-dish";

interface DishCardProps {
  dish: DailyDish;
  index: number;
  onToggleActive: (id: string, active: boolean) => void;
  onEdit: (dish: DailyDish) => void;
  onDelete: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  isFirst: boolean;
  isLast: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Entrée": "bg-success",
  "Plat Principal": "bg-primary",
  "Accompagnement": "bg-info",
  "Dessert": "bg-warning",
  "Boisson": "bg-secondary",
  "Spécial du Chef": "bg-danger",
};

export default function DishCard({
  dish,
  index,
  onToggleActive,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: DishCardProps) {
  return (
    <div className="card">
      <div
        style={{
          height: "140px",
          backgroundImage: dish.photo ? `url(${dish.photo})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "0.75rem 0.75rem 0 0",
          position: "relative",
          background: dish.photo ? undefined : "#e9ecef",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!dish.photo && (
          <i className="iconoir-dish" style={{ fontSize: "36px", color: "#95a0c5" }}></i>
        )}
        <span
          className={`badge ${CATEGORY_COLORS[dish.category] || "bg-dark"}`}
          style={{ position: "absolute", top: "8px", left: "8px" }}
        >
          {dish.category}
        </span>
        {!dish.active && (
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

      <div className="card-body py-2">
        <div className="d-flex justify-content-between align-items-start mb-1">
          <h6 className="mb-0 text-truncate" style={{ maxWidth: "70%" }}>{dish.name}</h6>
          <span className="text-primary fw-bold" style={{ whiteSpace: "nowrap" }}>{dish.price}</span>
        </div>
        {dish.description && (
          <p className="text-muted fs-13 mb-2" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {dish.description}
          </p>
        )}

        <div className="admin-card-actions">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              checked={dish.active}
              onChange={() => onToggleActive(dish.id, !dish.active)}
              id={`active-${dish.id}`}
            />
            <label className="form-check-label" htmlFor={`active-${dish.id}`}>
              Actif
            </label>
          </div>
          <div className="btn-group-actions">
            <button className="btn btn-sm btn-light" disabled={isFirst} onClick={() => onMoveUp(index)} title="Monter">
              <i className="iconoir-arrow-up"></i>
            </button>
            <button className="btn btn-sm btn-light" disabled={isLast} onClick={() => onMoveDown(index)} title="Descendre">
              <i className="iconoir-arrow-down"></i>
            </button>
            <button className="btn btn-sm btn-light" onClick={() => onEdit(dish)} title="Modifier">
              <i className="iconoir-edit-pencil"></i>
            </button>
            <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(dish.id)} title="Supprimer">
              <i className="iconoir-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
