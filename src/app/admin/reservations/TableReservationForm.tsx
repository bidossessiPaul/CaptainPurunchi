"use client";

import { useState } from "react";
import type { TableReservation } from "@/app/types/table-reservation";
import { PAYMENT_METHODS } from "@/lib/constants";

interface Props {
  reservation: TableReservation | null;
  initialDate?: string;
  onSave: () => void;
  onCancel: () => void;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmé" },
  { value: "completed", label: "Terminé" },
  { value: "cancelled", label: "Annulé" },
];

export default function TableReservationForm({ reservation, initialDate, onSave, onCancel }: Props) {
  const [name, setName] = useState(reservation?.name ?? "");
  const [phone, setPhone] = useState(reservation?.phone ?? "");
  const [email, setEmail] = useState(reservation?.email ?? "");
  const [numberOfPersons, setNumberOfPersons] = useState(reservation?.numberOfPersons ?? "");
  const [date, setDate] = useState(reservation?.date ?? initialDate ?? "");
  const [time, setTime] = useState(reservation?.time ?? "");
  const [message, setMessage] = useState(reservation?.message ?? "");
  const [status, setStatus] = useState(reservation?.status ?? "pending");
  const [paymentMethod, setPaymentMethod] = useState(reservation?.paymentMethod ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isEditing = !!reservation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !phone || !date || !time) {
      setError("Nom, téléphone, date et heure sont obligatoires");
      return;
    }

    setLoading(true);
    try {
      const body = { name, phone, email, numberOfPersons, date, time, message, status, paymentMethod };
      const url = isEditing ? `/api/table-reservations/${reservation.id}` : "/api/table-reservations";
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur serveur");
      }
      onSave();
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
            <h4 className="card-title">
              {isEditing ? "Modifier la réservation table" : "Nouvelle réservation table"}
            </h4>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Nom *</label>
                  <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Téléphone *</label>
                  <input type="tel" className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Email</label>
                  <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Nombre de personnes</label>
                  <input type="text" className="form-control" value={numberOfPersons} onChange={(e) => setNumberOfPersons(e.target.value)} placeholder="ex: 4 personnes" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Date *</label>
                  <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Heure *</label>
                  <input type="time" className="form-control" value={time} onChange={(e) => setTime(e.target.value)} required />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Message / Notes</label>
                  <textarea className="form-control" value={message} onChange={(e) => setMessage(e.target.value)} rows={2} />
                </div>
                {isEditing && (
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Statut</label>
                    <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value as TableReservation["status"])}>
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className={isEditing ? "col-md-6" : "col-md-6"}>
                  <label className="form-label fw-semibold">Mode de paiement</label>
                  <select className="form-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && <div className="alert alert-danger mt-3 mb-0 py-2">{error}</div>}

              <div className="d-flex gap-2 mt-3">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Enregistrement..." : isEditing ? "Enregistrer" : "Créer"}
                </button>
                <button type="button" className="btn btn-light" onClick={onCancel}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
