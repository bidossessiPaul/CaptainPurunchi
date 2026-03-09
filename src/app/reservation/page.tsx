import type { Metadata } from "next";
import { readContactInfo } from "@/lib/contact-store";
import TableReservationForm from "../TableReservationForm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Réserver une Table — Restaurant Fruits de Mer & Rooftop Cotonou",
  description:
    "Réservez votre table au Captain Purunchi à Cotonou : restaurant fruits de mer, rooftop vue mer, terrasse. Réservation en ligne rapide pour déjeuner, dîner, événements privés et groupes.",
  keywords: [
    "réserver table Cotonou", "réservation restaurant Cotonou",
    "réservation Captain Purunchi", "réserver restaurant fruits de mer Cotonou",
    "réservation en ligne restaurant Cotonou", "réserver table bord de mer Cotonou",
    "réservation dîner Cotonou", "réservation rooftop Cotonou",
    "réservation groupe restaurant Cotonou", "réservation séminaire Cotonou",
    "book restaurant Cotonou", "restaurant reservation Benin",
    "table booking Cotonou seafood", "reserve table Captain Purunchi",
  ],
  openGraph: {
    title: "Réserver une Table — Captain Purunchi Cotonou",
    description: "Réservez votre table au Captain Purunchi : fruits de mer frais, rooftop vue mer, terrasse. Réservation rapide en ligne.",
    url: "/reservation",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Réservation Captain Purunchi" }],
  },
  alternates: { canonical: "/reservation" },
};

export const dynamic = "force-dynamic";

export default async function ReservationPage() {
  const contact = await readContactInfo();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Comment réserver une table au Captain Purunchi ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Vous pouvez réserver en ligne via notre formulaire de réservation, par téléphone ou via WhatsApp. La confirmation est rapide et gratuite.",
        },
      },
      {
        "@type": "Question",
        name: "Quels espaces sont disponibles pour une réservation ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Nous proposons la salle intérieure climatisée, la terrasse en plein air et le rooftop avec vue panoramique sur Cotonou. Chaque espace est disponible pour le déjeuner et le dîner.",
        },
      },
      {
        "@type": "Question",
        name: "Peut-on privatiser le restaurant pour un événement ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Oui, le Captain Purunchi propose la privatisation du restaurant, du rooftop ou de la terrasse pour vos événements privés : anniversaires, séminaires, mariages et cocktails dinatoires.",
        },
      },
      {
        "@type": "Question",
        name: "Le Captain Purunchi accepte-t-il les groupes ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Absolument. Nous accueillons les groupes pour déjeuners et dîners, avec des formules adaptées. Contactez-nous pour organiser votre repas de groupe.",
        },
      },
    ],
  };

  return (
    <div className="reservation-page">
      <Breadcrumbs items={[{ name: "Réservation", href: "/reservation" }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navbar activePage="reservation" />

      <div className="reservation-page-header">
        <div className="container">
          <h1>R&eacute;servation</h1>
          <p>
            R&eacute;servez votre table en quelques clics et profitez
            d&rsquo;une exp&eacute;rience culinaire unique au Captain Purunchi.
          </p>
        </div>
      </div>

      <div className="reservations-main pad-top-100 pad-bottom-100">
        <div className="container">
          <div className="row">
            <div className="form-reservations-box">
              <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                <TableReservationForm whatsapp={contact.whatsapp} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="chambres-seo-section chambres-seo-why">
        <div className="container">
          <h2>Pourquoi r&eacute;server chez Captain Purunchi&nbsp;?</h2>
          <p className="chambres-seo-intro">
            Que ce soit pour un d&icirc;ner romantique, un repas en famille ou un d&eacute;jeuner d&rsquo;affaires,
            Captain Purunchi vous accueille dans un cadre exceptionnel au c&oelig;ur de Cotonou.
          </p>
          <div className="chambres-seo-grid">
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-cutlery" aria-hidden="true"></i></div>
              <h3>Cuisine d&rsquo;exception</h3>
              <p>Des plats locaux et internationaux pr&eacute;par&eacute;s avec des produits frais et de qualit&eacute; par notre chef.</p>
            </div>
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-glass" aria-hidden="true"></i></div>
              <h3>Cadre unique</h3>
              <p>Restaurant, bar et rooftop avec vue panoramique pour une atmosph&egrave;re in&eacute;galable.</p>
            </div>
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-heart" aria-hidden="true"></i></div>
              <h3>Service personnalis&eacute;</h3>
              <p>Notre &eacute;quipe attentive s&rsquo;adapte &agrave; vos besoins pour rendre chaque visite m&eacute;morable.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="chambres-seo-section chambres-seo-services">
        <div className="container">
          <h2>Nos espaces &amp; formules</h2>
          <p className="chambres-seo-intro">
            Choisissez l&rsquo;espace qui correspond &agrave; votre occasion.
          </p>
          <div className="chambres-seo-list chambres-seo-list-3col">
            <ul>
              <li><i className="fa fa-coffee" aria-hidden="true"></i> Petit-d&eacute;jeuner</li>
              <li><i className="fa fa-sun-o" aria-hidden="true"></i> D&eacute;jeuner</li>
              <li><i className="fa fa-moon-o" aria-hidden="true"></i> D&icirc;ner</li>
            </ul>
            <ul>
              <li><i className="fa fa-building" aria-hidden="true"></i> Rooftop</li>
              <li><i className="fa fa-home" aria-hidden="true"></i> Salle int&eacute;rieure</li>
              <li><i className="fa fa-tree" aria-hidden="true"></i> Terrasse</li>
            </ul>
            <ul>
              <li><i className="fa fa-users" aria-hidden="true"></i> Groupes &amp; s&eacute;minaires</li>
              <li><i className="fa fa-birthday-cake" aria-hidden="true"></i> &Eacute;v&eacute;nements priv&eacute;s</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="chambres-seo-section chambres-seo-location">
        <div className="container">
          <h2>Informations pratiques</h2>
          <p className="chambres-seo-intro">
            Tout ce que vous devez savoir pour planifier votre visite au Captain Purunchi.
          </p>
          <div className="chambres-seo-grid">
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-clock-o" aria-hidden="true"></i></div>
              <h3>Horaires d&rsquo;ouverture</h3>
              <p>
                {contact.hours1Label && contact.hours1Value
                  ? `${contact.hours1Label} : ${contact.hours1Value}`
                  : "Ouvert tous les jours. Contactez-nous pour conna\u00eetre nos horaires."}
              </p>
            </div>
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-map-marker" aria-hidden="true"></i></div>
              <h3>Adresse</h3>
              <p>{contact.address || "Situ\u00e9 au c\u0153ur de Cotonou, B\u00e9nin."}</p>
            </div>
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon"><i className="fa fa-phone" aria-hidden="true"></i></div>
              <h3>Contact direct</h3>
              <p>
                {contact.phone
                  ? `Appelez-nous au ${contact.phone} ou contactez-nous sur WhatsApp.`
                  : "Contactez-nous par t\u00e9l\u00e9phone ou WhatsApp."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer contact={contact} />
      <WhatsAppFloat whatsapp={contact.whatsapp} />
    </div>
  );
}
