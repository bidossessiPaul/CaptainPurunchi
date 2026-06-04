"use client";

import { useState } from "react";

interface Props {
  roomId: string;
  roomName: string;
  whatsapp?: string;
}

export default function RoomBookingForm({ roomId, roomName, whatsapp }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const canSubmit = name.trim() && phone.trim() && checkIn && checkOut && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    await fetch("/api/room-reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: name,
        customerPhone: phone,
        customerEmail: email,
        roomId,
        roomName,
        checkIn,
        checkOut,
        guests,
        notes,
      }),
    });
    setSubmitting(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="rd-book-success">
        <div className="rd-book-success-icon"><i className="fa fa-check-circle"></i></div>
        <h4>Demande envoyée !</h4>
        <p>Nous vous contacterons rapidement pour confirmer votre réservation.</p>
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
              `Bonjour, je souhaite réserver la chambre "${roomName}" du ${checkIn} au ${checkOut}. Merci de confirmer.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rd-book-whatsapp"
          >
            <i className="fa fa-whatsapp"></i> Confirmer par WhatsApp
          </a>
        )}
      </div>
    );
  }

  return (
    <form className="rd-book-form" onSubmit={handleSubmit}>
      <div className="rd-book-field">
        <label>Nom complet *</label>
        <input type="text" placeholder="Votre nom" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div className="rd-book-field">
        <label>Téléphone *</label>
        <input type="tel" placeholder="Votre numéro" value={phone} onChange={e => setPhone(e.target.value)} required />
      </div>
      <div className="rd-book-field">
        <label>Email</label>
        <input type="email" placeholder="Pour recevoir la confirmation" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className="rd-book-row">
        <div className="rd-book-field">
          <label>Arrivée *</label>
          <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} required />
        </div>
        <div className="rd-book-field">
          <label>Départ *</label>
          <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} required />
        </div>
      </div>
      <div className="rd-book-field">
        <label>Nombre de personnes</label>
        <select value={guests} onChange={e => setGuests(e.target.value)}>
          <option value="">Sélectionnez</option>
          <option>1 personne</option>
          <option>2 personnes</option>
          <option>3 personnes</option>
          <option>4 personnes</option>
          <option>5 personnes et plus</option>
        </select>
      </div>
      <div className="rd-book-field">
        <label>Notes / demandes spéciales</label>
        <textarea placeholder="Ex: arrivée tardive, lit bébé…" value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
      </div>
      <button type="submit" className="rd-book-submit" disabled={!canSubmit}>
        {submitting ? "Envoi en cours…" : "Envoyer la demande"}
      </button>
    </form>
  );
}
