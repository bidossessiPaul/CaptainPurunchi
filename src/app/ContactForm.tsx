"use client";

import { useState } from "react";

export default function ContactForm({ whatsapp }: { whatsapp?: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });

      if (res.ok) {
        setSuccess(true);
        setName("");
        setEmail("");
        setPhone("");
        setSubject("");
        setMessage("");
      } else {
        setError("Une erreur est survenue. Veuillez r\u00e9essayer.");
      }
    } catch {
      setError("Une erreur est survenue. Veuillez r\u00e9essayer.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="contact-form-success">
        <i className="fa fa-check-circle"></i>
        <h3>Message envoy&eacute; !</h3>
        <p>Merci de nous avoir contact&eacute;s. Nous vous r&eacute;pondrons dans les plus brefs d&eacute;lais.</p>
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="reserve-whatsapp-btn-light"
          >
            <i className="fa fa-whatsapp"></i> Ou contactez-nous sur WhatsApp
          </a>
        )}
        <button onClick={() => setSuccess(false)} className="contact-form-new-btn">
          ENVOYER UN AUTRE MESSAGE
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      {error && <div className="contact-form-error">{error}</div>}
      <div className="contact-form-row">
        <input
          type="text"
          placeholder="Votre nom *"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="tel"
          placeholder="T&eacute;l&eacute;phone *"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <div className="contact-form-row">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Sujet"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>
      <textarea
        placeholder="Votre message *"
        required
        rows={5}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      ></textarea>
      <button type="submit" disabled={submitting} className="contact-form-submit">
        {submitting ? "ENVOI EN COURS..." : "ENVOYER LE MESSAGE"}
      </button>
    </form>
  );
}
