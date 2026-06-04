import type { Metadata } from "next";
import Link from "next/link";
import { readActiveSpecialties } from "@/lib/specialty-store";
import { readContactInfo } from "@/lib/contact-store";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.SITE_URL || "https://captainpurunchi.com";

export const metadata: Metadata = {
  title: "Nos Spécialités — Captain Purunchi Cotonou",
  description: "Découvrez toutes les spécialités du restaurant Captain Purunchi à Cotonou : homard grillé, gambas royales, langouste, crevettes, pieuvre et poissons frais du jour.",
  alternates: { canonical: `${BASE_URL}/specialites` },
  openGraph: {
    title: "Nos Spécialités — Restaurant Captain Purunchi Cotonou",
    description: "Fruits de mer frais, grillades et spécialités du chef — Captain Purunchi, Cotonou Bénin.",
    url: `${BASE_URL}/specialites`,
    type: "website",
  },
};

export default async function SpecialitesPage() {
  const [specialties, contact] = await Promise.all([
    readActiveSpecialties(),
    readContactInfo(),
  ]);

  return (
    <>
      <Navbar />
      <WhatsAppFloat whatsapp={contact?.whatsapp} />

      {/* Hero */}
      <div className="specialites-list-hero">
        <div className="specialites-list-hero-overlay" />
        <div className="container specialites-list-hero-content">
          <nav aria-label="breadcrumb" className="mb-3">
            <ol className="breadcrumb specialty-breadcrumb">
              <li className="breadcrumb-item"><Link href="/">Accueil</Link></li>
              <li className="breadcrumb-item active">Nos Spécialités</li>
            </ol>
          </nav>
          <h1 className="specialites-list-title">Nos Spécialités</h1>
          <p className="specialites-list-subtitle">
            {specialties.length} plats signatures préparés chaque jour avec des produits frais de la pêche locale
          </p>
        </div>
      </div>

      {/* Grille */}
      <section className="specialites-list-body">
        <div className="container">
          <div className="row">
            {specialties.map((s) => (
              <div key={s.id} className="col-md-6 col-lg-4 mb-4">
                <Link href={`/specialites/${s.slug}`} className="specialites-list-card">
                  <div
                    className="specialites-list-card-img"
                    style={{ backgroundImage: s.src ? `url(${s.src})` : "none" }}
                  />
                  <div className="specialites-list-card-body">
                    <h2 className="specialites-list-card-title">{s.title}</h2>
                    <p className="specialites-list-card-desc">{s.description}</p>
                    <span className="specialites-list-card-link">Voir le détail →</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-5 mb-4">
            <Link href="/reservation" className="btn-site me-3">
              Réserver une table
            </Link>
            <Link href="/menu" className="btn-site">
              Voir le menu complet
            </Link>
          </div>
        </div>
      </section>

      <Footer contact={contact} />
    </>
  );
}
