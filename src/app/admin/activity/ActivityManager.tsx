"use client";

import { useState, useEffect, useCallback } from "react";

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  targetId: string | null;
  details: string;
  createdAt: string;
}

const ACTION_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  create: { label: "Création", color: "success", icon: "fa-plus" },
  update: { label: "Modification", color: "info", icon: "fa-pen" },
  delete: { label: "Suppression", color: "danger", icon: "fa-trash" },
  login: { label: "Connexion", color: "primary", icon: "fa-right-to-bracket" },
  logout: { label: "Déconnexion", color: "secondary", icon: "fa-right-from-bracket" },
};

const TARGET_LABELS: Record<string, string> = {
  user: "Utilisateur",
  order: "Commande",
  reservation: "Réservation",
  menu: "Menu",
  "daily-menu": "Menu du jour",
  hero: "Hero",
  specialty: "Spécialité",
  gallery: "Galerie",
  room: "Chambre",
  event: "Événement",
  testimonial: "Avis",
  blog: "Blog",
  comment: "Commentaire",
  contact: "Contact",
  session: "Session",
};

export default function ActivityManager() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("");
  const [filterTarget, setFilterTarget] = useState("");
  const [page, setPage] = useState(0);
  const limit = 25;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      params.set("offset", String(page * limit));
      if (filterAction) params.set("action", filterAction);
      if (filterTarget) params.set("target", filterTarget);

      const res = await fetch(`/api/activity-logs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setTotal(data.total);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [page, filterAction, filterTarget]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const totalPages = Math.ceil(total / limit);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const actionInfo = (action: string) =>
    ACTION_LABELS[action] || { label: action, color: "secondary", icon: "fa-circle" };

  const targetLabel = (target: string) => TARGET_LABELS[target] || target;

  return (
    <div className="row">
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <div className="row align-items-center">
              <div className="col">
                <h4 className="card-title">
                  Journal d&apos;activité
                  <span className="badge bg-primary-subtle text-primary ms-2">{total}</span>
                </h4>
              </div>
              <div className="col-auto d-flex gap-2">
                <select
                  className="form-select form-select-sm"
                  value={filterAction}
                  onChange={(e) => { setFilterAction(e.target.value); setPage(0); }}
                  style={{ width: "auto" }}
                >
                  <option value="">Toutes les actions</option>
                  <option value="create">Création</option>
                  <option value="update">Modification</option>
                  <option value="delete">Suppression</option>
                  <option value="login">Connexion</option>
                  <option value="logout">Déconnexion</option>
                </select>
                <select
                  className="form-select form-select-sm"
                  value={filterTarget}
                  onChange={(e) => { setFilterTarget(e.target.value); setPage(0); }}
                  style={{ width: "auto" }}
                >
                  <option value="">Toutes les cibles</option>
                  <option value="user">Utilisateur</option>
                  <option value="order">Commande</option>
                  <option value="reservation">Réservation</option>
                  <option value="menu">Menu</option>
                  <option value="daily-menu">Menu du jour</option>
                  <option value="hero">Hero</option>
                  <option value="specialty">Spécialité</option>
                  <option value="gallery">Galerie</option>
                  <option value="room">Chambre</option>
                  <option value="event">Événement</option>
                  <option value="testimonial">Avis</option>
                  <option value="blog">Blog</option>
                  <option value="comment">Commentaire</option>
                  <option value="contact">Contact</option>
                  <option value="session">Session</option>
                </select>
              </div>
            </div>
          </div>
          <div className="card-body pt-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-5">
                <i className="fa-solid fa-clock-rotate-left fs-1 text-muted mb-3 d-block"></i>
                <p className="text-muted mb-0">Aucune activité enregistrée</p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Utilisateur</th>
                        <th>Action</th>
                        <th>Cible</th>
                        <th>Détails</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => {
                        const info = actionInfo(log.action);
                        return (
                          <tr key={log.id}>
                            <td>
                              <small className="text-muted">{formatDate(log.createdAt)}</small>
                            </td>
                            <td>
                              <span className="fw-semibold">{log.userName}</span>
                            </td>
                            <td>
                              <span className={`badge bg-${info.color}-subtle text-${info.color}`}>
                                <i className={`fa-solid ${info.icon} me-1`} style={{ fontSize: 10 }}></i>
                                {info.label}
                              </span>
                            </td>
                            <td>{targetLabel(log.target)}</td>
                            <td>
                              <small className="text-muted" style={{ maxWidth: 300, display: "inline-block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {log.details || "—"}
                              </small>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <small className="text-muted">
                      Page {page + 1} sur {totalPages} ({total} entrées)
                    </small>
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-sm btn-light"
                        disabled={page === 0}
                        onClick={() => setPage((p) => p - 1)}
                      >
                        <i className="fa-solid fa-chevron-left"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-light"
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        <i className="fa-solid fa-chevron-right"></i>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
