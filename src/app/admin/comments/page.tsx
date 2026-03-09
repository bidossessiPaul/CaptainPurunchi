"use client";

import { useState, useEffect, useCallback } from "react";
import ConfirmModal from "../ConfirmModal";

interface Comment {
  id: string;
  postId: string;
  name: string;
  email: string;
  text: string;
  approved: boolean;
  createdAt: string;
  post: { title: string };
}

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    const res = await fetch("/api/comments");
    const data = await res.json();
    setComments(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleApprove = async (id: string, approved: boolean) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, approved } : c))
    );
    await fetch(`/api/comments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget;
    setDeleteTarget(null);
    setComments((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/comments/${id}`, { method: "DELETE" });
  };

  const filtered = comments.filter((c) => {
    if (filter === "pending") return !c.approved;
    if (filter === "approved") return c.approved;
    return true;
  });

  const pendingCount = comments.filter((c) => !c.approved).length;

  if (loading) {
    return (
      <div className="container-xxl">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box">
              <h4 className="page-title">Commentaires</h4>
            </div>
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3 text-muted">Chargement des commentaires...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-xxl">
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <h4 className="page-title">Commentaires</h4>
          </div>

          <div className="row mb-3">
            <div className="col d-flex align-items-center gap-3">
              <div className="btn-group btn-group-sm">
                <button
                  className={`btn ${filter === "all" ? "btn-primary" : "btn-light"}`}
                  onClick={() => setFilter("all")}
                >
                  Tous ({comments.length})
                </button>
                <button
                  className={`btn ${filter === "pending" ? "btn-warning" : "btn-light"}`}
                  onClick={() => setFilter("pending")}
                >
                  En attente ({pendingCount})
                </button>
                <button
                  className={`btn ${filter === "approved" ? "btn-success" : "btn-light"}`}
                  onClick={() => setFilter("approved")}
                >
                  Approuvés ({comments.length - pendingCount})
                </button>
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="fa-solid fa-comments" style={{ fontSize: "48px", color: "#95a0c5" }}></i>
                <h5 className="mt-3">Aucun commentaire</h5>
                <p className="text-muted">
                  {filter === "pending"
                    ? "Pas de commentaires en attente de modération."
                    : "Aucun commentaire pour le moment."}
                </p>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "15%" }}>Auteur</th>
                        <th style={{ width: "35%" }}>Commentaire</th>
                        <th style={{ width: "20%" }}>Article</th>
                        <th style={{ width: "12%" }}>Date</th>
                        <th style={{ width: "8%" }}>Statut</th>
                        <th style={{ width: "10%" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((c) => (
                        <tr key={c.id}>
                          <td>
                            <strong className="fs-13">{c.name}</strong>
                            {c.email && (
                              <div className="text-muted fs-12">{c.email}</div>
                            )}
                          </td>
                          <td>
                            <p className="mb-0 fs-13" style={{ maxWidth: 400, whiteSpace: "pre-wrap" }}>
                              {c.text}
                            </p>
                          </td>
                          <td>
                            <span className="fs-13 text-muted">{c.post.title}</span>
                          </td>
                          <td>
                            <span className="fs-12 text-muted">
                              {new Date(c.createdAt).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </td>
                          <td>
                            {c.approved ? (
                              <span className="badge bg-success-subtle text-success">Approuvé</span>
                            ) : (
                              <span className="badge bg-warning-subtle text-warning">En attente</span>
                            )}
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              {!c.approved ? (
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() => handleApprove(c.id, true)}
                                  title="Approuver"
                                >
                                  <i className="fa-solid fa-check"></i>
                                </button>
                              ) : (
                                <button
                                  className="btn btn-sm btn-outline-warning"
                                  onClick={() => handleApprove(c.id, false)}
                                  title="Masquer"
                                >
                                  <i className="fa-solid fa-eye-slash"></i>
                                </button>
                              )}
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => setDeleteTarget(c.id)}
                                title="Supprimer"
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={deleteTarget !== null}
        title="Supprimer le commentaire"
        message="Voulez-vous vraiment supprimer ce commentaire ?"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
