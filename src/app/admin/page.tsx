import Link from "next/link";
import { readPendingTableReservationsCount, readTableReservationsByDate } from "@/lib/table-reservation-store";
import { readPendingOrdersCount, readOrdersByDate } from "@/lib/order-store";
import { readPendingRoomReservationsCount } from "@/lib/room-reservation-store";
import { readPendingEventReservationsCount } from "@/lib/event-reservation-store";
import { readTodaysDishes } from "@/lib/daily-dish-store";
import TrendsChart from "./TrendsChart";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const today = new Date().toISOString().split("T")[0];

  const [
    pendingTables,
    pendingOrders,
    pendingRooms,
    pendingEvents,
    todayReservations,
    todayOrders,
    todayDishes,
  ] = await Promise.all([
    readPendingTableReservationsCount(),
    readPendingOrdersCount(),
    readPendingRoomReservationsCount(),
    readPendingEventReservationsCount(),
    readTableReservationsByDate(today),
    readOrdersByDate(today),
    readTodaysDishes(),
  ]);

  const statusLabel: Record<string, { text: string; cls: string }> = {
    pending: { text: "En attente", cls: "warning" },
    confirmed: { text: "Confirmée", cls: "success" },
    completed: { text: "Terminée", cls: "info" },
    cancelled: { text: "Annulée", cls: "danger" },
  };

  const initials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const avatarColors = ["primary", "info", "success", "warning", "danger"];

  return (
    <>
      {/* Page Title */}
      <div className="row">
        <div className="col-sm-12">
          <div className="page-title-box d-md-flex justify-content-md-between align-items-center">
            <h4 className="page-title">Tableau de bord</h4>
            <div>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><Link href="/admin">Admin</Link></li>
                <li className="breadcrumb-item active">Tableau de bord</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="row justify-content-center">
        <StatCard
          icon="fa-solid fa-calendar-days"
          color="primary"
          label="Réservations tables"
          sub="En attente"
          value={pendingTables}
          href="/admin/reservations"
        />
        <StatCard
          icon="fa-solid fa-bag-shopping"
          color="info"
          label="Commandes"
          sub="En attente"
          value={pendingOrders}
          href="/admin/orders"
        />
        <StatCard
          icon="fa-solid fa-bed"
          color="warning"
          label="Réservations chambres"
          sub="En attente"
          value={pendingRooms}
          href="/admin/reservations?type=room"
        />
        <StatCard
          icon="fa-solid fa-people-group"
          color="danger"
          label="Réservations événements"
          sub="En attente"
          value={pendingEvents}
          href="/admin/reservations?type=event"
        />
      </div>

      {/* Graphique tendances */}
      <div className="row">
        <div className="col-12">
          <TrendsChart />
        </div>
      </div>

      {/* Réservations du jour + Commandes du jour */}
      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <div className="row align-items-center">
                <div className="col">
                  <h4 className="card-title">Réservations du jour</h4>
                </div>
                <div className="col-auto">
                  <Link href="/admin/reservations" className="btn btn-sm btn-light">
                    Voir tout <i className="fa-solid fa-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </div>
            <div className="card-body pt-0">
              {todayReservations.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fa-solid fa-calendar-xmark fs-1 text-muted mb-3 d-block"></i>
                  <p className="text-muted mb-0">Aucune réservation pour aujourd&apos;hui</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Client</th>
                        <th>Heure</th>
                        <th>Personnes</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayReservations.slice(0, 6).map((r, i) => {
                        const s = statusLabel[r.status] ?? statusLabel.pending;
                        return (
                          <tr key={r.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className={`flex-shrink-0 bg-${avatarColors[i % avatarColors.length]}-subtle text-${avatarColors[i % avatarColors.length]} thumb-sm rounded-circle d-flex align-items-center justify-content-center`}>
                                  <span className="fw-semibold fs-13">{initials(r.name)}</span>
                                </div>
                                <div className="flex-grow-1 ms-2">
                                  <h6 className="mb-0 fs-13">{r.name}</h6>
                                </div>
                              </div>
                            </td>
                            <td>{r.time}</td>
                            <td>{r.numberOfPersons}</td>
                            <td>
                              <span className={`badge bg-${s.cls}-subtle text-${s.cls}`}>{s.text}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <div className="row align-items-center">
                <div className="col">
                  <h4 className="card-title">Commandes du jour</h4>
                </div>
                <div className="col-auto">
                  <Link href="/admin/orders" className="btn btn-sm btn-light">
                    Voir tout <i className="fa-solid fa-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </div>
            <div className="card-body pt-0">
              {todayOrders.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fa-solid fa-basket-shopping fs-1 text-muted mb-3 d-block"></i>
                  <p className="text-muted mb-0">Aucune commande pour aujourd&apos;hui</p>
                </div>
              ) : (
                <>
                  {todayOrders.slice(0, 5).map((o) => {
                    const s = statusLabel[o.status] ?? statusLabel.pending;
                    return (
                      <div key={o.id} className="d-flex align-items-center py-3 border-bottom">
                        <div className={`flex-shrink-0 bg-${s.cls}-subtle text-${s.cls} thumb-md rounded d-flex align-items-center justify-content-center`}>
                          <i className="fa-solid fa-bag-shopping fs-5"></i>
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <h6 className="mb-1 fw-semibold fs-13">{o.customerName}</h6>
                          <p className="text-muted mb-0 fs-13">
                            {o.items.length} article{o.items.length > 1 ? "s" : ""} &bull; {o.totalAmount}&nbsp;FCFA
                          </p>
                        </div>
                        <span className={`badge bg-${s.cls}-subtle text-${s.cls}`}>{s.text}</span>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menu du jour + Accès rapide */}
      <div className="row">
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">
              <div className="row align-items-center">
                <div className="col">
                  <h4 className="card-title">Menu du jour</h4>
                </div>
                <div className="col-auto">
                  <Link href="/admin/daily-menu" className="btn btn-sm btn-light">
                    Gérer <i className="fa-solid fa-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </div>
            <div className="card-body pt-0">
              {todayDishes.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fa-solid fa-utensils fs-1 text-muted mb-3 d-block"></i>
                  <p className="text-muted mb-2">Aucun plat prévu pour aujourd&apos;hui</p>
                  <Link href="/admin/daily-menu" className="btn btn-sm btn-primary">
                    <i className="fa-solid fa-plus me-1"></i> Ajouter des plats
                  </Link>
                </div>
              ) : (
                <>
                  {todayDishes.map((d) => (
                    <div key={d.id} className="d-flex align-items-center py-3 border-bottom">
                      {d.photo ? (
                        <img
                          src={d.photo}
                          alt={d.name}
                          className="rounded flex-shrink-0"
                          style={{ width: 48, height: 48, objectFit: "cover" }}
                        />
                      ) : (
                        <div className="flex-shrink-0 bg-warning-subtle text-warning thumb-md rounded d-flex align-items-center justify-content-center">
                          <i className="fa-solid fa-utensils fs-5"></i>
                        </div>
                      )}
                      <div className="flex-grow-1 ms-3">
                        <h6 className="mb-1 fw-semibold fs-13">{d.name}</h6>
                        <p className="text-muted mb-0 fs-13">{d.category}</p>
                      </div>
                      <span className="fw-bold" style={{ color: "var(--admin-primary-dark)" }}>
                        {d.price}&nbsp;FCFA
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Accès rapide</h4>
            </div>
            <div className="card-body pt-0">
              <div className="row g-2 pt-2">
                <QuickLink href="/admin/reservations" icon="fa-solid fa-calendar-days" color="primary" label="Réservations" />
                <QuickLink href="/admin/orders" icon="fa-solid fa-bag-shopping" color="info" label="Commandes" />
                <QuickLink href="/admin/menu" icon="fa-solid fa-cart-shopping" color="success" label="Notre Carte" />
                <QuickLink href="/admin/daily-menu" icon="fa-solid fa-utensils" color="warning" label="Menu du Jour" />
                <QuickLink href="/admin/gallery" icon="fa-solid fa-image" color="danger" label="Galerie" />
                <QuickLink href="/admin/events" icon="fa-solid fa-people-group" color="primary" label="Événements" />
                <QuickLink href="/admin/blog" icon="fa-solid fa-file-pen" color="info" label="Blog" />
                <QuickLink href="/admin/testimonials" icon="fa-solid fa-star" color="warning" label="Avis" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- Sub-components ---------- */

function StatCard({ icon, color, label, sub, value, href }: {
  icon: string; color: string; label: string; sub: string; value: number; href: string;
}) {
  return (
    <div className="col-md-6 col-lg-3">
      <Link href={href} style={{ textDecoration: "none" }}>
        <div className="card" style={{ cursor: "pointer" }}>
          <div className="card-body">
            <div className="d-flex align-items-center mb-3">
              <div className={`flex-shrink-0 bg-${color}-subtle text-${color} thumb-md rounded-circle d-flex align-items-center justify-content-center`}>
                <i className={`${icon} fs-5`}></i>
              </div>
              <div className="flex-grow-1 ms-2 text-truncate">
                <p className="text-dark mb-0 fw-semibold fs-14">{label}</p>
                <p className="mb-0 text-truncate text-muted">{sub}</p>
              </div>
            </div>
            <div className="row d-flex justify-content-center">
              <div className="col">
                <h3 className="mt-2 mb-0 fw-bold">{value}</h3>
              </div>
              <div className="col align-self-center text-end">
                {value > 0 ? (
                  <span className={`badge bg-${color}-subtle text-${color}`}>
                    <i className="fa-solid fa-clock me-1"></i>{value} en attente
                  </span>
                ) : (
                  <span className="badge bg-success-subtle text-success">
                    <i className="fa-solid fa-check me-1"></i>À jour
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

function QuickLink({ href, icon, color, label }: {
  href: string; icon: string; color: string; label: string;
}) {
  return (
    <div className="col-6">
      <Link
        href={href}
        className="d-flex align-items-center gap-2 p-3 rounded-3 text-decoration-none"
        style={{ background: `var(--admin-${color}-bg, rgba(91, 192, 235, 0.08))`, transition: "all 0.2s ease" }}
      >
        <div className={`flex-shrink-0 text-${color}`}>
          <i className={`${icon} fs-5`}></i>
        </div>
        <span className="fw-semibold fs-13" style={{ color: "var(--admin-text)" }}>{label}</span>
      </Link>
    </div>
  );
}
