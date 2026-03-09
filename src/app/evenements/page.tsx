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
    "Soir\u00e9es \u00e0 th\u00e8me, DJ set rooftop vue mer, \u00e9v\u00e9nements priv\u00e9s, anniversaires, s\u00e9minaires et cocktails dinatoires au Captain Purunchi \u00e0 Cotonou, B\u00e9nin. Privatisation restaurant et rooftop disponible.",
  openGraph: {
    title: "\u00c9v\u00e9nements & Rooftop | Captain Purunchi Cotonou",
    description: "Soir\u00e9es rooftop, musique live, privatisation pour mariages, anniversaires et s\u00e9minaires \u00e0 Cotonou.",
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

export default async function EvenementsPage() {
  const [events, contact] = await Promise.all([
    readActiveEvents(),
    readContactInfo(),
  ]);

  return (
    <div className="evenements-page">
      <Breadcrumbs items={[{ name: "Événements", href: "/evenements" }]} />
      <Navbar activePage="evenements" />

      <div className="evenements-page-header">
        <div className="container">
          <h1>&Eacute;v&eacute;nements &amp; Actualit&eacute;s</h1>
          <p>
            Restez inform&eacute;s de nos soir&eacute;es, &eacute;v&eacute;nements
            et derni&egrave;res nouvelles au Captain Purunchi.
          </p>
        </div>
      </div>

      <section className="services-highlight-section">
        <div className="container">
          <p className="services-highlight-intro">
            Ne manquez aucun &eacute;v&eacute;nement. R&eacute;servez en ligne
            ou contactez-nous pour privatiser un espace.
          </p>
          <div className="services-highlight-grid">
            <div className="services-highlight-item">
              <div className="services-highlight-icon"><i className="fa fa-calendar-check-o" aria-hidden="true"></i></div>
              <span>R&eacute;servation en ligne</span>
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
              <span>D&eacute;co personnalis&eacute;e</span>
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
          <h2>Vivez des moments uniques &agrave; Cotonou</h2>
          <p className="chambres-seo-intro">
            Captain Purunchi est bien plus qu&rsquo;un restaurant. C&rsquo;est un lieu de vie
            o&ugrave; chaque &eacute;v&eacute;nement est une exp&eacute;rience &agrave; part enti&egrave;re,
            dans un cadre exceptionnel au c&oelig;ur de Cotonou.
          </p>
          <div className="chambres-seo-grid">
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-music" aria-hidden="true"></i></div>
              <h3>Soir&eacute;es &agrave; th&egrave;me</h3>
              <p>Musique live, DJ sets et soir&eacute;es th&eacute;matiques pour des nuits inoubliables sur notre rooftop.</p>
            </div>
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-users" aria-hidden="true"></i></div>
              <h3>&Eacute;v&eacute;nements priv&eacute;s</h3>
              <p>Anniversaires, s&eacute;minaires, c&eacute;l&eacute;brations : nous organisons vos &eacute;v&eacute;nements sur mesure.</p>
            </div>
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-cutlery" aria-hidden="true"></i></div>
              <h3>D&eacute;gustations</h3>
              <p>D&eacute;couvrez nos soir&eacute;es d&eacute;gustation avec des menus sp&eacute;ciaux cr&eacute;&eacute;s par notre chef.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="chambres-seo-section chambres-seo-why">
        <div className="container">
          <h2>Un cadre unique pour vos &eacute;v&eacute;nements</h2>
          <p className="chambres-seo-intro">
            Profitez de nos diff&eacute;rents espaces pour cr&eacute;er l&rsquo;&eacute;v&eacute;nement parfait,
            que ce soit en int&eacute;rieur ou en plein air sur notre rooftop.
          </p>
          <div className="chambres-seo-grid">
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-building" aria-hidden="true"></i></div>
              <h3>Rooftop panoramique</h3>
              <p>Un espace en plein air avec vue sur Cotonou, id&eacute;al pour les soir&eacute;es et c&eacute;l&eacute;brations.</p>
            </div>
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-home" aria-hidden="true"></i></div>
              <h3>Salle int&eacute;rieure</h3>
              <p>Un espace climatis&eacute; et &eacute;l&eacute;gant pour vos r&eacute;unions, s&eacute;minaires et repas de groupe.</p>
            </div>
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-beer" aria-hidden="true"></i></div>
              <h3>Bar &amp; lounge</h3>
              <p>Un espace d&eacute;contract&eacute; pour vos afterworks, cocktails et soir&eacute;es entre amis.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer contact={contact} />
      <WhatsAppFloat whatsapp={contact.whatsapp} />
    </div>
  );
}
