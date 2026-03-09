import type { Metadata } from "next";
import { readActiveRooms } from "@/lib/room-store";
import { readContactInfo } from "@/lib/contact-store";
import Rooms from "../Rooms";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "H\u00e9bergement & Appartements Vue Mer \u00e0 Cotonou \u2014 Chambres Captain Purunchi",
  description:
    "R\u00e9servez votre chambre ou appartement vue mer \u00e0 Cotonou, B\u00e9nin. Climatisation, Wi-Fi, cuisine \u00e9quip\u00e9e, parking gratuit et acc\u00e8s au restaurant & rooftop Captain Purunchi. Court s\u00e9jour, long s\u00e9jour, expats.",
  openGraph: {
    title: "Chambres & Appartements Vue Mer | Captain Purunchi Cotonou",
    description: "H\u00e9bergement confortable bord de mer \u00e0 Cotonou. Appartements meubl\u00e9s avec cuisine, Wi-Fi, restaurant sur place. Id\u00e9al familles, professionnels et expats.",
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
            Prolongez votre exp&eacute;rience et s&eacute;journez dans nos chambres
            confortables au c&oelig;ur de Cotonou.
          </p>
        </div>
      </div>

      <section className="services-highlight-section">
        <div className="container">
          <p className="services-highlight-intro">
            Chaque r&eacute;servation comprend une gamme compl&egrave;te de services
            pour un s&eacute;jour agr&eacute;able et sans souci.
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
              <span>&Eacute;cran plat</span>
            </div>
            <div className="services-highlight-item">
              <div className="services-highlight-icon"><i className="fa fa-coffee" aria-hidden="true"></i></div>
              <span>Petit-d&eacute;jeuner</span>
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
              <span>Salle de bain priv&eacute;e</span>
            </div>
            <div className="services-highlight-item">
              <div className="services-highlight-icon"><i className="fa fa-bell" aria-hidden="true"></i></div>
              <span>R&eacute;ception 24h</span>
            </div>
          </div>
        </div>
      </section>

      <Rooms rooms={rooms} whatsapp={contact.whatsapp} hideTitle />

      <section className="chambres-seo-section chambres-seo-why">
        <div className="container">
          <h2>Pourquoi choisir Captain Purunchi pour votre h&eacute;bergement &agrave; Cotonou&nbsp;?</h2>
          <p className="chambres-seo-intro">
            Situ&eacute; au c&oelig;ur de Cotonou, Captain Purunchi vous offre bien plus qu&rsquo;un simple h&eacute;bergement.
            Nos chambres ont &eacute;t&eacute; con&ccedil;ues pour allier confort moderne et charme authentique,
            vous garantissant un s&eacute;jour m&eacute;morable au B&eacute;nin.
          </p>
          <div className="chambres-seo-grid">
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-bed" aria-hidden="true"></i></div>
              <h3>Confort haut de gamme</h3>
              <p>Literie premium, climatisation, Wi-Fi haut d&eacute;bit et salle de bain priv&eacute;e dans chaque chambre.</p>
            </div>
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-cutlery" aria-hidden="true"></i></div>
              <h3>Restaurant sur place</h3>
              <p>Savourez notre cuisine locale et internationale sans quitter l&rsquo;&eacute;tablissement.</p>
            </div>
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-shield" aria-hidden="true"></i></div>
              <h3>S&eacute;curit&eacute; 24h/24</h3>
              <p>Profitez d&rsquo;un s&eacute;jour en toute tranquillit&eacute; gr&acirc;ce &agrave; notre &eacute;quipe de s&eacute;curit&eacute; pr&eacute;sente jour et nuit.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="chambres-seo-section chambres-seo-location">
        <div className="container">
          <h2>Une situation id&eacute;ale au c&oelig;ur de Cotonou</h2>
          <p className="chambres-seo-intro">
            Notre h&ocirc;tel-restaurant est id&eacute;alement situ&eacute; &agrave; Cotonou, la capitale &eacute;conomique du B&eacute;nin.
          </p>
          <div className="chambres-seo-grid">
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-map-marker" aria-hidden="true"></i></div>
              <h3>Centre-ville</h3>
              <p>Acc&egrave;s rapide aux march&eacute;s, commerces et centres d&rsquo;affaires de Cotonou.</p>
            </div>
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-plane" aria-hidden="true"></i></div>
              <h3>Proche de l&rsquo;a&eacute;roport</h3>
              <p>Situ&eacute; &agrave; quelques minutes de l&rsquo;a&eacute;roport international de Cotonou.</p>
            </div>
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-sun-o" aria-hidden="true"></i></div>
              <h3>Plages &agrave; proximit&eacute;</h3>
              <p>D&eacute;tendez-vous sur les plages de Cotonou, accessibles en quelques minutes.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer contact={contact} />
      <WhatsAppFloat whatsapp={contact.whatsapp} />
    </div>
  );
}
