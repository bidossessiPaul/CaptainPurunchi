import type { Metadata } from "next";
import { readContactInfo } from "@/lib/contact-store";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Breadcrumbs from "@/components/Breadcrumbs";
import SejourBooking from "./SejourBooking";
import { INCLUDED, STOPS, AUDIENCES, FALLBACK_WHATSAPP, FALLBACK_PHONE } from "./data";
import "./sejour.css";

export const metadata: Metadata = {
  title: "Séjour All Inclusive au Bénin — Captain Purunchi",
  description:
    "Séjour tout inclus de 7 ou 10 jours au Bénin : hébergement climatisé, 3 repas gastronomie marine, visites guidées (Ouidah, Ganvié, Abomey…) et transport. Dès 700 €.",
  openGraph: {
    title: "Séjour All Inclusive au Bénin | Captain Purunchi",
    description: "Détente, culture et aventure : 7 ou 10 jours tout compris depuis Cotonou. Dès 700 €.",
    url: "/sejour-all-inclusive",
    images: [{ url: "/images/hero/seafood-beach-feast.webp", width: 1200, height: 630, alt: "Séjour All Inclusive Captain Purunchi" }],
  },
  alternates: { canonical: "/sejour-all-inclusive" },
};

export const dynamic = "force-dynamic";

export default async function SejourPage() {
  const contact = await readContactInfo();
  const whatsapp = contact.whatsapp || FALLBACK_WHATSAPP;
  const phone = contact.phone || FALLBACK_PHONE;

  return (
    <div className="sj">
      <Breadcrumbs items={[{ name: "Séjour All Inclusive", href: "/sejour-all-inclusive" }]} />
      <Navbar activePage="sejour" />

      <section className="sj-hero">
        <div className="sj-hero-overlay" />
        <div className="container sj-hero-inner">
          <span className="sj-kicker">Séjour All Inclusive · Bénin</span>
          <h1>Détente, culture<br />et aventure au Bénin</h1>
          <p>
            7 ou 10 jours tout compris depuis Cotonou : hébergement, gastronomie marine,
            visites guidées et transport. Vous n&apos;avez plus qu&apos;à profiter.
          </p>
          <div className="sj-hero-cta">
            <a href="#tarifs" className="sj-btn sj-btn-gold">Voir les tarifs</a>
            <a href="#circuit" className="sj-btn sj-btn-ghost">Découvrir le circuit</a>
          </div>
          <ul className="sj-hero-facts">
            <li><strong>7 &amp; 10</strong> jours</li>
            <li><strong>Dès 700 €</strong> / pers.</li>
            <li><strong>3 repas</strong> par jour</li>
          </ul>
        </div>
      </section>

      <section className="sj-section" id="inclus">
        <div className="container">
          <header className="sj-head">
            <span className="sj-kicker dark">Tout est compris</span>
            <h2>Ce que comprend votre séjour</h2>
          </header>
          <div className="sj-included">
            {INCLUDED.map((i) => (
              <div key={i.title} className="sj-inc">
                <i className={`fa ${i.icon}`} />
                <h3>{i.title}</h3>
                <p>{i.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sj-section sj-alt" id="circuit">
        <div className="container">
          <header className="sj-head">
            <span className="sj-kicker dark">Le circuit découverte</span>
            <h2>8 étapes, un Bénin authentique</h2>
            <p>De Cotonou à Eldorado, un parcours entre histoire, nature et bien-être.</p>
          </header>
          <div className="sj-stops">
            {STOPS.map((s) => (
              <article key={s.n} className="sj-stop">
                <div className="sj-stop-img" style={s.image ? { backgroundImage: `url(${s.image})` } : undefined}>
                  <span className="sj-stop-n">{s.n}</span>
                </div>
                <div className="sj-stop-body">
                  <small>{s.tag}</small>
                  <h3>{s.name}</h3>
                  <p>{s.text}</p>
                </div>
              </article>
            ))}
          </div>
          <p className="sj-note">
            Le séjour de 7 jours reprend les 6 premières étapes ; celui de 10 jours ajoute Adjarra, Abomey
            et une journée découverte supplémentaire. Le programme jour par jour vous est remis à la réservation.
          </p>
        </div>
      </section>

      <section className="sj-section" id="tarifs">
        <div className="container">
          <header className="sj-head">
            <span className="sj-kicker dark">Tarifs</span>
            <h2>Choisissez votre formule</h2>
            <p>Tarifs en euros, tout compris. Sélectionnez la durée, les voyageurs et votre hébergement.</p>
          </header>
          <SejourBooking whatsapp={whatsapp} />
          <p className="sj-note">
            Séjour débutant par l&apos;accueil à l&apos;aéroport et terminant par votre dépose à l&apos;aéroport.
            Vols non inclus. Montants en FCFA indicatifs (1 € = 655,957 FCFA).
          </p>
        </div>
      </section>

      <section className="sj-section sj-alt">
        <div className="container">
          <header className="sj-head">
            <span className="sj-kicker dark">Pour tous</span>
            <h2>Adapté à tous les publics</h2>
          </header>
          <div className="sj-aud">
            {AUDIENCES.map((a) => (
              <div key={a.title} className="sj-aud-card">
                <i className={`fa ${a.icon}`} />
                <h3>{a.title}</h3>
                <ul>{a.items.map((it) => <li key={it}>{it}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sj-final">
        <div className="container">
          <h2>Réservez dès maintenant</h2>
          <p>Les dates sont flexibles : choisissez celles qui vous conviennent.</p>
          <div className="sj-hero-cta">
            <a className="sj-btn sj-btn-gold" href={`tel:${phone.replace(/\s/g, "")}`}>
              <i className="fa fa-phone" /> {phone}
            </a>
            <a className="sj-btn sj-btn-wa" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">
              <i className="fa fa-whatsapp" /> WhatsApp
            </a>
          </div>
        </div>
      </section>

      <Footer contact={contact} />
      <WhatsAppFloat whatsapp={whatsapp} />
    </div>
  );
}
