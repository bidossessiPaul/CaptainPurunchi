import type { Metadata } from "next";
import { readContactInfo } from "@/lib/contact-store";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "FAQ — Questions Fréquentes | Captain Purunchi Cotonou",
  description:
    "Toutes les réponses à vos questions sur le Captain Purunchi à Cotonou : réservation, horaires, hébergement, parking, paiement, privatisation et fruits de mer.",
  keywords: [
    "FAQ Captain Purunchi", "questions fréquentes restaurant Cotonou",
    "réservation Captain Purunchi", "horaires Captain Purunchi",
    "parking restaurant Cotonou", "privatisation Captain Purunchi",
    "chambres Captain Purunchi", "fruits de mer frais Cotonou",
  ],
  openGraph: {
    title: "FAQ — Captain Purunchi Cotonou",
    description: "Toutes vos questions sur le Captain Purunchi : horaires, réservation, hébergement, événements et fruits de mer à Cotonou.",
    url: "/faq",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "FAQ Captain Purunchi Cotonou" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ — Captain Purunchi Cotonou",
    description: "Réponses à toutes vos questions sur le Captain Purunchi à Cotonou.",
  },
  alternates: { canonical: "/faq" },
};

export const dynamic = "force-dynamic";

const FAQ_SECTIONS = [
  {
    title: "Réservation & Accueil",
    icon: "fa-calendar-check-o",
    questions: [
      {
        q: "Comment réserver une table au Captain Purunchi ?",
        a: "Vous pouvez réserver en ligne via notre formulaire de réservation sur captainpurunchi.com/reservation, par téléphone au +229 01 912 770 70, ou via WhatsApp. La confirmation est rapide et gratuite.",
      },
      {
        q: "Faut-il réserver à l'avance ?",
        a: "La réservation est recommandée, surtout le week-end et en soirée. Pour les groupes de plus de 6 personnes et les événements privés, la réservation est obligatoire.",
      },
      {
        q: "Acceptez-vous les groupes ?",
        a: "Absolument. Nous accueillons les groupes pour déjeuners, dîners et événements. Contactez-nous pour les formules groupe et les privatisations.",
      },
      {
        q: "Peut-on privatiser le Captain Purunchi ?",
        a: "Oui. Nous proposons la privatisation du restaurant, du rooftop ou de la terrasse pour anniversaires, mariages, séminaires et cocktails dinatoires. Contactez-nous pour un devis personnalisé.",
      },
    ],
  },
  {
    title: "Horaires & Localisation",
    icon: "fa-clock-o",
    questions: [
      {
        q: "Quels sont les horaires d'ouverture ?",
        a: "Nous sommes ouverts tous les jours : lundi de 9h à 22h, mardi au dimanche de 9h à 23h. Le service du déjeuner commence à 11h30 et le dîner à 18h30.",
      },
      {
        q: "Où se trouve le Captain Purunchi ?",
        a: "Le Captain Purunchi est situé à O6bp 2556 pk 3, Fidjrossè, Cotonou, Bénin. À environ 10 minutes de l'aéroport international de Cotonou et proche des plages.",
      },
      {
        q: "Y a-t-il un parking ?",
        a: "Oui, nous disposons d'un parking gratuit et sécurisé sur place pour nos clients.",
      },
      {
        q: "Proposez-vous une navette aéroport ?",
        a: "Oui, nous proposons un service de navette aéroport sur demande. Contactez-nous à l'avance pour organiser votre transfert.",
      },
    ],
  },
  {
    title: "Notre Cuisine",
    icon: "fa-cutlery",
    questions: [
      {
        q: "D'où viennent les fruits de mer ?",
        a: "Nos fruits de mer sont approvisionnés chaque matin directement depuis le port de pêche de Cotonou. Nous garantissons une fraîcheur absolue — pas de produits surgelés sur notre carte.",
      },
      {
        q: "Avez-vous des options végétariennes ?",
        a: "Oui, notre carte propose des plats végétariens, des salades et des accompagnements adaptés. N'hésitez pas à signaler vos préférences lors de la réservation.",
      },
      {
        q: "Peut-on commander à emporter ?",
        a: "Oui, nous proposons la commande à emporter pour la plupart de nos plats. Appelez-nous ou commandez via WhatsApp pour préparer votre commande à l'avance.",
      },
      {
        q: "Quels modes de paiement acceptez-vous ?",
        a: "Nous acceptons les espèces en FCFA et le paiement Mobile Money. Renseignez-vous auprès de notre équipe lors de votre visite.",
      },
    ],
  },
  {
    title: "Hébergement",
    icon: "fa-bed",
    questions: [
      {
        q: "Quels types de chambres proposez-vous ?",
        a: "Nous proposons 4 types de chambres : Chambre Confort (20 000 FCFA), Chambre Standard (25 000 FCFA), Suite Capitaine (30 000 FCFA) et Chambre Familiale (35 000 FCFA). Toutes incluent le petit-déjeuner.",
      },
      {
        q: "Qu'est-ce qui est inclus dans le prix de la chambre ?",
        a: "Toutes nos chambres incluent : Wi-Fi gratuit, climatisation, écran plat, petit-déjeuner, parking gratuit, accès au bar et rooftop, et salle de bain privée.",
      },
      {
        q: "À quelle heure est le check-in et le check-out ?",
        a: "Le check-in est à partir de 12h00 et le check-out avant 11h00. Un départ tardif peut être arrangé selon disponibilité.",
      },
      {
        q: "Peut-on réserver une chambre sans passer par le restaurant ?",
        a: "Oui, nos chambres sont disponibles indépendamment du restaurant. Contactez-nous par téléphone, WhatsApp ou via notre formulaire en ligne pour réserver.",
      },
    ],
  },
  {
    title: "Événements & Soirées",
    icon: "fa-music",
    questions: [
      {
        q: "Quels types d'événements organisez-vous ?",
        a: "Nous organisons des soirées DJ, brunchs du dimanche, soirées acoustiques, ateliers grillades, anniversaires, séminaires d'entreprise et cocktails dinatoires.",
      },
      {
        q: "Comment être informé des prochains événements ?",
        a: "Suivez-nous sur Facebook (@CaptainPurunchi) et Instagram (@captainpurunchi) pour ne manquer aucun événement. Vous pouvez aussi consulter notre page Événements sur le site.",
      },
      {
        q: "Les enfants sont-ils acceptés ?",
        a: "Oui, le Captain Purunchi est un établissement familial qui accueille les enfants avec plaisir. Des chaises hautes sont disponibles sur demande.",
      },
    ],
  },
];

export default async function FaqPage() {
  const contact = await readContactInfo();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_SECTIONS.flatMap((section) =>
      section.questions.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      }))
    ),
  };

  return (
    <div className="faq-page">
      <Breadcrumbs items={[{ name: "FAQ", href: "/faq" }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navbar activePage="faq" />

      <div className="menu-page-header">
        <div className="container">
          <h1>Questions Fréquentes</h1>
          <p>Toutes les réponses à vos questions sur le Captain Purunchi.</p>
        </div>
      </div>

      <section className="faq-page-content pad-top-80 pad-bottom-100">
        <div className="container">

          {/* Navigation rapide */}
          <div className="faq-nav">
            {FAQ_SECTIONS.map((section) => (
              <a key={section.title} href={`#${section.title.toLowerCase().replace(/[^a-z]/g, "-")}`} className="faq-nav-item">
                <i className={`fa ${section.icon}`} aria-hidden="true"></i>
                {section.title}
              </a>
            ))}
          </div>

          {/* Sections FAQ */}
          {FAQ_SECTIONS.map((section) => (
            <div
              key={section.title}
              id={section.title.toLowerCase().replace(/[^a-z]/g, "-")}
              className="faq-section-block"
            >
              <h2 className="faq-section-title">
                <i className={`fa ${section.icon}`} aria-hidden="true"></i>
                {section.title}
              </h2>
              <div className="faq-list">
                {section.questions.map(({ q, a }) => (
                  <div key={q} className="faq-item">
                    <h3 className="faq-question">{q}</h3>
                    <p className="faq-answer">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* CTA contact */}
          <div className="faq-cta text-center">
            <p className="faq-cta-text">Vous n'avez pas trouvé votre réponse ?</p>
            <a href="/contact" className="btn btn-primary" style={{ marginRight: "15px" }}>
              Contactez-nous
            </a>
            {contact.whatsapp && (
              <a
                href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`}
                className="btn btn-primary-outline"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa fa-whatsapp" aria-hidden="true"></i> WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>

      <Footer contact={contact} />
      <WhatsAppFloat whatsapp={contact.whatsapp} />
    </div>
  );
}
