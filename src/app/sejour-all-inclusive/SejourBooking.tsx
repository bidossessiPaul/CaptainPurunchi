"use client";

import { useState } from "react";
import RoomIllustration from "./RoomIllustration";
import { ROOM_TIERS, eur, cfa, type Duration, type Travelers } from "./data";

export default function SejourBooking({ whatsapp }: { whatsapp: string }) {
  const [duration, setDuration] = useState<Duration>(7);
  const [travelers, setTravelers] = useState<Travelers>("solo");
  const [tierKey, setTierKey] = useState(ROOM_TIERS[0].key);
  const [form, setForm] = useState({ name: "", phone: "", email: "", date: "", note: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const tier = ROOM_TIERS.find((t) => t.key === tierKey) ?? ROOM_TIERS[0];
  const price = tier.prices[travelers][duration];
  const nights = duration - 1;
  const label = `${duration} jours / ${nights} nuits · ${travelers === "solo" ? "1 personne" : "couple (2 personnes)"} · ${tier.name} · ${eur(price)}`;

  const waText = encodeURIComponent(
    `Bonjour, je souhaite réserver le Séjour All Inclusive : ${label}.${form.date ? ` Dates souhaitées : ${form.date}.` : ""}`
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          subject: "Séjour All Inclusive",
          message: `${label}\nDates souhaitées : ${form.date || "à définir"}\n${form.note}`.trim(),
        }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <div className="sj-controls">
        <div className="sj-toggle" role="group" aria-label="Durée du séjour">
          {([7, 10] as Duration[]).map((d) => (
            <button key={d} type="button" className={duration === d ? "on" : ""} onClick={() => setDuration(d)}>
              {d} jours <small>{d - 1} nuits</small>
            </button>
          ))}
        </div>
        <div className="sj-toggle" role="group" aria-label="Voyageurs">
          <button type="button" className={travelers === "solo" ? "on" : ""} onClick={() => setTravelers("solo")}>
            <i className="fa fa-user" /> 1 personne
          </button>
          <button type="button" className={travelers === "couple" ? "on" : ""} onClick={() => setTravelers("couple")}>
            <i className="fa fa-users" /> En couple
          </button>
        </div>
      </div>

      <div className="sj-tiers">
        {ROOM_TIERS.map((t) => {
          const p = t.prices[travelers][duration];
          return (
            <button
              key={t.key}
              type="button"
              className={`sj-tier ${tierKey === t.key ? "selected" : ""}`}
              onClick={() => {
                setTierKey(t.key);
                document.getElementById("reserver")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {t.badge && <span className="sj-badge">{t.badge}</span>}
              <span className="sj-tier-img">
                <RoomIllustration variant={t.key as "standard" | "junior" | "senior"} />
              </span>
              <span className="sj-tier-body">
                <strong>{t.name}</strong>
                <em>{t.tagline}</em>
                <ul className="sj-feats">
                  {t.features.map((f) => (
                    <li key={f}><i className="fa fa-check" /> {f}</li>
                  ))}
                  <li><i className="fa fa-check" /> Tous les repas, visites &amp; transport</li>
                </ul>
                <span className="sj-priceblock">
                  <span className="sj-price">{eur(p)}</span>
                  <span className="sj-per">
                    {travelers === "solo" ? "par personne" : "pour 2 personnes"} · {duration} jours
                  </span>
                  <span className="sj-cfa">≈ {cfa(p)}</span>
                </span>
                <span className="sj-choose">
                  {tierKey === t.key ? (<><i className="fa fa-check-circle" /> Sélectionnée</>) : "Choisir cette formule"}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div id="reserver" className="sj-form-wrap">
        <div className="sj-summary">
          <h3>Votre séjour</h3>
          <ul>
            <li><i className="fa fa-calendar" /> {duration} jours / {nights} nuits</li>
            <li><i className="fa fa-user" /> {travelers === "solo" ? "1 personne" : "Couple (2 personnes)"}</li>
            <li><i className="fa fa-bed" /> {tier.name}</li>
          </ul>
          <div className="sj-total">{eur(price)}</div>
          <div className="sj-cfa">≈ {cfa(price)} · tout inclus</div>
        </div>

        {status === "done" ? (
          <div className="sj-done">
            <i className="fa fa-check-circle" />
            <h3>Demande envoyée !</h3>
            <p>Notre équipe vous répond très vite pour confirmer vos dates.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="sj-form">
            <input required placeholder="Nom complet *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input required placeholder="Téléphone / WhatsApp *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input type="email" placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input placeholder="Dates souhaitées (ex. 12 au 19 décembre)" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <textarea rows={3} placeholder="Une précision ? (enfants, régime alimentaire…)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            <button type="submit" className="sj-btn sj-btn-gold" disabled={status === "sending"}>
              {status === "sending" ? "Envoi…" : "Envoyer ma demande"}
            </button>
            <a className="sj-btn sj-btn-wa" href={`https://wa.me/${whatsapp}?text=${waText}`} target="_blank" rel="noopener noreferrer">
              <i className="fa fa-whatsapp" /> Réserver par WhatsApp
            </a>
            {status === "error" && <p className="sj-error">Envoi impossible. Merci de nous écrire sur WhatsApp.</p>}
          </form>
        )}
      </div>
    </>
  );
}
