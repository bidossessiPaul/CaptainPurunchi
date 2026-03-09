"use client";

import type { Order } from "@/app/types/order";

interface OrderCardProps {
  order: Order;
  onChangeStatus: (id: string, status: Order["status"]) => void;
  onDelete: (id: string) => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente", color: "warning" },
  confirmed: { label: "Confirmé", color: "info" },
  completed: { label: "Terminé", color: "success" },
  cancelled: { label: "Annulé", color: "danger" },
};

export default function OrderCard({ order, onChangeStatus, onDelete }: OrderCardProps) {
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const createdTime = new Date(order.createdAt).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="card">
      <div className="card-body">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h6 className="mb-0">{order.customerName}</h6>
            <a href={`tel:${order.customerPhone}`} className="text-muted fs-13">
              <i className="iconoir-phone me-1"></i>{order.customerPhone}
            </a>
          </div>
          <span className={`badge bg-${status.color}`}>{status.label}</span>
        </div>

        {/* Items */}
        <div className="mb-2">
          {order.items.map((item, i) => (
            <div key={i} className="d-flex justify-content-between fs-13">
              <span>{item.dishName} x{item.quantity}</span>
              <span className="text-muted">{item.price}</span>
            </div>
          ))}
          <hr className="my-1" />
          <div className="d-flex justify-content-between fw-bold">
            <span>Total</span>
            <span className="text-primary">{order.totalAmount}</span>
          </div>
        </div>

        {order.notes && (
          <p className="text-muted fs-13 mb-2">
            <i className="iconoir-message-text me-1"></i>{order.notes}
          </p>
        )}

        <p className="text-muted fs-12 mb-2">
          <i className="iconoir-clock me-1"></i>{createdTime}
        </p>

        {/* Actions */}
        <div className="d-flex gap-1 flex-wrap">
          {order.status === "pending" && (
            <button className="btn btn-sm btn-info" onClick={() => onChangeStatus(order.id, "confirmed")}>
              <i className="iconoir-check me-1"></i>Confirmer
            </button>
          )}
          {order.status === "confirmed" && (
            <button className="btn btn-sm btn-success" onClick={() => onChangeStatus(order.id, "completed")}>
              <i className="iconoir-check-double me-1"></i>Termin&eacute;
            </button>
          )}
          {(order.status === "pending" || order.status === "confirmed") && (
            <button className="btn btn-sm btn-outline-danger" onClick={() => onChangeStatus(order.id, "cancelled")}>
              Annuler
            </button>
          )}
          <a
            href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-outline-success"
          >
            <i className="fa-brands fa-whatsapp me-1"></i>WhatsApp
          </a>
          <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(order.id)} title="Supprimer">
            <i className="iconoir-trash"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
