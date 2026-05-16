import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { readSpecialtyById, readActiveSpecialties } from "@/lib/specialty-store";
import { readContactInfo } from "@/lib/contact-store";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.SITE_URL || "https://captainpurunchi.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const specialty = await readSpecialtyById(id);
  if (!specialty) return { title: "Spécialité introuvable" };

  const url = `/specialites/${specialty.id}`;

  return {
    title: `${specialty.title} — Spécialité Captain Purunchi Cotonou`,
    description: specialty.description,
    openGraph: {
      title: `${specialty.title} — Restaurant Fruits de Mer Cotonou`,
      description: specialty.description,
      url,
      type: "article",
      ...(specialty.src && { images: [{ url: specialty.src, alt: specialty.title }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: `${specialty.title} — Captain Purunchi`,
      description: specialty.description,
      ...(specialty.src && { images: [specialty.src] }),
    },
    alternates: { canonical: `${BASE_URL}${url}` },
  };
}

function renderDetails(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("## ")) return <h2 key={i} className="specialty-detail-h2">{line.slice(3)}</h2>;
    if (line.startsWith("### ")) return <h3 key={i} className="specialty-detail-h3">{line.slice(4)}</h3>;
    if (line.startsWith("- ")) return <li key={i} className="specialty-detail-li">{line.slice(2)}</li>;
    if (line.startsWith("*") && line.endsWith("*") && !line.startsWith("**")) return <p key={i} className="specialty-detail-italic">{line.slice(1, -1)}</p>;
    if (line.trim() === "") return <br key={i} />;
    return <p key={i} className="specialty-detail-p">{line}</p>;
  });
}

export default async function SpecialtyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [specialty, allSpecialties, contact] = await Promise.all([
    readSpecialtyById(id),
    readActiveSpecialties(),
    readContactInfo(),
  ]);

  if (!specialty || !specialty.active) notFound();

  const others = allSpecialties.filter((s) => s.id !== specialty.id).slice(0, 3);

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "MenuItem",
    name: specialty.title,
    description: specialty.description,
    image: specialty.src || undefined,
    offers: { "@type": "Offer", availability: "https://schema.org/InStock", priceCurrency: "XOF" },
    menuAddOn: {
      "@type": "Restaurant",
      name: "Captain Purunchi",
      address: { "@type": "PostalAddress", addressLocality: "Cotonou", addressCountry: "BJ" },
    },
  });

  return (
    <>
      {/* JSON-LD schema — server-controlled data only, no user input */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <Navbar />
      <WhatsAppFloat whatsapp={contact?.whatsapp} />

      {/* Hero */}
      <div
        className="specialty-detail-hero"
        style={{ backgroundImage: specialty.src ? `url(${specialty.src})` : "none" }}
      >
        <div className="specialty-detail-hero-overlay" />
        <div className="container specialty-detail-hero-content">
          <nav aria-label="breadcrumb" className="mb-3">
            <ol className="breadcrumb specialty-breadcrumb">
              <li className="breadcrumb-item"><Link href="/">Accueil</Link></li>
              <li className="breadcrumb-item"><Link href="/#specialties">Nos Spécialités</Link></li>
              <li className="breadcrumb-item active">{specialty.title}</li>
            </ol>
          </nav>
          <h1 className="specialty-detail-title">{specialty.title}</h1>
          <p className="specialty-detail-subtitle">{specialty.description}</p>
        </div>
      </div>

      {/* Contenu */}
      <section className="specialty-detail-body">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="specialty-detail-cta">
                <p>Envie de goûter ce plat ?</p>
                <Link href="/reservation" className="btn btn-primary me-2">Réserver une table</Link>
                <Link href="/#menu" className="btn btn-outline-primary">Voir le menu complet</Link>
              </div>

              <div className="specialty-detail-content">
                {specialty.details ? (
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {renderDetails(specialty.details)}
                  </ul>
                ) : (
                  <p className="specialty-detail-p">{specialty.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Autres spécialités */}
      {others.length > 0 && (
        <section className="specialty-detail-others">
          <div className="container">
            <h2 className="specialty-detail-others-title">Découvrez aussi</h2>
            <div className="row">
              {others.map((s) => (
                <div key={s.id} className="col-md-4 mb-4">
                  <Link href={`/specialites/${s.id}`} className="specialty-other-card">
                    <div className="specialty-other-img" style={{ backgroundImage: s.src ? `url(${s.src})` : "none" }} />
                    <div className="specialty-other-body">
                      <h6>{s.title}</h6>
                      <p>{s.description}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer contact={contact} />
    </>
  );
}
