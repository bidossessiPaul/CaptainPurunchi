import type { Metadata } from "next";
import { readActiveEvents } from "@/lib/event-store";
import { readContactInfo } from "@/lib/contact-store";
import Events from "../Events";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "\u00c9v\u00e9nements, Soir\u00e9es Rooftop & Privatisation \u00e0 Cotonou",
  description:
    "Soir\u00e9es rooftop, DJ set, \u00e9v\u00e9nements priv\u00e9s, anniversaires et s\u00e9minaires au Captain Purunchi \u00e0 Cotonou, B\u00e9nin. Privatisation disponible.",
  openGraph: {
    title: "\u00c9v\u00e9nements & Rooftop | Captain Purunchi Cotonou",
    description: "Soir\u00e9es rooftop, musique live, privatisation pour mariages, anniversaires et s\u00e9minaires \u00e0 Cotonou.",
    url: "/evenements",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "\u00c9v\u00e9nements Captain Purunchi" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "\u00c9v\u00e9nements & Rooftop | Captain Purunchi Cotonou",
    description: "Soir\u00e9es rooftop, DJ set et \u00e9v\u00e9nements priv\u00e9s au Captain Purunchi \u00e0 Cotonou.",
  },
  keywords: [
    "salle de r\u00e9ception Cotonou", "privatisation restaurant Cotonou",
    "\u00e9v\u00e9nement priv\u00e9 bord de mer Cotonou", "mariage restaurant vue mer B\u00e9nin",
    "anniversaire restaurant Cotonou", "s\u00e9minaire entreprise Cotonou",
    "cocktail dinatoire Cotonou", "soir\u00e9e priv\u00e9e rooftop Cotonou",
    "rooftop Cotonou", "bar rooftop vue mer Cotonou", "DJ set rooftop B\u00e9nin",
    "sortie nocturne Cotonou", "team building Cotonou bord de mer",
    "where to go out in Cotonou rooftop",
  ],
  alternates: { canonical: "/evenements" },
};

export const dynamic = "force-dynamic";

const BASE_URL = process.env.SITE_URL || "https://captainpurunchi.com";

export default async function EvenementsPage() {
  const [events, contact] = await Promise.all([
    readActiveEvents(),
    readContactInfo(),
  ]);

  const eventsJsonLd = events.length > 0 ? {
    "@context": "https://schema.org",
    "@graph": events.map((ev) => ({
      "@type": "Event",
      name: ev.title,
      description: ev.shortDesc || ev.description || "",
      ...(ev.thumb && { image: ev.thumb }),
      startDate: `2026-${ev.month?.padStart(2, "0") || "01"}-${ev.day?.padStart(2, "0") || "01"}`,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: {
        "@type": "Place",
        name: ev.location || "Captain Purunchi",
        address: {
          "@type": "PostalAddress",
          streetAddress: "O6bp 2556 pk 3, Fidjrossè",
          addressLocality: "Cotonou",
          addressCountry: "BJ",
        },
      },
      organizer: {
        "@type": "Organization",
        name: "Captain Purunchi",
        url: BASE_URL,
      },
      ...(ev.price && ev.price !== "Gratuit" && ev.price !== "0" ? {
        offers: {
          "@type": "Offer",
          price: ev.price.replace(/[^0-9]/g, "") || "0",
          priceCurrency: "XOF",
          availability: "https://schema.org/InStock",
          url: `${BASE_URL}/evenements`,
        },
      } : {
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "XOF",
          availability: "https://schema.org/InStock",
        },
      }),
    })),
  } : null;

  return (
    <div className="evenements-page">
      <Breadcrumbs items={[{ name: "Événements", href: "/evenements" }]} />
      {eventsJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventsJsonLd).replace(/<\/script>/gi, "<\\/script>") }}
        />
      )}
      <Navbar activePage="evenements" />

      <div className="evenements-page-header">
        <div className="container">
          <h1>Événements &amp; Actualités</h1>
          <p>
            Restez informés de nos soirées, événements
            et dernières nouvelles au Captain Purunchi.
          </p>
        </div>
      </div>

      <section className="services-highlight-section">
        <div className="container">
          <p className="services-highlight-intro">
            Ne manquez aucun événement. Réservez en ligne
            ou contactez-nous pour privatiser un espace.
          </p>
          <div className="services-highlight-grid">
            <div className="services-highlight-item">
              <div className="services-highlight-icon"><i className="fa fa-calendar-check-o" aria-hidden="true"></i></div>
              <span>Réservation en ligne</span>
            </div>
            <div className="services-highlight-item">
              <div className="services-highlight-icon"><i className="fa fa-users" aria-hidden="true"></i></div>
              <span>Groupes bienvenus</span>
            </div>
            <div className="services-highlight-item">
              <div className="services-highlight-icon"><i className="fa fa-glass" aria-hidden="true"></i></div>
              <span>Formules tout compris</span>
            </div>
            <div className="services-highlight-item">
              <div className="services-highlight-icon"><i className="fa fa-lock" aria-hidden="true"></i></div>
              <span>Privatisation possible</span>
            </div>
            <div className="services-highlight-item">
              <div className="services-highlight-icon"><i className="fa fa-music" aria-hidden="true"></i></div>
              <span>Animation sur demande</span>
            </div>
            <div className="services-highlight-item">
              <div className="services-highlight-icon"><i className="fa fa-camera" aria-hidden="true"></i></div>
              <span>Photographe disponible</span>
            </div>
            <div className="services-highlight-item">
              <div className="services-highlight-icon"><i className="fa fa-star" aria-hidden="true"></i></div>
              <span>Déco personnalisée</span>
            </div>
            <div className="services-highlight-item">
              <div className="services-highlight-icon"><i className="fa fa-whatsapp" aria-hidden="true"></i></div>
              <span>Contact WhatsApp</span>
            </div>
          </div>
        </div>
      </section>

      <div className="events-light">
        <Events events={events} whatsapp={contact.whatsapp} hideTitle />
      </div>

      <section className="chambres-seo-section chambres-seo-location">
        <div className="container">
          <h2>Vivez des moments uniques à Cotonou</h2>
          <p className="chambres-seo-intro">
            Captain Purunchi est bien plus qu'un restaurant. C'est un lieu de vie
            où chaque événement est une expérience à part entière,
            dans un cadre exceptionnel au cœur de Cotonou.
          </p>
          <div className="chambres-seo-grid">
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-music" aria-hidden="true"></i></div>
              <h3>Soirées à thème</h3>
              <p>Musique live, DJ sets et soirées thématiques pour des nuits inoubliables sur notre rooftop.</p>
            </div>
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-users" aria-hidden="true"></i></div>
              <h3>Événements privés</h3>
              <p>Anniversaires, séminaires, célébrations : nous organisons vos événements sur mesure.</p>
            </div>
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-cutlery" aria-hidden="true"></i></div>
              <h3>Dégustations</h3>
              <p>Découvrez nos soirées dégustation avec des menus spéciaux créés par notre chef.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="chambres-seo-section chambres-seo-why">
        <div className="container">
          <h2>Un cadre unique pour vos événements</h2>
          <p className="chambres-seo-intro">
            Profitez de nos différents espaces pour créer l'événement parfait,
            que ce soit en intérieur ou en plein air sur notre rooftop.
          </p>
          <div className="chambres-seo-grid">
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-building" aria-hidden="true"></i></div>
              <h3>Rooftop panoramique</h3>
              <p>Un espace en plein air avec vue sur Cotonou, idéal pour les soirées et célébrations.</p>
            </div>
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-home" aria-hidden="true"></i></div>
              <h3>Salle intérieure</h3>
              <p>Un espace climatisé et élégant pour vos réunions, séminaires et repas de groupe.</p>
            </div>
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-beer" aria-hidden="true"></i></div>
              <h3>Bar &amp; lounge</h3>
              <p>Un espace décontracté pour vos afterworks, cocktails et soirées entre amis.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer contact={contact} />
      <WhatsAppFloat whatsapp={contact.whatsapp} />
    </div>
  );
}
