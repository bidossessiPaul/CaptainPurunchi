import type { Metadata } from "next";
import Blog from "./Blog";
import Events from "./Events";
import Gallery from "./Gallery";
import HeroSlideshow from "./HeroSlideshow";
import Rooms from "./Rooms";
import ScrollReveal from "./ScrollReveal";
import Specialties from "./Specialties";
import Testimonials from "./Testimonials";
import { getHomepageData } from "@/lib/homepage-data";
import MenuDuJour from "./MenuDuJour";
import VideoPromo from "./VideoPromo";
import TableReservationForm from "./TableReservationForm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

export const metadata: Metadata = {
  title: "Captain Purunchi \u2014 Restaurant Fruits de Mer Cotonou",
  description:
    "D\u00e9couvrez Captain Purunchi : restaurant fruits de mer \u00e0 Cotonou. Homard grill\u00e9, gambas, rooftop vue mer et h\u00e9bergement. R\u00e9servez en ligne.",
  openGraph: {
    title: "Captain Purunchi \u2014 Restaurant Fruits de Mer, Rooftop & H\u00e9bergement \u00e0 Cotonou",
    description:
      "Meilleur restaurant fruits de mer \u00e0 Cotonou, B\u00e9nin. Produits frais, cuisine du chef, rooftop vue sur l\u2019Atlantique, chambres confortables. Exp\u00e9rience culinaire unique bord de mer.",
    type: "website",
    url: "/",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Captain Purunchi Cotonou" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Captain Purunchi \u2014 Restaurant Fruits de Mer Cotonou",
    description: "Homard grill\u00e9, gambas, rooftop vue mer et h\u00e9bergement \u00e0 Cotonou, B\u00e9nin. R\u00e9servez en ligne.",
  },
  keywords: [
    "Captain Purunchi", "restaurant fruits de mer Cotonou", "meilleur restaurant Cotonou",
    "restaurant bord de mer Cotonou", "homard grill\u00e9 Cotonou", "gambas royales Cotonou",
    "restaurant gastronomique fran\u00e7ais Cotonou", "rooftop Cotonou vue mer",
    "h\u00e9bergement bord de mer Cotonou", "complexe h\u00f4telier restaurant Cotonou",
    "d\u00eener romantique vue mer Cotonou", "o\u00f9 manger des fruits de mer \u00e0 Cotonou",
    "seafood restaurant Cotonou Benin", "best restaurant Cotonou",
  ],
  alternates: { canonical: "/" },
};

export const dynamic = "force-dynamic";

export default async function Home() {
  // Single DB connection + 60s cache (9 queries → 1 connection)
  const {
    heroSlides,
    specialties,
    galleryImages,
    rooms,
    events,
    blogPosts: blogPostsRaw,
    testimonials,
    contact: contactRaw,
    todaysDishes,
  } = await getHomepageData();

  // Normalize contact (handle null case)
  const contact = contactRaw || { phone: "", email: "", address: "", whatsapp: "", facebook: "", instagram: "" };
  const blogPosts = blogPostsRaw || [];
  const sameAs = [contact.facebook, contact.instagram].filter(Boolean);
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Captain Purunchi",
    url: "https://captainpurunchi.com",
    logo: "https://captainpurunchi.com/logo.png",
    image: "https://captainpurunchi.com/logo.png",
    telephone: contact.phone || undefined,
    email: contact.email || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.address || "Fidjrossè, Cotonou",
      addressLocality: "Cotonou",
      addressCountry: "BJ",
    },
    geo: { "@type": "GeoCoordinates", latitude: 6.3654, longitude: 2.3924 },
    servesCuisine: ["Française", "Fruits de mer", "Africaine", "Grillades"],
    priceRange: "$$",
    acceptsReservations: true,
    hasMenu: "https://captainpurunchi.com/menu",
    ...(sameAs.length > 0 && { sameAs }),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Où se trouve le Captain Purunchi à Cotonou ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Le Captain Purunchi est situé à O6bp 2556 pk 3, Fidjrossè, Cotonou, Bénin. Proche de l'aéroport et des plages, facilement accessible en voiture.",
        },
      },
      {
        "@type": "Question",
        name: "Quels sont les horaires du Captain Purunchi ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Le Captain Purunchi est ouvert du lundi au dimanche. Lundi : 9h–22h. Mardi au dimanche : 9h–23h.",
        },
      },
      {
        "@type": "Question",
        name: "Peut-on réserver une table en ligne au Captain Purunchi ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Oui, vous pouvez réserver votre table directement en ligne via notre formulaire de réservation, ou nous contacter par téléphone et WhatsApp au +229 01 912 770 70.",
        },
      },
      {
        "@type": "Question",
        name: "Le Captain Purunchi propose-t-il des chambres ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Oui, le Captain Purunchi dispose de 4 types de chambres (Confort, Standard, Suite Capitaine, Familiale) à partir de 20 000 FCFA la nuit, avec petit-déjeuner, Wi-Fi et climatisation inclus.",
        },
      },
      {
        "@type": "Question",
        name: "D'où viennent les fruits de mer du Captain Purunchi ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Nos fruits de mer sont approvisionnés chaque matin directement depuis le port de pêche de Cotonou, garantissant une fraîcheur maximale à chaque plat.",
        },
      },
      {
        "@type": "Question",
        name: "Peut-on privatiser le Captain Purunchi pour un événement ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Oui, nous proposons la privatisation du restaurant, du rooftop ou de la terrasse pour vos événements : anniversaires, mariages, séminaires, cocktails. Contactez-nous pour un devis.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <ScrollReveal />
      <Navbar activePage="accueil" />

      <HeroSlideshow slides={heroSlides} />

      {/* About */}
      <div id="about" className="about-main pad-top-100 pad-bottom-100">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <div className="wow fadeIn" data-wow-duration="1s" data-wow-delay="0.1s" suppressHydrationWarning>
                <h2 className="block-title">À propos</h2>
                <h3>BIENVENUE CHEZ CAPTAIN PURUNCHI</h3>
                <p>
                  Niché au cœur de Cotonou, Captain Purunchi est bien plus
                  qu'un simple restaurant. C'est une escale gourmande où
                  les saveurs de la mer rencontrent l'art culinaire, dans un
                  cadre chaleureux et convivial.
                </p>
                <p>
                  Notre cuisine met à l'honneur les produits frais de la
                  pêche locale, avec une spécialité dans les fruits de mer
                  et les grillades préparées avec passion par notre équipe.
                  Poissons grillés, homards rôtis, crevettes flambées
                  — chaque plat raconte une histoire de fraîcheur et de saveurs.
                </p>
                <p>
                  Que ce soit pour un déjeuner d'affaires, un dîner en
                  amoureux ou une soirée entre amis sur notre rooftop avec vue,
                  chaque moment chez Captain Purunchi est une expérience
                  inoubliable.
                </p>
                <p>
                  Profitez également de nos espaces d'hébergement
                  pour prolonger votre séjour et vivre pleinement
                  l'ambiance maritime qui fait notre identité.
                </p>
                <div className="book-btn" style={{ marginTop: "25px" }}>
                  <a href="/reservation" className="table-btn hvr-underline-from-center">
                    Réserver une table
                  </a>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <div className="wow fadeIn" data-wow-duration="1s" data-wow-delay="0.1s" suppressHydrationWarning>
                <div className="about-images text-center">
                  <img
                    src="/images%20captain/about.svg"
                    alt="Captain Purunchi - Le Capitaine"
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Specialties items={specialties} />

      <MenuDuJour dishes={todaysDishes} whatsapp={contact.whatsapp} />

      {/* Pourquoi nous choisir */}
      <div id="why-us" className="why-us-section">
        <div className="container">
          <div className="wow fadeIn" data-wow-duration="1s" data-wow-delay="0.1s" suppressHydrationWarning>
            <h2 className="block-title color-white text-center">Pourquoi nous choisir</h2>
            <p className="title-caption text-center">
              Une expérience unique qui fait revenir nos clients encore et encore.
            </p>
          </div>
          <div className="why-us-grid">
            <div className="why-us-card">
              <div className="why-us-icon"><i className="fa fa-anchor" aria-hidden="true"></i></div>
              <h3>Produits frais de la pêche</h3>
              <p>Nos poissons et fruits de mer arrivent chaque matin directement du port de Cotonou.</p>
            </div>
            <div className="why-us-card">
              <div className="why-us-icon"><i className="fa fa-eye" aria-hidden="true"></i></div>
              <h3>Vue panoramique</h3>
              <p>Notre rooftop offre une vue imprenable sur Cotonou. L'endroit idéal pour vos soirées.</p>
            </div>
            <div className="why-us-card">
              <div className="why-us-icon"><i className="fa fa-fire" aria-hidden="true"></i></div>
              <h3>Grillades au feu de bois</h3>
              <p>Nos viandes et poissons sont grillés au feu de bois pour un goût authentique.</p>
            </div>
            <div className="why-us-card">
              <div className="why-us-icon"><i className="fa fa-glass" aria-hidden="true"></i></div>
              <h3>Cocktails signatures</h3>
              <p>Découvrez nos créations originales avec des fruits frais locaux.</p>
            </div>
            <div className="why-us-card">
              <div className="why-us-icon"><i className="fa fa-bed" aria-hidden="true"></i></div>
              <h3>Hébergement sur place</h3>
              <p>Prolongez votre expérience avec nos chambres confortables.</p>
            </div>
            <div className="why-us-card">
              <div className="why-us-icon"><i className="fa fa-music" aria-hidden="true"></i></div>
              <h3>Ambiance &amp; événements</h3>
              <p>Soirées à thème, musique live et DJ sets chaque week-end.</p>
            </div>
          </div>
        </div>
      </div>

      <VideoPromo />

      <Gallery images={galleryImages} />
      <Rooms rooms={rooms} whatsapp={contact.whatsapp} />
      <Events events={events} whatsapp={contact.whatsapp} />
      <Blog posts={blogPosts} />
      <Testimonials testimonials={testimonials} />

      {/* FAQ */}
      <section className="faq-section pad-top-100 pad-bottom-100" id="faq">
        <div className="container">
          <div className="wow fadeIn" data-wow-duration="1s" data-wow-delay="0.1s" suppressHydrationWarning>
            <h2 className="block-title text-center">Questions fréquentes</h2>
          </div>
          <div className="faq-grid">
            {[
              {
                q: "Où se trouve le Captain Purunchi ?",
                a: "Situé à Fidjrossè, Cotonou (O6bp 2556 pk 3), proche de l'aéroport et des plages. Facilement accessible en voiture, avec parking gratuit sur place.",
              },
              {
                q: "Quels sont les horaires d'ouverture ?",
                a: "Lundi : 9h–22h. Mardi au dimanche : 9h–23h. Nous vous accueillons tous les jours, midi et soir.",
              },
              {
                q: "D'où viennent les fruits de mer ?",
                a: "Nos fruits de mer sont approvisionnés chaque matin directement depuis le port de pêche de Cotonou — fraîcheur garantie à chaque plat.",
              },
              {
                q: "Peut-on réserver une table en ligne ?",
                a: "Oui, directement via notre formulaire en ligne, par téléphone ou WhatsApp au +229 01 912 770 70. Confirmation rapide et gratuite.",
              },
              {
                q: "Le Captain Purunchi propose-t-il des chambres ?",
                a: "Oui, 4 types de chambres à partir de 20 000 FCFA/nuit. Wi-Fi, climatisation et petit-déjeuner inclus. Accès direct au restaurant et rooftop.",
              },
              {
                q: "Peut-on privatiser le lieu pour un événement ?",
                a: "Absolument. Rooftop, salle intérieure ou terrasse disponibles pour anniversaires, mariages, séminaires et cocktails. Contactez-nous pour un devis.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="faq-item">
                <h3 className="faq-question">{q}</h3>
                <p className="faq-answer">{a}</p>
              </div>
            ))}
          </div>
          <div className="text-center" style={{ marginTop: "40px" }}>
            <a href="/faq" className="btn btn-primary-outline">Voir toutes les questions</a>
          </div>
        </div>
      </section>

      {/* Reservation */}
      <div id="reservation" className="reservations-main pad-top-100 pad-bottom-100">
        <div className="container">
          <div className="row">
            <div className="form-reservations-box">
              <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                <div className="wow fadeIn" data-wow-duration="1s" data-wow-delay="0.1s" suppressHydrationWarning>
                  <h2 className="block-title text-center">Réservation</h2>
                </div>
                <p className="reservation-desc">Remplissez le formulaire et nous vous confirmerons votre réservation.</p>
                <TableReservationForm whatsapp={contact.whatsapp} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer contact={contact} />
      <WhatsAppFloat whatsapp={contact.whatsapp} />
    </>
  );
}
