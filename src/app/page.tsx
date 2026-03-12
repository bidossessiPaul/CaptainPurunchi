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
import TableReservationForm from "./TableReservationForm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

export const metadata: Metadata = {
  title: "Captain Purunchi \u2014 Meilleur Restaurant Fruits de Mer & H\u00e9bergement \u00e0 Cotonou, B\u00e9nin",
  description:
    "D\u00e9couvrez Captain Purunchi, restaurant gastronomique de fruits de mer bord de mer \u00e0 Cotonou. Homard grill\u00e9, gambas royales, poissons bras\u00e9s, cocktails sur le rooftop vue mer et h\u00e9bergement. R\u00e9servez votre table en ligne.",
  openGraph: {
    title: "Captain Purunchi \u2014 Restaurant Fruits de Mer, Rooftop & H\u00e9bergement \u00e0 Cotonou",
    description:
      "Meilleur restaurant fruits de mer \u00e0 Cotonou, B\u00e9nin. Produits frais, cuisine du chef, rooftop vue sur l\u2019Atlantique, chambres confortables. Exp\u00e9rience culinaire unique bord de mer.",
    type: "website",
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
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
                <h2 className="block-title">&Agrave; propos</h2>
                <h3>BIENVENUE CHEZ CAPTAIN PURUNCHI</h3>
                <p>
                  Nich&eacute; au c&oelig;ur de Cotonou, Captain Purunchi est bien plus
                  qu&apos;un simple restaurant. C&apos;est une escale gourmande o&ugrave;
                  les saveurs de la mer rencontrent l&apos;art culinaire, dans un
                  cadre chaleureux et convivial.
                </p>
                <p>
                  Notre cuisine met &agrave; l&apos;honneur les produits frais de la
                  p&ecirc;che locale, avec une sp&eacute;cialit&eacute; pour les fruits de mer
                  et les grillades pr&eacute;par&eacute;s avec passion par notre &eacute;quipe.
                  Poissons bras&eacute;s, homards grill&eacute;s, crevettes flamb&eacute;es
                  &mdash; chaque plat raconte une histoire de fra&icirc;cheur et de saveurs.
                </p>
                <p>
                  Que ce soit pour un d&eacute;jeuner d&apos;affaires, un d&icirc;ner en
                  amoureux ou une soir&eacute;e entre amis sur notre rooftop avec vue,
                  chaque moment chez Captain Purunchi est une exp&eacute;rience
                  inoubliable.
                </p>
                <p>
                  Profitez &eacute;galement de nos espaces d&apos;h&eacute;bergement
                  pour prolonger votre s&eacute;jour et vivre pleinement
                  l&apos;ambiance maritime qui fait notre identit&eacute;.
                </p>
                <div className="book-btn" style={{ marginTop: "25px" }}>
                  <a href="/reservation" className="table-btn hvr-underline-from-center">
                    R&eacute;server une table
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
              Une exp&eacute;rience unique qui fait revenir nos clients encore et encore.
            </p>
          </div>
          <div className="why-us-grid">
            <div className="why-us-card">
              <div className="why-us-icon"><i className="fa fa-anchor" aria-hidden="true"></i></div>
              <h3>Produits frais de la p&ecirc;che</h3>
              <p>Nos poissons et fruits de mer arrivent chaque matin directement du port de Cotonou.</p>
            </div>
            <div className="why-us-card">
              <div className="why-us-icon"><i className="fa fa-eye" aria-hidden="true"></i></div>
              <h3>Vue panoramique</h3>
              <p>Notre rooftop offre une vue imprenable sur Cotonou. L&apos;endroit id&eacute;al pour vos soir&eacute;es.</p>
            </div>
            <div className="why-us-card">
              <div className="why-us-icon"><i className="fa fa-fire" aria-hidden="true"></i></div>
              <h3>Grillades au feu de bois</h3>
              <p>Nos viandes et poissons sont grill&eacute;s au feu de bois pour un go&ucirc;t authentique.</p>
            </div>
            <div className="why-us-card">
              <div className="why-us-icon"><i className="fa fa-glass" aria-hidden="true"></i></div>
              <h3>Cocktails signatures</h3>
              <p>D&eacute;couvrez nos cr&eacute;ations originales avec des fruits frais locaux.</p>
            </div>
            <div className="why-us-card">
              <div className="why-us-icon"><i className="fa fa-bed" aria-hidden="true"></i></div>
              <h3>H&eacute;bergement sur place</h3>
              <p>Prolongez votre exp&eacute;rience avec nos chambres confortables.</p>
            </div>
            <div className="why-us-card">
              <div className="why-us-icon"><i className="fa fa-music" aria-hidden="true"></i></div>
              <h3>Ambiance &amp; &eacute;v&eacute;nements</h3>
              <p>Soir&eacute;es &agrave; th&egrave;me, musique live et DJ sets chaque week-end.</p>
            </div>
          </div>
        </div>
      </div>

      <Gallery images={galleryImages} />
      <Rooms rooms={rooms} whatsapp={contact.whatsapp} />
      <Events events={events} whatsapp={contact.whatsapp} />
      <Blog posts={blogPosts} />
      <Testimonials testimonials={testimonials} />

      {/* Reservation */}
      <div id="reservation" className="reservations-main pad-top-100 pad-bottom-100">
        <div className="container">
          <div className="row">
            <div className="form-reservations-box">
              <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                <div className="wow fadeIn" data-wow-duration="1s" data-wow-delay="0.1s" suppressHydrationWarning>
                  <h2 className="block-title text-center">R&eacute;servation</h2>
                </div>
                <p className="reservation-desc">Remplissez le formulaire et nous vous confirmerons votre r&eacute;servation.</p>
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
