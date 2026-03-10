"use client";

import { useState, useEffect, useRef } from "react";
import { ROLES, type Role } from "@/lib/permissions";

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
}

export default function ProfileManager() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pwdMsg, setPwdMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setUser(data);
          setName(data.name);
          setEmail(data.email);
        }
      })
      .catch(() => {});
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/users/${user.id}/avatar`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setUser({ ...user, avatar: data.avatar });
        setMsg({ type: "success", text: "Avatar mis à jour" });
      } else {
        const err = await res.json();
        setMsg({ type: "error", text: err.error || "Erreur upload" });
      }
    } catch {
      setMsg({ type: "error", text: "Erreur de connexion" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (res.ok) {
        const updated = await res.json();
        setUser({ ...user, name: updated.name, email: updated.email });
        setMsg({ type: "success", text: "Profil mis à jour" });
      } else {
        const err = await res.json();
        setMsg({ type: "error", text: err.error || "Erreur" });
      }
    } catch {
      setMsg({ type: "error", text: "Erreur de connexion" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setPwdMsg(null);

    if (newPassword.length < 6) {
      setPwdMsg({ type: "error", text: "Le mot de passe doit contenir au moins 6 caractères" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: "error", text: "Les mots de passe ne correspondent pas" });
      return;
    }

    setSavingPwd(true);

    try {
      // Verify current password by attempting login
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, password: currentPassword }),
      });

      if (!loginRes.ok) {
        setPwdMsg({ type: "error", text: "Mot de passe actuel incorrect" });
        setSavingPwd(false);
        return;
      }

      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });

      if (res.ok) {
        setPwdMsg({ type: "success", text: "Mot de passe modifié avec succès" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const err = await res.json();
        setPwdMsg({ type: "error", text: err.error || "Erreur" });
      }
    } catch {
      setPwdMsg({ type: "error", text: "Erreur de connexion" });
    } finally {
      setSavingPwd(false);
    }
  };

  const roleLabel = (role: string) => ROLES[role as Role] || role;

  const initials = (n: string) =>
    n.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  if (!user) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="row">
      {/* Avatar + Info card */}
      <div className="col-lg-4">
        <div className="card">
          <div className="card-body text-center">
            {/* Avatar */}
            <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "4px solid #e9ecef",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #5BC0EB, #3a9cc7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 40,
                    fontWeight: 700,
                    border: "4px solid #e9ecef",
                  }}
                >
                  {initials(user.name)}
                </div>
              )}

              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                style={{
                  position: "absolute",
                  bottom: 4,
                  right: 4,
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "#1a3a5c",
                  color: "#fff",
                  border: "3px solid #fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                }}
              >
                {uploading ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  <i className="fa-solid fa-camera"></i>
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />
            </div>

            <h5 style={{ color: "#1a3a5c", fontWeight: 700, marginBottom: 4 }}>
              {user.name}
            </h5>
            <p style={{ color: "#8a92a6", fontSize: 14, marginBottom: 8 }}>
              {user.email}
            </p>
            <span
              className="badge"
              style={{
                background: "linear-gradient(135deg, #5BC0EB, #3a9cc7)",
                color: "#fff",
                padding: "6px 16px",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {roleLabel(user.role)}
            </span>
          </div>
        </div>
      </div>

      {/* Edit forms */}
      <div className="col-lg-8">
        {/* Info form */}
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">
              <i className="fa-solid fa-user-pen me-2" style={{ color: "#5BC0EB" }}></i>
              Informations personnelles
            </h4>
          </div>
          <div className="card-body">
            {msg && (
              <div className={`alert alert-${msg.type === "success" ? "success" : "danger"} py-2`} style={{ fontSize: 13 }}>
                {msg.text}
              </div>
            )}
            <form onSubmit={handleSaveInfo}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Nom complet</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="text-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <span className="spinner-border spinner-border-sm me-1" />
                  ) : (
                    <i className="fa-solid fa-check me-1"></i>
                  )}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Password form */}
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">
              <i className="fa-solid fa-lock me-2" style={{ color: "#5BC0EB" }}></i>
              Changer le mot de passe
            </h4>
          </div>
          <div className="card-body">
            {pwdMsg && (
              <div className={`alert alert-${pwdMsg.type === "success" ? "success" : "danger"} py-2`} style={{ fontSize: 13 }}>
                {pwdMsg.text}
              </div>
            )}
            <form onSubmit={handleChangePassword}>
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Mot de passe actuel</label>
                <input
                  type="password"
                  className="form-control"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Nouveau mot de passe</label>
                  <input
                    type="password"
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Confirmer le mot de passe</label>
                  <input
                    type="password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <div className="text-end">
                <button
                  type="submit"
                  className="btn btn-warning"
                  disabled={savingPwd}
                >
                  {savingPwd ? (
                    <span className="spinner-border spinner-border-sm me-1" />
                  ) : (
                    <i className="fa-solid fa-key me-1"></i>
                  )}
                  Changer le mot de passe
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
