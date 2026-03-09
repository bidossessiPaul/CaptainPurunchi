import type { Metadata } from "next";
import { readContactInfo } from "@/lib/contact-store";
import ContactForm from "../ContactForm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Contact — Téléphone, WhatsApp & Adresse Captain Purunchi Cotonou",
  description:
    "Contactez le Captain Purunchi à Cotonou : téléphone, email, WhatsApp, adresse et horaires d'ouverture. Restaurant fruits de mer, rooftop, hébergement — notre équipe est à votre écoute.",
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
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Contact Captain Purunchi" }],
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
            Une question, une r&eacute;servation ou une demande sp&eacute;ciale&nbsp;?
            Notre &eacute;quipe est &agrave; votre &eacute;coute.
          </p>
        </div>
      </div>

      <section className="contact-info-section">
        <div className="container">
          <div className="contact-cards">
            {contact.phone && (
              <div className="contact-card">
                <div className="contact-card-icon"><i className="fa fa-phone" aria-hidden="true"></i></div>
                <h3>T&eacute;l&eacute;phone</h3>
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
            Remplissez le formulaire ci-dessous et nous vous r&eacute;pondrons dans les plus brefs d&eacute;lais.
          </p>
          <ContactForm whatsapp={contact.whatsapp} />
        </div>
      </section>

      <section className="contact-details-section">
        <div className="container">
          <div className="contact-details-grid">
            <div className="contact-details-block">
              <h2>Horaires d&rsquo;ouverture</h2>
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
              <p className="contact-social-text">Restez connect&eacute;s et suivez nos actualit&eacute;s sur les r&eacute;seaux sociaux.</p>
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

      <section className="chambres-seo-section chambres-seo-why">
        <div className="container">
          <h2>Pourquoi nous contacter&nbsp;?</h2>
          <p className="chambres-seo-intro">
            Que ce soit pour une r&eacute;servation, un &eacute;v&eacute;nement priv&eacute; ou une simple question,
            notre &eacute;quipe est disponible pour vous accompagner.
          </p>
          <div className="chambres-seo-grid">
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-calendar" aria-hidden="true"></i></div>
              <h3>R&eacute;servations</h3>
              <p>R&eacute;servez une table, une chambre ou un espace pour votre &eacute;v&eacute;nement.</p>
            </div>
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-star" aria-hidden="true"></i></div>
              <h3>&Eacute;v&eacute;nements sur mesure</h3>
              <p>Organisez vos anniversaires, s&eacute;minaires ou soir&eacute;es priv&eacute;es dans un cadre exceptionnel.</p>
            </div>
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-comments" aria-hidden="true"></i></div>
              <h3>Service client</h3>
              <p>Notre &eacute;quipe r&eacute;pond &agrave; toutes vos questions et demandes sp&eacute;ciales avec plaisir.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer contact={contact} />
      <WhatsAppFloat whatsapp={contact.whatsapp} />
    </div>
  );
}
