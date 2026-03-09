import type { RoomReservation } from "@/app/types/room-reservation";

const STATUS_COLORS: Record<string, string> = {
  pending: "warning",
  confirmed: "primary",
  completed: "success",
  cancelled: "danger",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmé",
  completed: "Terminé",
  cancelled: "Annulé",
};

function fmtDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function RoomReservationCard({
  reservation,
  onChangeStatus,
  onDelete,
}: {
  reservation: RoomReservation;
  onChangeStatus: (id: string, status: RoomReservation["status"]) => void;
  onDelete: (id: string) => void;
}) {
  const r = reservation;

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h5 className="mb-1">{r.customerName}</h5>
            <a href={`tel:${r.customerPhone}`} className="text-muted fs-13">
              <i className="iconoir-phone me-1"></i>{r.customerPhone}
            </a>
          </div>
          <span className={`badge bg-${STATUS_COLORS[r.status]}`}>
            {STATUS_LABELS[r.status]}
          </span>
        </div>

        <div className="mb-2">
          <div className="fs-13 mb-1">
            <i className="iconoir-home-alt me-1 text-primary"></i>
            <strong>{r.roomName}</strong>
          </div>
          <div className="fs-13 text-muted mb-1">
            <i className="iconoir-calendar me-1"></i>
            {fmtDate(r.checkIn)} → {fmtDate(r.checkOut)}
          </div>
          {r.guests && (
            <div className="fs-13 text-muted mb-1">
              <i className="iconoir-user me-1"></i> {r.guests}
            </div>
          )}
          {r.notes && (
            <div className="fs-13 text-muted">
              <i className="iconoir-message me-1"></i> {r.notes}
            </div>
          )}
        </div>

        <div className="d-flex gap-1 flex-wrap">
          {r.status === "pending" && (
            <button className="btn btn-sm btn-outline-primary" onClick={() => onChangeStatus(r.id, "confirmed")}>
              Confirmer
            </button>
          )}
          {r.status === "confirmed" && (
            <button className="btn btn-sm btn-outline-success" onClick={() => onChangeStatus(r.id, "completed")}>
              Terminer
            </button>
          )}
          {(r.status === "pending" || r.status === "confirmed") && (
            <button className="btn btn-sm btn-outline-warning" onClick={() => onChangeStatus(r.id, "cancelled")}>
              Annuler
            </button>
          )}
          <button className="btn btn-sm btn-outline-danger ms-auto" onClick={() => onDelete(r.id)}>
            <i className="iconoir-trash"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
