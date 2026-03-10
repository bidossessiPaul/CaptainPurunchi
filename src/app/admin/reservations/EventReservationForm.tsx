"use client";

import { useState, useEffect } from "react";
import type { EventReservation } from "@/app/types/event-reservation";
import type { Event } from "@/app/types/event";
import { PAYMENT_METHODS } from "@/lib/constants";

interface Props {
  reservation: EventReservation | null;
  onSave: () => void;
  onCancel: () => void;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmé" },
  { value: "completed", label: "Terminé" },
  { value: "cancelled", label: "Annulé" },
];

export default function EventReservationForm({ reservation, onSave, onCancel }: Props) {
  const [customerName, setCustomerName] = useState(reservation?.customerName ?? "");
  const [customerPhone, setCustomerPhone] = useState(reservation?.customerPhone ?? "");
  const [customerEmail, setCustomerEmail] = useState(reservation?.customerEmail ?? "");
  const [eventId, setEventId] = useState(reservation?.eventId ?? "");
  const [eventTitle, setEventTitle] = useState(reservation?.eventTitle ?? "");
  const [attendees, setAttendees] = useState(reservation?.attendees ?? "");
  const [notes, setNotes] = useState(reservation?.notes ?? "");
  const [status, setStatus] = useState(reservation?.status ?? "pending");
  const [paymentMethod, setPaymentMethod] = useState(reservation?.paymentMethod ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);

  const isEditing = !!reservation;

  useEffect(() => {
    fetch("/api/events").then((r) => r.json()).then(setEvents).catch(() => {});
  }, []);

  const handleEventChange = (id: string) => {
    setEventId(id);
    const ev = events.find((e) => e.id === id);
    if (ev) setEventTitle(ev.title);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!customerName || !customerPhone || !eventId || !eventTitle) {
      setError("Nom, téléphone et événement sont obligatoires");
      return;
    }

    setLoading(true);
    try {
      const body = { customerName, customerPhone, customerEmail, eventId, eventTitle, attendees, notes, status, paymentMethod };
      const url = isEditing ? `/api/event-reservations/${reservation.id}` : "/api/event-reservations";
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
              {isEditing ? "Modifier la réservation événement" : "Nouvelle réservation événement"}
            </h4>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Nom *</label>
                  <input type="text" className="form-control" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Téléphone *</label>
                  <input type="tel" className="form-control" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Email</label>
                  <input type="email" className="form-control" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Événement *</label>
                  <select className="form-select" value={eventId} onChange={(e) => handleEventChange(e.target.value)} required>
                    <option value="">Sélectionner un événement</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>{ev.title}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Participants</label>
                  <input type="text" className="form-control" value={attendees} onChange={(e) => setAttendees(e.target.value)} placeholder="ex: 3 personnes" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Mode de paiement</label>
                  <select className="form-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Notes</label>
                  <textarea className="form-control" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
                </div>
                {isEditing && (
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Statut</label>
                    <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value as EventReservation["status"])}>
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                )}
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
