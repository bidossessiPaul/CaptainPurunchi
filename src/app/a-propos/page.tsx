import type { Metadata } from "next";
import { readContactInfo } from "@/lib/contact-store";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Breadcrumbs from "@/components/Breadcrumbs";

const BASE_URL = process.env.SITE_URL || "https://captainpurunchi.com";

export const metadata: Metadata = {
  title: "À Propos — Histoire & Équipe du Captain Purunchi Cotonou",
  description:
    "Découvrez l'histoire du Captain Purunchi, restaurant fruits de mer à Cotonou. Notre équipe passionnée, notre philosophie culinaire et notre engagement pour la fraîcheur des produits de la mer.",
  keywords: [
    "à propos Captain Purunchi", "histoire restaurant Cotonou",
    "équipe Captain Purunchi", "philosophie culinaire Cotonou",
    "restaurant fruits de mer Cotonou histoire", "chef Captain Purunchi",
    "restaurant familial Cotonou", "Captain Purunchi Bénin",
  ],
  openGraph: {
    title: "À Propos — Captain Purunchi Cotonou",
    description: "L'histoire, l'équipe et la philosophie du Captain Purunchi — restaurant fruits de mer, rooftop et hébergement à Cotonou, Bénin.",
    url: "/a-propos",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Équipe Captain Purunchi Cotonou" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "À Propos — Captain Purunchi Cotonou",
    description: "Histoire, équipe et philosophie du Captain Purunchi à Cotonou, Bénin.",
  },
  alternates: { canonical: "/a-propos" },
};

export const dynamic = "force-dynamic";

export default async function AProposPage() {
  const contact = await readContactInfo();

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${BASE_URL}/#restaurant`,
    name: "Captain Purunchi",
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    image: `${BASE_URL}/og-image.jpg`,
    description:
      "Restaurant gastronomique de fruits de mer, bar rooftop et hébergement à Cotonou, Bénin. Produits frais du port de Cotonou, cuisine du chef.",
    foundingDate: "2024",
    address: {
      "@type": "PostalAddress",
      streetAddress: "O6bp 2556 pk 3, Fidjrossè",
      addressLocality: "Cotonou",
      addressCountry: "BJ",
    },
    telephone: contact.phone || "+22901912770 70",
    email: contact.email || "contact@captainpurunchi.com",
    sameAs: [
      contact.facebook || "https://www.facebook.com/61558389656062",
      contact.instagram || "https://www.instagram.com/captainpurunchi",
    ].filter(Boolean),
    employee: [
      {
        "@type": "Person",
        name: "L'équipe Captain Purunchi",
        jobTitle: "Équipe de cuisine et d'accueil",
      },
    ],
  };

  return (
    <div className="a-propos-page">
      <Breadcrumbs items={[{ name: "À Propos", href: "/a-propos" }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd).replace(/<\/script>/gi, "<\\/script>") }}
      />
      <Navbar activePage="a-propos" />

      {/* Hero */}
      <div className="menu-page-header">
        <div className="container">
          <h1>À Propos de Captain Purunchi</h1>
          <p>
            Une histoire de passion, de mer et de saveurs au cœur de Cotonou.
          </p>
        </div>
      </div>

      {/* Notre histoire */}
      <section className="a-propos-section pad-top-100 pad-bottom-60">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <div className="a-propos-content">
                <h2 className="block-title">Notre Histoire</h2>
                <h3>Né de la passion de la mer</h3>
                <p>
                  Captain Purunchi est né d'un rêve simple : offrir à Cotonou
                  un lieu où les fruits de mer frais, pêchés chaque matin dans
                  le port, rencontrent une cuisine d'exception dans un cadre
                  unique. Situé à Fidjrossè, au cœur de la capitale
                  économique du Bénin, notre établissement est bien plus qu'un
                  restaurant — c'est une expérience complète.
                </p>
                <p>
                  Depuis notre ouverture, nous avons fait le choix d'un
                  approvisionnement local et quotidien. Chaque matin, nos
                  produits sont sélectionnés directement au port de pêche de
                  Cotonou, garantissant une fraîcheur absolue dans chaque assiette.
                </p>
                <p>
                  Aujourd'hui, le Captain Purunchi accueille familles,
                  professionnels, touristes et expatriés dans trois espaces
                  distincts : notre restaurant à la cuisine ouverte, notre
                  terrasse en plein air et notre rooftop avec vue panoramique
                  sur Cotonou.
                </p>
              </div>
            </div>
            <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <div className="a-propos-img-wrap">
                <img
                  src="/og-image.jpg"
                  alt="Captain Purunchi — Restaurant fruits de mer Cotonou"
                  className="a-propos-img"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="chambres-seo-section chambres-seo-why">
        <div className="container">
          <h2>Nos Valeurs</h2>
          <p className="chambres-seo-intro">
            Ce qui nous distingue, c'est notre engagement envers la qualité,
            la fraîcheur et l'hospitalité béninoise.
          </p>
          <div className="chambres-seo-grid">
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon">
                <i className="fa fa-ship" aria-hidden="true"></i>
              </div>
              <h3>Fraîcheur garantie</h3>
              <p>
                Nos fruits de mer sont approvisionnés chaque matin directement
                depuis le port de pêche de Cotonou. Pas de congélation,
                pas de compromis sur la qualité.
              </p>
            </div>
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon">
                <i className="fa fa-cutlery" aria-hidden="true"></i>
              </div>
              <h3>Cuisine du chef</h3>
              <p>
                Notre chef marie techniques culinaires françaises et
                recettes africaines pour créer des plats uniques qui
                célèbrent la richesse de la mer béninoise.
              </p>
            </div>
            <div className="chambres-seo-card">
              <div className="chambres-seo-icon">
                <i className="fa fa-heart" aria-hidden="true"></i>
              </div>
              <h3>Hospitalité authentique</h3>
              <p>
                Chaque client est reçu comme un invité de marque. Notre équipe
                est formée pour offrir un service chaleureux, attentionné et
                personnalisé à chaque visite.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ce que nous offrons */}
      <section className="a-propos-section pad-top-60 pad-bottom-60">
        <div className="container">
          <h2 className="block-title text-center">Ce que nous offrons</h2>
          <div className="row" style={{ marginTop: "40px" }}>
            <div className="col-lg-3 col-md-6 col-sm-6 col-xs-12">
              <div className="a-propos-feature">
                <div className="a-propos-feature-icon">
                  <i className="fa fa-cutlery" aria-hidden="true"></i>
                </div>
                <h4>Restaurant gastronomique</h4>
                <p>
                  Fruits de mer, grillades au feu de bois, plats africains
                  et internationaux. Déjeuner et dîner tous les jours.
                </p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 col-sm-6 col-xs-12">
              <div className="a-propos-feature">
                <div className="a-propos-feature-icon">
                  <i className="fa fa-building" aria-hidden="true"></i>
                </div>
                <h4>Rooftop & Bar</h4>
                <p>
                  Bar avec vue panoramique sur Cotonou, cocktails signatures,
                  soirées à thème et ambiance unique au sommet.
                </p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 col-sm-6 col-xs-12">
              <div className="a-propos-feature">
                <div className="a-propos-feature-icon">
                  <i className="fa fa-bed" aria-hidden="true"></i>
                </div>
                <h4>Hébergement</h4>
                <p>
                  4 types de chambres confortables (20 000–35 000 FCFA/nuit)
                  avec Wi-Fi, climatisation et petit-déjeuner inclus.
                </p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 col-sm-6 col-xs-12">
              <div className="a-propos-feature">
                <div className="a-propos-feature-icon">
                  <i className="fa fa-calendar" aria-hidden="true"></i>
                </div>
                <h4>Événements privés</h4>
                <p>
                  Privatisation du restaurant, rooftop ou terrasse pour
                  anniversaires, mariages, séminaires et cocktails.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chiffres clés */}
      <section className="chambres-seo-section" style={{ background: "#f8f9fa" }}>
        <div className="container">
          <h2 className="block-title text-center">Captain Purunchi en chiffres</h2>
          <div className="chambres-seo-grid" style={{ marginTop: "40px" }}>
            <div className="chambres-seo-card text-center">
              <div className="a-propos-stat">7j/7</div>
              <h3>Ouvert tous les jours</h3>
              <p>De 9h à 23h pour vous accueillir midi et soir, week-ends et jours fériés.</p>
            </div>
            <div className="chambres-seo-card text-center">
              <div className="a-propos-stat">4</div>
              <h3>Types de chambres</h3>
              <p>Confort, Standard, Suite Capitaine et Familiale pour tous les budgets.</p>
            </div>
            <div className="chambres-seo-card text-center">
              <div className="a-propos-stat">100%</div>
              <h3>Produits frais</h3>
              <p>Approvisionnement quotidien au port de pêche de Cotonou, sans exception.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="a-propos-cta pad-top-60 pad-bottom-60 text-center">
        <div className="container">
          <h2>Venez nous rendre visite</h2>
          <p style={{ fontSize: "18px", marginBottom: "30px", color: "#666" }}>
            Réservez votre table ou contactez-nous pour organiser votre prochain événement.
          </p>
          <a href="/reservation" className="btn btn-primary" style={{ marginRight: "15px" }}>
            Réserver une table
          </a>
          <a href="/contact" className="btn btn-primary-outline">
            Nous contacter
          </a>
        </div>
      </section>

      <Footer contact={contact} />
      <WhatsAppFloat whatsapp={contact.whatsapp} />
    </div>
  );
}
