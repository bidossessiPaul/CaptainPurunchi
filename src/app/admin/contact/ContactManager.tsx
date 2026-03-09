"use client";

import { useState, useEffect, useCallback } from "react";

interface ContactForm {
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  hours1Label: string;
  hours1Value: string;
  hours2Label: string;
  hours2Value: string;
  hours3Label: string;
  hours3Value: string;
  footerDesc: string;
}

const defaultForm: ContactForm = {
  phone: "",
  email: "",
  address: "",
  whatsapp: "",
  facebook: "",
  instagram: "",
  hours1Label: "",
  hours1Value: "",
  hours2Label: "",
  hours2Value: "",
  hours3Label: "",
  hours3Value: "",
  footerDesc: "",
};

export default function ContactManager() {
  const [form, setForm] = useState<ContactForm>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchContact = useCallback(async () => {
    const res = await fetch("/api/contact");
    const data = await res.json();
    setForm({
      phone: data.phone || "",
      email: data.email || "",
      address: data.address || "",
      whatsapp: data.whatsapp || "",
      facebook: data.facebook || "",
      instagram: data.instagram || "",
      hours1Label: data.hours1Label || "",
      hours1Value: data.hours1Value || "",
      hours2Label: data.hours2Label || "",
      hours2Value: data.hours2Value || "",
      hours3Label: data.hours3Label || "",
      hours3Value: data.hours3Value || "",
      footerDesc: data.footerDesc || "",
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchContact();
  }, [fetchContact]);

  const handleChange = (field: keyof ContactForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/contact", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3 text-muted">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      {/* Coordonn&eacute;es */}
      <div className="col-lg-6">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">
              <i className="iconoir-phone me-2"></i>
              Coordonn&eacute;es
            </h5>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">T&eacute;l&eacute;phone</label>
              <input
                type="text"
                className="form-control"
                placeholder="+229 XX XX XX XX"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="contact@captainpurunchi.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Adresse</label>
              <input
                type="text"
                className="form-control"
                placeholder="Cotonou, B&eacute;nin"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Description footer</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Votre escale gourmande au c&oelig;ur de Cotonou..."
                value={form.footerDesc}
                onChange={(e) => handleChange("footerDesc", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* R&eacute;seaux sociaux */}
      <div className="col-lg-6">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">
              <i className="iconoir-internet me-2"></i>
              R&eacute;seaux sociaux
            </h5>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">WhatsApp (num&eacute;ro avec indicatif, sans +)</label>
              <div className="input-group">
                <span className="input-group-text"><i className="fa-brands fa-whatsapp"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="22901234567"
                  value={form.whatsapp}
                  onChange={(e) => handleChange("whatsapp", e.target.value)}
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Facebook (URL)</label>
              <div className="input-group">
                <span className="input-group-text"><i className="fa-brands fa-facebook"></i></span>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://facebook.com/captainpurunchi"
                  value={form.facebook}
                  onChange={(e) => handleChange("facebook", e.target.value)}
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Instagram (URL)</label>
              <div className="input-group">
                <span className="input-group-text"><i className="fa-brands fa-instagram"></i></span>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://instagram.com/captainpurunchi"
                  value={form.instagram}
                  onChange={(e) => handleChange("instagram", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Horaires */}
      <div className="col-lg-12">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">
              <i className="iconoir-clock me-2"></i>
              Horaires d&apos;ouverture
            </h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label">Plage 1 - Jours</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Lundi – Jeudi"
                    value={form.hours1Label}
                    onChange={(e) => handleChange("hours1Label", e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Plage 1 - Heures</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="11h – 23h"
                    value={form.hours1Value}
                    onChange={(e) => handleChange("hours1Value", e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label">Plage 2 - Jours</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Vendredi – Samedi"
                    value={form.hours2Label}
                    onChange={(e) => handleChange("hours2Label", e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Plage 2 - Heures</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="11h – 03h"
                    value={form.hours2Value}
                    onChange={(e) => handleChange("hours2Value", e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label">Plage 3 - Jours</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Dimanche"
                    value={form.hours3Label}
                    onChange={(e) => handleChange("hours3Label", e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Plage 3 - Heures</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="10h – 22h"
                    value={form.hours3Value}
                    onChange={(e) => handleChange("hours3Value", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="col-12">
        <div className="d-flex gap-2 align-items-center">
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Enregistrement...
              </>
            ) : (
              <>
                <i className="fa-solid fa-floppy-disk me-1"></i>
                Enregistrer
              </>
            )}
          </button>
          {saved && (
            <span className="text-success">
              <i className="iconoir-check me-1"></i>
              Enregistr&eacute; avec succ&egrave;s
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
