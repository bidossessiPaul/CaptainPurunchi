import type { Metadata } from "next";
import { readActiveRooms } from "@/lib/room-store";
import { readContactInfo } from "@/lib/contact-store";
import Rooms from "../Rooms";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Chambres & H\u00e9bergement Vue Mer \u2014 Captain Purunchi",
  description:
    "Chambre ou appartement vue mer \u00e0 Cotonou, B\u00e9nin. Climatisation, Wi-Fi, parking et acc\u00e8s restaurant & rooftop Captain Purunchi. R\u00e9servez en ligne.",
  openGraph: {
    title: "Chambres & Appartements Vue Mer | Captain Purunchi Cotonou",
    description: "H\u00e9bergement confortable bord de mer \u00e0 Cotonou. Appartements meubl\u00e9s avec cuisine, Wi-Fi, restaurant sur place. Id\u00e9al familles, professionnels et expats.",
    url: "/chambres",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Chambres Captain Purunchi" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chambres & H\u00e9bergement Vue Mer | Captain Purunchi",
    description: "Appartements vue mer \u00e0 Cotonou, B\u00e9nin. Wi-Fi, parking, restaurant sur place.",
  },
  keywords: [
    "appartement vue mer Cotonou", "chambre h\u00f4tel bord de mer Cotonou",
    "h\u00e9bergement Cotonou B\u00e9nin", "location appartement Cotonou court s\u00e9jour",
    "h\u00f4tel boutique Cotonou", "appartement meubl\u00e9 Cotonou",
    "chambre climatis\u00e9e vue mer Cotonou", "o\u00f9 dormir \u00e0 Cotonou bord de mer",
    "sea view apartment Cotonou Benin", "short stay accommodation Cotonou",
    "logement expatri\u00e9 Cotonou", "h\u00e9bergement famille Cotonou bord de mer",
  ],
  alternates: { canonical: "/chambres" },
};

export const dynamic = "force-dynamic";

export default async function ChambresPage() {
  const [rooms, contact] = await Promise.all([
    readActiveRooms(),
    readContactInfo(),
  ]);

  return (
    <div className="chambres-page">
      <Breadcrumbs items={[{ name: "Chambres & Hébergement", href: "/chambres" }]} />
      <Navbar activePage="chambres" />

      <div className="chambres-page-header">
        <div className="container">
          <h1>Nos Chambres</h1>
          <p>
            Prolongez votre expérience et séjournez dans nos chambres
            confortables au cœur de Cotonou.
          </p>
        </div>
      </div>

      <section className="services-highlight-section">
        <div className="container">
          <p className="services-highlight-intro">
            Chaque réservation comprend une gamme complète de services
            pour un séjour agréable et sans souci.
          </p>
          <div className="services-highlight-grid">
            <div className="services-highlight-item">
              <div className="services-highlight-icon"><i className="fa fa-wifi" aria-hidden="true"></i></div>
              <span>Wi-Fi gratuit</span>
            </div>
            <div className="services-highlight-item">
              <div className="services-highlight-icon"><i className="fa fa-snowflake-o" aria-hidden="true"></i></div>
              <span>Climatisation</span>
            </div>
            <div className="services-highlight-item">
              <div className="services-highlight-icon"><i className="fa fa-television" aria-hidden="true"></i></div>
              <span>Écran plat</span>
            </div>
            <div className="services-highlight-item">
              <div className="services-highlight-icon"><i className="fa fa-coffee" aria-hidden="true"></i></div>
              <span>Petit-déjeuner</span>
            </div>
            <div className="services-highlight-item">
              <div className="services-highlight-icon"><i className="fa fa-car" aria-hidden="true"></i></div>
              <span>Parking gratuit</span>
            </div>
            <div className="services-highlight-item">
              <div className="services-highlight-icon"><i className="fa fa-glass" aria-hidden="true"></i></div>
              <span>Bar &amp; rooftop</span>
            </div>
            <div className="services-highlight-item">
              <div className="services-highlight-icon"><i className="fa fa-bath" aria-hidden="true"></i></div>
              <span>Salle de bain privée</span>
            </div>
            <div className="services-highlight-item">
              <div className="services-highlight-icon"><i className="fa fa-bell" aria-hidden="true"></i></div>
              <span>Réception 24h</span>
            </div>
          </div>
        </div>
      </section>

      <Rooms rooms={rooms} whatsapp={contact.whatsapp} hideTitle grid />

      <section className="chambres-seo-section chambres-seo-why">
        <div className="container">
          <h2>Pourquoi choisir Captain Purunchi pour votre hébergement à Cotonou ?</h2>
          <p className="chambres-seo-intro">
            Situé au cœur de Cotonou, Captain Purunchi vous offre bien plus qu'un simple hébergement.
            Nos chambres ont été conçues pour allier confort moderne et charme authentique,
            vous garantissant un séjour mémorable au Bénin.
          </p>
          <div className="chambres-seo-grid">
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-bed" aria-hidden="true"></i></div>
              <h3>Confort haut de gamme</h3>
              <p>Literie premium, climatisation, Wi-Fi haut débit et salle de bain privée dans chaque chambre.</p>
            </div>
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-cutlery" aria-hidden="true"></i></div>
              <h3>Restaurant sur place</h3>
              <p>Savourez notre cuisine locale et internationale sans quitter l'établissement.</p>
            </div>
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-shield" aria-hidden="true"></i></div>
              <h3>Sécurité 24h/24</h3>
              <p>Profitez d'un séjour en toute tranquillité grâce à notre équipe de sécurité présente jour et nuit.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="chambres-seo-section chambres-seo-location">
        <div className="container">
          <h2>Une situation idéale au cœur de Cotonou</h2>
          <p className="chambres-seo-intro">
            Notre hôtel-restaurant est idéalement situé à Cotonou, la capitale économique du Bénin.
          </p>
          <div className="chambres-seo-grid">
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-map-marker" aria-hidden="true"></i></div>
              <h3>Centre-ville</h3>
              <p>Accès rapide aux marchés, commerces et centres d'affaires de Cotonou.</p>
            </div>
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-plane" aria-hidden="true"></i></div>
              <h3>Proche de l'aéroport</h3>
              <p>Situé à quelques minutes de l'aéroport international de Cotonou.</p>
            </div>
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-sun-o" aria-hidden="true"></i></div>
              <h3>Plages à proximité</h3>
              <p>Détendez-vous sur les plages de Cotonou, accessibles en quelques minutes.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer contact={contact} />
      <WhatsAppFloat whatsapp={contact.whatsapp} />
    </div>
  );
}
