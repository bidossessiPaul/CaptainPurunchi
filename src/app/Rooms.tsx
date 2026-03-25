"use client";

import { useState } from "react";
import type { Room } from "@/app/types/room";

export default function Rooms({ rooms, whatsapp, hideTitle, grid }: { rooms: Room[]; whatsapp?: string; hideTitle?: boolean; grid?: boolean }) {
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [modalPhoto, setModalPhoto] = useState(0);
  const [showReserveForm, setShowReserveForm] = useState(false);
  const [resName, setResName] = useState("");
  const [resPhone, setResPhone] = useState("");
  const [resCheckIn, setResCheckIn] = useState("");
  const [resCheckOut, setResCheckOut] = useState("");
  const [resGuests, setResGuests] = useState("");
  const [resEmail, setResEmail] = useState("");
  const [resNotes, setResNotes] = useState("");
  const [resSubmitting, setResSubmitting] = useState(false);
  const [resSuccess, setResSuccess] = useState(false);

  const openModal = (index: number) => {
    setSelectedRoom(index);
    setModalPhoto(0);
  };

  const closeModal = () => {
    setSelectedRoom(null);
    setModalPhoto(0);
    setShowReserveForm(false);
    setResName("");
    setResPhone("");
    setResEmail("");
    setResCheckIn("");
    setResCheckOut("");
    setResGuests("");
    setResNotes("");
    setResSubmitting(false);
    setResSuccess(false);
  };

  const handleReserveSubmit = async (room: Room) => {
    if (!resName || !resPhone || !resCheckIn || !resCheckOut) return;
    setResSubmitting(true);
    await fetch("/api/room-reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: resName,
        customerPhone: resPhone,
        customerEmail: resEmail,
        roomId: room.id,
        roomName: room.name,
        checkIn: resCheckIn,
        checkOut: resCheckOut,
        guests: resGuests,
        notes: resNotes,
      }),
    });
    setResSubmitting(false);
    setResSuccess(true);
  };

  const room = selectedRoom !== null ? rooms[selectedRoom] : null;

  if (rooms.length === 0) return null;

  return (
    <div id="rooms" className="rooms-section">
      <div className="container">
        {!hideTitle && (
          <div className="wow fadeIn" data-wow-duration="1s" data-wow-delay="0.1s" suppressHydrationWarning>
            <h2 className="block-title text-center">Nos Chambres</h2>
            <p className="rooms-subtitle text-center">
              Prolongez votre expérience et séjournez dans nos chambres confortables.
            </p>
          </div>
        )}

        <div className={grid ? "rooms-grid-wrapper" : "rooms-scroll-wrapper"}>
          <div className={grid ? "rooms-grid" : "rooms-scroll"}>
            {rooms.map((r, i) => (
              <div key={r.id} className="room-card" onClick={() => openModal(i)} style={{ cursor: "pointer" }}>
                <div className="room-card-img">
                  <img src={r.thumb} alt={r.name} />
                  <div className="room-card-price">{r.price}</div>
                </div>
                <div className="room-card-body">
                  <h3 className="room-card-title">{r.name}</h3>
                  <p className="room-card-capacity">
                    <i className="fa fa-users" aria-hidden="true"></i> {r.capacity}
                  </p>
                  <p className="room-card-desc">{r.shortDesc}</p>
                  <button className="room-card-btn" onClick={() => openModal(i)}>
                    Voir détails
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {room && (
        <div className="room-modal-overlay" onClick={closeModal}>
          <div className="room-modal" onClick={(e) => e.stopPropagation()}>
            <button className="room-modal-close" onClick={closeModal}>
              &times;
            </button>

            {/* Gallery */}
            <div className="room-modal-gallery">
              <img src={room.gallery[modalPhoto]} alt={room.name} />
              {room.gallery.length > 1 && (
                <>
                  <button
                    className="room-modal-prev"
                    onClick={() =>
                      setModalPhoto(modalPhoto === 0 ? room.gallery.length - 1 : modalPhoto - 1)
                    }
                  >
                    &#8249;
                  </button>
                  <button
                    className="room-modal-next"
                    onClick={() =>
                      setModalPhoto(modalPhoto === room.gallery.length - 1 ? 0 : modalPhoto + 1)
                    }
                  >
                    &#8250;
                  </button>
                </>
              )}
              <div className="room-modal-dots">
                {room.gallery.map((_, i) => (
                  <span
                    key={i}
                    className={`room-dot ${i === modalPhoto ? "active" : ""}`}
                    onClick={() => setModalPhoto(i)}
                  />
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="room-modal-details">
              <h2 className="room-modal-title">{room.name}</h2>
              <p className="room-modal-price-tag">{room.price}</p>
              <p className="room-modal-capacity">
                <i className="fa fa-users" aria-hidden="true"></i> {room.capacity}
              </p>
              <p className="room-modal-desc">{room.description}</p>

              <div className="room-modal-features">
                <h4>Équipements</h4>
                <ul>
                  {room.features.map((f, i) => (
                    <li key={i}>
                      <i className="fa fa-check" aria-hidden="true"></i> {f}
                    </li>
                  ))}
                </ul>
              </div>

              {resSuccess ? (
                <div className="reserve-inline-success">
                  <i className="fa fa-check-circle"></i>
                  <p>Votre demande de réservation a été envoyée !</p>
                  <span>{resEmail ? "Un email de confirmation vous a été envoyé." : "Nous vous contacterons pour confirmer."}</span>
                  {whatsapp && (
                    <a
                      href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                        `Bonjour, je viens de réserver la chambre "${room.name}" du ${resCheckIn} au ${resCheckOut}. Merci de confirmer ma réservation.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="reserve-whatsapp-btn"
                    >
                      <i className="fa fa-whatsapp"></i> Confirmer par WhatsApp
                    </a>
                  )}
                </div>
              ) : !showReserveForm ? (
                <button
                  className="room-modal-reserve-btn active-btn"
                  onClick={() => setShowReserveForm(true)}
                >
                  Réserver cette chambre
                </button>
              ) : (
                <div className="reserve-inline-form">
                  <h4>Réserver cette chambre</h4>
                  <div className="reserve-inline-row">
                    <input type="text" placeholder="Votre nom *" value={resName} onChange={(e) => setResName(e.target.value)} />
                    <input type="tel" placeholder="Téléphone *" value={resPhone} onChange={(e) => setResPhone(e.target.value)} />
                  </div>
                  <input type="email" placeholder="Email (pour recevoir la confirmation)" value={resEmail} onChange={(e) => setResEmail(e.target.value)} style={{ width: "100%" }} />
                  <div className="reserve-inline-row">
                    <div className="reserve-inline-field">
                      <label>Arrivée *</label>
                      <input type="date" value={resCheckIn} onChange={(e) => setResCheckIn(e.target.value)} />
                    </div>
                    <div className="reserve-inline-field">
                      <label>Départ *</label>
                      <input type="date" value={resCheckOut} onChange={(e) => setResCheckOut(e.target.value)} />
                    </div>
                  </div>
                  <select value={resGuests} onChange={(e) => setResGuests(e.target.value)}>
                    <option value="">Nombre de personnes</option>
                    <option>1 personne</option>
                    <option>2 personnes</option>
                    <option>3 personnes</option>
                    <option>4 personnes</option>
                    <option>5+ personnes</option>
                  </select>
                  <textarea placeholder="Notes ou demandes spéciales..." value={resNotes} onChange={(e) => setResNotes(e.target.value)} rows={2} />
                  <div className="reserve-inline-actions">
                    <button className="reserve-inline-submit" disabled={!resName || !resPhone || !resCheckIn || !resCheckOut || resSubmitting} onClick={() => handleReserveSubmit(room)}>
                      {resSubmitting ? "Envoi..." : "Envoyer la demande"}
                    </button>
                    <button className="reserve-inline-cancel" onClick={() => setShowReserveForm(false)}>Annuler</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
