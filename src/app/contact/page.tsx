import type { Metadata } from "next";
import { readContactInfo } from "@/lib/contact-store";
import ContactForm from "../ContactForm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Contact — Captain Purunchi Cotonou",
  description:
    "Contactez Captain Purunchi à Cotonou : téléphone, email, WhatsApp, adresse et horaires. Restaurant fruits de mer, rooftop et hébergement.",
  keywords: [
    "contact Captain Purunchi", "Captain Purunchi téléphone",
    "Captain Purunchi WhatsApp", "adresse Captain Purunchi Cotonou",
    "horaires restaurant Captain Purunchi", "contact restaurant Cotonou",
    "numéro restaurant Cotonou", "email Captain Purunchi",
    "contact seafood restaurant Cotonou", "Captain Purunchi phone number",
    "how to reach Captain Purunchi Benin",
  ],
  openGraph: {
    title: "Contactez Captain Purunchi — Restaurant & Hébergement Cotonou",
    description: "Téléphone, WhatsApp, email et adresse du Captain Purunchi à Cotonou. Réservations, questions, événements — contactez-nous.",
    url: "/contact",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Contact Captain Purunchi" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact \u2014 Captain Purunchi Cotonou",
    description: "T\u00e9l\u00e9phone, WhatsApp, email et adresse du Captain Purunchi \u00e0 Cotonou.",
  },
  alternates: { canonical: "/contact" },
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const contact = await readContactInfo();

  return (
    <div className="contact-page">
      <Breadcrumbs items={[{ name: "Contact", href: "/contact" }]} />
      <Navbar activePage="contact" />

      <div className="contact-page-header">
        <div className="container">
          <h1>Contactez-nous</h1>
          <p>
            Une question, une réservation ou une demande spéciale ?
            Notre équipe est à votre écoute.
          </p>
        </div>
      </div>

      <section className="contact-info-section">
        <div className="container">
          <div className="contact-cards">
            {contact.phone && (
              <div className="contact-card">
                <div className="contact-card-icon"><i className="fa fa-phone" aria-hidden="true"></i></div>
                <h3>Téléphone</h3>
                <p><a href={`tel:${contact.phone}`}>{contact.phone}</a></p>
              </div>
            )}
            {contact.email && (
              <div className="contact-card">
                <div className="contact-card-icon"><i className="fa fa-envelope" aria-hidden="true"></i></div>
                <h3>Email</h3>
                <p><a href={`mailto:${contact.email}`}>{contact.email}</a></p>
              </div>
            )}
            {contact.address && (
              <div className="contact-card">
                <div className="contact-card-icon"><i className="fa fa-map-marker" aria-hidden="true"></i></div>
                <h3>Adresse</h3>
                <p>{contact.address}</p>
              </div>
            )}
            {contact.whatsapp && (
              <div className="contact-card">
                <div className="contact-card-icon"><i className="fa fa-whatsapp" aria-hidden="true"></i></div>
                <h3>WhatsApp</h3>
                <p><a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer">Envoyez-nous un message</a></p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="contact-form-section">
        <div className="container">
          <h2>Envoyez-nous un message</h2>
          <p className="chambres-seo-intro">
            Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
          </p>
          <ContactForm whatsapp={contact.whatsapp} />
        </div>
      </section>

      <section className="contact-details-section">
        <div className="container">
          <div className="contact-details-grid">
            <div className="contact-details-block">
              <h2>Horaires d{"'"}ouverture</h2>
              <ul className="contact-hours-list">
                {contact.hours1Label && contact.hours1Value && (
                  <li>
                    <span className="contact-hours-label">{contact.hours1Label}</span>
                    <span className="contact-hours-value">{contact.hours1Value}</span>
                  </li>
                )}
                {contact.hours2Label && contact.hours2Value && (
                  <li>
                    <span className="contact-hours-label">{contact.hours2Label}</span>
                    <span className="contact-hours-value">{contact.hours2Value}</span>
                  </li>
                )}
                {contact.hours3Label && contact.hours3Value && (
                  <li>
                    <span className="contact-hours-label">{contact.hours3Label}</span>
                    <span className="contact-hours-value">{contact.hours3Value}</span>
                  </li>
                )}
              </ul>
            </div>

            <div className="contact-details-block">
              <h2>Suivez-nous</h2>
              <p className="contact-social-text">Restez connectés et suivez nos actualités sur les réseaux sociaux.</p>
              <div className="contact-social-links">
                {contact.facebook && (
                  <a href={contact.facebook} target="_blank" rel="noopener noreferrer" className="contact-social-btn">
                    <i className="fa fa-facebook" aria-hidden="true"></i> Facebook
                  </a>
                )}
                {contact.instagram && (
                  <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="contact-social-btn">
                    <i className="fa fa-instagram" aria-hidden="true"></i> Instagram
                  </a>
                )}
                {contact.whatsapp && (
                  <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="contact-social-btn">
                    <i className="fa fa-whatsapp" aria-hidden="true"></i> WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google Maps */}
      <section className="contact-map-section">
        <div className="container">
          <h2>Nous trouver</h2>
          <p className="chambres-seo-intro">
            Captain Purunchi, O6bp 2556 PK3, Fidjrossè, Cotonou, Bénin
          </p>
          <div className="contact-map-wrapper">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.5!2d2.3924!3d6.3654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMjEnNTUuNCJOIDLCsDIzJzMyLjYiRQ!5e0!3m2!1sfr!2sbj!4v1"
              width="100%"
              height="400"
              style={{ border: 0, borderRadius: "12px" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Captain Purunchi - Carte"
            />
          </div>
          <div className="contact-map-actions">
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=6.3654,2.3924"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-social-btn"
            >
              <i className="fa fa-map-marker" aria-hidden="true"></i> Itinéraire Google Maps
            </a>
          </div>
        </div>
      </section>

      {/* Avis */}
      <section className="contact-reviews-section">
        <div className="container">
          <h2>Votre avis compte</h2>
          <p className="chambres-seo-intro">
            Vous avez aimé votre expérience chez Captain Purunchi ?
            Laissez-nous un avis pour nous aider à nous améliorer et guider d{"'"}autres gourmands.
          </p>
          <div className="contact-reviews-grid">
            <a
              href="https://g.page/r/captainpurunchi/review"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-review-card"
            >
              <div className="contact-review-icon" style={{ color: "#4285F4" }}>
                <i className="fa fa-google" aria-hidden="true"></i>
              </div>
              <h3>Google</h3>
              <p>Laissez un avis sur Google pour aider les visiteurs à nous trouver.</p>
              <span className="contact-review-cta">Laisser un avis →</span>
            </a>
            <a
              href="https://www.tripadvisor.com/UserReview"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-review-card"
            >
              <div className="contact-review-icon" style={{ color: "#00AF87" }}>
                <i className="fa fa-tripadvisor" aria-hidden="true"></i>
              </div>
              <h3>TripAdvisor</h3>
              <p>Partagez votre expérience avec la communauté de voyageurs.</p>
              <span className="contact-review-cta">Laisser un avis →</span>
            </a>
            <a
              href={contact.facebook ? `${contact.facebook}/reviews` : "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-review-card"
            >
              <div className="contact-review-icon" style={{ color: "#1877F2" }}>
                <i className="fa fa-facebook" aria-hidden="true"></i>
              </div>
              <h3>Facebook</h3>
              <p>Recommandez-nous à vos amis sur Facebook.</p>
              <span className="contact-review-cta">Recommander →</span>
            </a>
          </div>
        </div>
      </section>

      <section className="chambres-seo-section chambres-seo-why">
        <div className="container">
          <h2>Pourquoi nous contacter ?</h2>
          <p className="chambres-seo-intro">
            Que ce soit pour une réservation, un événement privé ou une simple question,
            notre équipe est disponible pour vous accompagner.
          </p>
          <div className="chambres-seo-grid">
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-calendar" aria-hidden="true"></i></div>
              <h3>Réservations</h3>
              <p>Réservez une table, une chambre ou un espace pour votre événement.</p>
            </div>
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-star" aria-hidden="true"></i></div>
              <h3>Événements sur mesure</h3>
              <p>Organisez vos anniversaires, séminaires ou soirées privées dans un cadre exceptionnel.</p>
            </div>
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-comments" aria-hidden="true"></i></div>
              <h3>Service client</h3>
              <p>Notre équipe répond à toutes vos questions et demandes spéciales avec plaisir.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer contact={contact} />
      <WhatsAppFloat whatsapp={contact.whatsapp} />
    </div>
  );
}
