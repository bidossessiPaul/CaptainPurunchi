"use client";

import { useState, useEffect } from "react";
import type { UserPublic } from "@/lib/user-store";
import { ROLES, type Role } from "@/lib/permissions";
import UserForm from "./UserForm";

interface Props {
  initialUsers: UserPublic[];
}

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function TeamManager({ initialUsers }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<UserPublic | null>(null);
  const [me, setMe] = useState<CurrentUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setMe(data); })
      .catch(() => {});
  }, []);

  const refresh = async () => {
    const res = await fetch("/api/users");
    if (res.ok) setUsers(await res.json());
  };

  const handleSave = async (data: { name: string; email: string; password: string; role: string }, id?: string) => {
    const url = id ? `/api/users/${id}` : "/api/users";
    const method = id ? "PATCH" : "POST";
    const body: Record<string, string> = { name: data.name, email: data.email, role: data.role };
    if (data.password) body.password = data.password;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Erreur");
    }

    setShowForm(false);
    setEditUser(null);
    await refresh();
  };

  const handleToggleActive = async (user: UserPublic) => {
    await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !user.active }),
    });
    await refresh();
  };

  const handleDelete = async (user: UserPublic) => {
    if (!confirm(`Supprimer ${user.name} ?`)) return;
    await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    await refresh();
  };

  const roleLabel = (role: string) => ROLES[role as Role] || role;

  const roleColor: Record<string, string> = {
    super_admin: "danger",
    director: "primary",
    manager: "info",
    accountant: "warning",
    cashier: "secondary",
    waiter: "success",
    receptionist: "primary",
    chef: "warning",
  };

  const formatDate = (d: string | null) => {
    if (!d) return "Jamais";
    return new Date(d).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canManage = me?.role === "super_admin" || me?.role === "director";

  const initials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      {(showForm || editUser) && (
        <UserForm
          user={editUser}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditUser(null); }}
        />
      )}

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <div className="row align-items-center">
                <div className="col">
                  <h4 className="card-title">
                    Membres de l&apos;équipe
                    <span className="badge bg-primary-subtle text-primary ms-2">{users.length}</span>
                  </h4>
                </div>
                {canManage && (
                  <div className="col-auto">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => { setEditUser(null); setShowForm(true); }}
                    >
                      <i className="fa-solid fa-plus me-1"></i>
                      Ajouter un membre
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="card-body pt-0">
              {users.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fa-solid fa-users fs-1 text-muted mb-3 d-block"></i>
                  <p className="text-muted mb-0">Aucun membre dans l&apos;équipe</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Membre</th>
                        <th>Rôle</th>
                        <th>Statut</th>
                        <th>Dernière connexion</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div
                                className={`flex-shrink-0 bg-${roleColor[u.role] || "secondary"}-subtle text-${roleColor[u.role] || "secondary"} thumb-sm rounded-circle d-flex align-items-center justify-content-center`}
                              >
                                <span className="fw-semibold fs-13">{initials(u.name)}</span>
                              </div>
                              <div className="ms-2">
                                <h6 className="mb-0 fs-13">{u.name}</h6>
                                <small className="text-muted">{u.email}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge bg-${roleColor[u.role] || "secondary"}-subtle text-${roleColor[u.role] || "secondary"}`}>
                              {roleLabel(u.role)}
                            </span>
                          </td>
                          <td>
                            {u.active ? (
                              <span className="badge bg-success-subtle text-success">Actif</span>
                            ) : (
                              <span className="badge bg-danger-subtle text-danger">Désactivé</span>
                            )}
                          </td>
                          <td>
                            <small className="text-muted">{formatDate(u.lastLogin)}</small>
                          </td>
                          <td className="text-end">
                            {canManage && (
                              <>
                                <button
                                  className="btn btn-sm btn-light me-1"
                                  onClick={() => setEditUser(u)}
                                  title="Modifier"
                                >
                                  <i className="fa-solid fa-pen-to-square"></i>
                                </button>
                                <button
                                  className={`btn btn-sm ${u.active ? "btn-warning" : "btn-success"} me-1`}
                                  onClick={() => handleToggleActive(u)}
                                  title={u.active ? "Désactiver" : "Activer"}
                                >
                                  <i className={`fa-solid ${u.active ? "fa-ban" : "fa-check"}`}></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleDelete(u)}
                                  title="Supprimer"
                                >
                                  <i className="fa-solid fa-trash"></i>
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
