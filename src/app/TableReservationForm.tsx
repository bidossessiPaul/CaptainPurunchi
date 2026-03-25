"use client";

import { useState } from "react";

export default function TableReservationForm({ whatsapp }: { whatsapp?: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [numberOfPersons, setNumberOfPersons] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [lastReservation, setLastReservation] = useState({ name: "", date: "", time: "", numberOfPersons: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !numberOfPersons || !date || !time) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/table-reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email: email.trim() || undefined, numberOfPersons, date, time, message }),
      });

      if (res.ok) {
        setLastReservation({ name, date, time, numberOfPersons });
        setSuccess(true);
        setName("");
        setPhone("");
        setEmail("");
        setNumberOfPersons("");
        setDate("");
        setTime("");
        setMessage("");
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="reservation-success text-center" style={{ padding: "40px 20px" }}>
        <i className="fa fa-check-circle" style={{ fontSize: 48, color: "#25d366", marginBottom: 16 }}></i>
        <h3 style={{ color: "#1a3a5c", marginBottom: 10 }}>Réservation envoyée !</h3>
        <p style={{ color: "#666", marginBottom: 20 }}>
          Nous avons bien reçu votre demande de réservation.
          Nous vous confirmerons par téléphone.
        </p>
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
              `Bonjour, je viens de réserver une table pour ${lastReservation.numberOfPersons} le ${lastReservation.date} à ${lastReservation.time}. Merci de confirmer ma réservation.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="reserve-whatsapp-btn-light"
          >
            <i className="fa fa-whatsapp"></i> Confirmer par WhatsApp
          </a>
        )}
        <button
          className="hvr-underline-from-center"
          onClick={() => setSuccess(false)}
          style={{ cursor: "pointer", marginTop: 16 }}
        >
          NOUVELLE RÉSERVATION
        </button>
      </div>
    );
  }

  return (
    <form className="reservations-box" onSubmit={handleSubmit}>
      {error && (
        <div className="col-lg-12" style={{ marginBottom: 10 }}>
          <div style={{ color: "#dc3545", textAlign: "center", fontSize: 14 }}>{error}</div>
        </div>
      )}
      <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
        <div className="form-box">
          <input
            type="text"
            placeholder="Nom complet *"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>
      <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
        <div className="form-box">
          <input
            type="tel"
            placeholder="Téléphone *"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>
      <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
        <div className="form-box">
          <input
            type="email"
            placeholder="Email (pour recevoir la confirmation)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
      <div className="col-lg-4 col-md-4 col-sm-6 col-xs-12">
        <div className="form-box">
          <select
            className="form-control"
            required
            value={numberOfPersons}
            onChange={(e) => setNumberOfPersons(e.target.value)}
          >
            <option value="" disabled>Nombre de personnes *</option>
            <option>1 personne</option>
            <option>2 personnes</option>
            <option>3 personnes</option>
            <option>4 personnes</option>
            <option>5 personnes</option>
            <option>6+ personnes</option>
          </select>
        </div>
      </div>
      <div className="col-lg-4 col-md-4 col-sm-6 col-xs-12">
        <div className="form-box">
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>
      <div className="col-lg-4 col-md-4 col-sm-6 col-xs-12">
        <div className="form-box">
          <select
            className="form-control"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
          >
            <option value="" disabled>Heure *</option>
            <option>11h00</option>
            <option>12h00</option>
            <option>13h00</option>
            <option>14h00</option>
            <option>18h00</option>
            <option>19h00</option>
            <option>20h00</option>
            <option>21h00</option>
          </select>
        </div>
      </div>
      <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
        <div className="form-box">
          <textarea
            placeholder="Demandes spéciales (allergies, occasion, espace préféré, etc.)"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
        </div>
      </div>
      <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
        <div className="reserve-book-btn text-center">
          <button
            className="hvr-underline-from-center"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "ENVOI EN COURS..." : "R\u00c9SERVER MA TABLE"}
          </button>
        </div>
      </div>
    </form>
  );
}
