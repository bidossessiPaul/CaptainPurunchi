"use client";

import { useState } from "react";
import type { UserPublic } from "@/lib/user-store";
import { ROLE_LIST } from "@/lib/permissions";

interface Props {
  user: UserPublic | null;
  onSave: (data: { name: string; email: string; password: string; role: string }, id?: string) => Promise<void>;
  onCancel: () => void;
}

export default function UserForm({ user, onSave, onCancel }: Props) {
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(user?.role ?? "waiter");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isEditing = !!user;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || (!isEditing && !password) || !role) {
      setError("Tous les champs obligatoires doivent être remplis");
      return;
    }

    setLoading(true);
    try {
      await onSave({ name, email, password, role }, user?.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row mb-3">
      <div className="col-lg-8 col-xl-6">
        <div className="card border">
          <div className="card-header">
            <h4 className="card-title">{isEditing ? "Modifier le membre" : "Nouveau membre"}</h4>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Nom complet *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jean Dupont"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jean@captainpurunchi.com"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Mot de passe {isEditing ? "(laisser vide pour ne pas changer)" : "*"}
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isEditing ? "••••••••" : "Mot de passe"}
                    required={!isEditing}
                    minLength={6}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Rôle *</label>
                  <select
                    className="form-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    {ROLE_LIST.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <div className="alert alert-danger mt-3 mb-0 py-2">{error}</div>
              )}

              <div className="d-flex gap-2 mt-3">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Enregistrement..." : isEditing ? "Enregistrer" : "Créer le compte"}
                </button>
                <button type="button" className="btn btn-light" onClick={onCancel}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
