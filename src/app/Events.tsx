"use client";

import { useState } from "react";
import type { Event } from "@/app/types/event";

export default function Events({ events, whatsapp, hideTitle }: { events: Event[]; whatsapp?: string; hideTitle?: boolean }) {
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [modalPhoto, setModalPhoto] = useState(0);
  const [showReserveForm, setShowReserveForm] = useState(false);
  const [resName, setResName] = useState("");
  const [resPhone, setResPhone] = useState("");
  const [resAttendees, setResAttendees] = useState("");
  const [resEmail, setResEmail] = useState("");
  const [resNotes, setResNotes] = useState("");
  const [resSubmitting, setResSubmitting] = useState(false);
  const [resSuccess, setResSuccess] = useState(false);

  const openModal = (index: number) => {
    setSelectedEvent(index);
    setModalPhoto(0);
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setModalPhoto(0);
    setShowReserveForm(false);
    setResName("");
    setResPhone("");
    setResEmail("");
    setResAttendees("");
    setResNotes("");
    setResSubmitting(false);
    setResSuccess(false);
  };

  const handleReserveSubmit = async (ev: Event) => {
    if (!resName || !resPhone) return;
    setResSubmitting(true);
    await fetch("/api/event-reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: resName,
        customerPhone: resPhone,
        customerEmail: resEmail,
        eventId: ev.id,
        eventTitle: ev.title,
        attendees: resAttendees,
        notes: resNotes,
      }),
    });
    setResSubmitting(false);
    setResSuccess(true);
  };

  if (events.length === 0) return null;

  const ev = selectedEvent !== null ? events[selectedEvent] : null;

  return (
    <div id="events" className="events-section">
      <div className="container">
        {!hideTitle && (
          <div className="wow fadeIn" data-wow-duration="1s" data-wow-delay="0.1s">
            <h2 className="block-title color-white text-center">
              &Eacute;v&eacute;nements &amp; Actualit&eacute;s
            </h2>
            <p className="events-subtitle text-center">
              Restez inform&eacute;s de nos soir&eacute;es, &eacute;v&eacute;nements et derni&egrave;res nouvelles.
            </p>
          </div>
        )}

        {/* Layout : vedette col-8 + autres col-4 */}
        {(() => {
          const featured = events.filter((e) => e.featured);
          const others = events.filter((e) => !e.featured);
          const feat = featured[0];
          const featIdx = feat ? events.indexOf(feat) : -1;

          if (!feat) {
            // Pas d'événement en vedette, grille classique
            return (
              <div className="events-grid">
                {events.map((e) => {
                  const i = events.indexOf(e);
                  return (
                    <div
                      key={e.id}
                      className="event-card event-grid-card"
                      onClick={() => openModal(i)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="event-card-img">
                        <img src={e.thumb} alt={e.title} />
                        <div className="event-card-date-badge">
                          <span className="event-day">{e.day}</span>
                          <span className="event-month">{e.month}</span>
                        </div>
                      </div>
                      <div className="event-card-body">
                        <div className="event-card-top-row">
                          <span className="event-tag">{e.tag}</span>
                          {e.price && <span className="event-card-price">{e.price}</span>}
                        </div>
                        <h3 className="event-card-title">{e.title}</h3>
                        <p className="event-card-desc">{e.shortDesc}</p>
                        <div className="event-card-meta">
                          <span><i className="fa fa-clock-o" aria-hidden="true"></i> {e.time}</span>
                          <span><i className="fa fa-map-marker" aria-hidden="true"></i> {e.location}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          }

          const sideFirst = others[0];
          const sideFirstIdx = sideFirst ? events.indexOf(sideFirst) : -1;
          const rest = others.slice(1);

          return (
            <>
              {/* Ligne 1 : vedette col-8 + 1 événement col-4 */}
              <div className="events-row-top">
                <div
                  className="events-col-main"
                  onClick={() => openModal(featIdx)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="event-featured">
                    <div className="event-featured-img">
                      <img src={feat.thumb} alt={feat.title} />
                      <div className="event-featured-overlay" />
                      <div className="event-featured-badge">
                        <i className="fa fa-star" aria-hidden="true"></i> &Agrave; la une
                      </div>
                      <div className="event-card-date-badge">
                        <span className="event-day">{feat.day}</span>
                        <span className="event-month">{feat.month}</span>
                      </div>
                    </div>
                    <div className="event-featured-body">
                      <span className="event-tag">{feat.tag}</span>
                      <h3 className="event-featured-title">{feat.title}</h3>
                      <p className="event-featured-desc">{feat.shortDesc}</p>
                      <div className="event-card-meta">
                        <span><i className="fa fa-clock-o" aria-hidden="true"></i> {feat.time}</span>
                        <span><i className="fa fa-map-marker" aria-hidden="true"></i> {feat.location}</span>
                      </div>
                      {feat.price && (
                        <span className="event-featured-price">{feat.price}</span>
                      )}
                    </div>
                  </div>
                </div>

                {sideFirst && (
                  <div
                    className="events-col-side"
                    onClick={() => openModal(sideFirstIdx)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="event-card event-grid-card">
                      <div className="event-card-img">
                        <img src={sideFirst.thumb} alt={sideFirst.title} />
                        <div className="event-card-date-badge">
                          <span className="event-day">{sideFirst.day}</span>
                          <span className="event-month">{sideFirst.month}</span>
                        </div>
                      </div>
                      <div className="event-card-body">
                        <div className="event-card-top-row">
                          <span className="event-tag">{sideFirst.tag}</span>
                          {sideFirst.price && <span className="event-card-price">{sideFirst.price}</span>}
                        </div>
                        <h3 className="event-card-title">{sideFirst.title}</h3>
                        <p className="event-card-desc">{sideFirst.shortDesc}</p>
                        <div className="event-card-meta">
                          <span><i className="fa fa-clock-o" aria-hidden="true"></i> {sideFirst.time}</span>
                          <span><i className="fa fa-map-marker" aria-hidden="true"></i> {sideFirst.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Ligne 2 : reste des événements en grille col-4 */}
              {rest.length > 0 && (
                <div className="events-grid">
                  {rest.map((e) => {
                    const i = events.indexOf(e);
                    return (
                      <div
                        key={e.id}
                        className="event-card event-grid-card"
                        onClick={() => openModal(i)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="event-card-img">
                          <img src={e.thumb} alt={e.title} />
                          <div className="event-card-date-badge">
                            <span className="event-day">{e.day}</span>
                            <span className="event-month">{e.month}</span>
                          </div>
                        </div>
                        <div className="event-card-body">
                          <div className="event-card-top-row">
                            <span className="event-tag">{e.tag}</span>
                            {e.price && <span className="event-card-price">{e.price}</span>}
                          </div>
                          <h3 className="event-card-title">{e.title}</h3>
                          <p className="event-card-desc">{e.shortDesc}</p>
                          <div className="event-card-meta">
                            <span><i className="fa fa-clock-o" aria-hidden="true"></i> {e.time}</span>
                            <span><i className="fa fa-map-marker" aria-hidden="true"></i> {e.location}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          );
        })()}
      </div>

      {/* Modal */}
      {ev && (
        <div className="event-modal-overlay" onClick={closeModal}>
          <div className="event-modal" onClick={(e) => e.stopPropagation()}>
            <button className="event-modal-close" onClick={closeModal}>
              &times;
            </button>

            {/* Gallery */}
            <div className="event-modal-gallery">
              <img src={ev.gallery[modalPhoto]} alt={ev.title} />
              {ev.gallery.length > 1 && (
                <>
                  <button
                    className="event-modal-prev"
                    onClick={() =>
                      setModalPhoto(modalPhoto === 0 ? ev.gallery.length - 1 : modalPhoto - 1)
                    }
                  >
                    &#8249;
                  </button>
                  <button
                    className="event-modal-next"
                    onClick={() =>
                      setModalPhoto(modalPhoto === ev.gallery.length - 1 ? 0 : modalPhoto + 1)
                    }
                  >
                    &#8250;
                  </button>
                </>
              )}
              <div className="event-modal-dots">
                {ev.gallery.map((_, i) => (
                  <span
                    key={i}
                    className={`event-dot ${i === modalPhoto ? "active" : ""}`}
                    onClick={() => setModalPhoto(i)}
                  />
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="event-modal-details">
              <div className="event-modal-top">
                <span className="event-tag">{ev.tag}</span>
                <span className="event-modal-date">
                  <i className="fa fa-calendar" aria-hidden="true"></i> {ev.day} {ev.month}
                </span>
              </div>
              <h2 className="event-modal-title">{ev.title}</h2>
              <p className="event-modal-price-tag">{ev.price}</p>

              <div className="event-modal-info-row">
                <span><i className="fa fa-clock-o" aria-hidden="true"></i> {ev.time}</span>
                <span><i className="fa fa-map-marker" aria-hidden="true"></i> {ev.location}</span>
              </div>

              <p className="event-modal-desc">{ev.description}</p>

              {ev.includes.length > 0 && (
                <div className="event-modal-includes">
                  <h4>Inclus</h4>
                  <ul>
                    {ev.includes.map((item, i) => (
                      <li key={i}>
                        <i className="fa fa-check" aria-hidden="true"></i> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {resSuccess ? (
                <div className="reserve-inline-success">
                  <i className="fa fa-check-circle"></i>
                  <p>Votre r&eacute;servation a &eacute;t&eacute; envoy&eacute;e !</p>
                  <span>{resEmail ? "Un email de confirmation vous a été envoyé." : "Nous vous contacterons pour confirmer."}</span>
                  {whatsapp && (
                    <a
                      href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                        `Bonjour, je viens de réserver pour l'événement "${ev.title}" (${ev.day} ${ev.month}). Merci de confirmer ma réservation.`
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
                  className="event-modal-reserve-btn active-btn"
                  onClick={() => setShowReserveForm(true)}
                >
                  R&eacute;server ma place
                </button>
              ) : (
                <div className="reserve-inline-form">
                  <h4>R&eacute;server ma place</h4>
                  <div className="reserve-inline-row">
                    <input type="text" placeholder="Votre nom *" value={resName} onChange={(e) => setResName(e.target.value)} />
                    <input type="tel" placeholder="T&eacute;l&eacute;phone *" value={resPhone} onChange={(e) => setResPhone(e.target.value)} />
                  </div>
                  <input type="email" placeholder="Email (pour recevoir la confirmation)" value={resEmail} onChange={(e) => setResEmail(e.target.value)} style={{ width: "100%" }} />
                  <select value={resAttendees} onChange={(e) => setResAttendees(e.target.value)}>
                    <option value="">Nombre de participants</option>
                    <option>1 personne</option>
                    <option>2 personnes</option>
                    <option>3 personnes</option>
                    <option>4 personnes</option>
                    <option>5 personnes</option>
                    <option>6+ personnes</option>
                  </select>
                  <textarea placeholder="Notes ou demandes sp&eacute;ciales..." value={resNotes} onChange={(e) => setResNotes(e.target.value)} rows={2} />
                  <div className="reserve-inline-actions">
                    <button className="reserve-inline-submit" disabled={!resName || !resPhone || resSubmitting} onClick={() => handleReserveSubmit(ev)}>
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
