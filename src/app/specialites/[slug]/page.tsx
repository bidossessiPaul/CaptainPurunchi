import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { readSpecialtyBySlug, readSpecialtyById, readActiveSpecialties } from "@/lib/specialty-store";
import { readContactInfo } from "@/lib/contact-store";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { SpecialtyArticle, SpecialtyStickyCard } from "./SpecialtyContent";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.SITE_URL || "https://captainpurunchi.com";

async function getSpecialty(slug: string) {
  const bySlug = await readSpecialtyBySlug(slug);
  if (bySlug) return { specialty: bySlug, isUuid: false };
  const byId = await readSpecialtyById(slug);
  if (byId) return { specialty: byId, isUuid: true };
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getSpecialty(slug);
  if (!result) return { title: "Spécialité introuvable" };
  const { specialty } = result;

  const url = `/specialites/${specialty.slug}`;

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

export default async function SpecialtyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getSpecialty(slug);

  if (!result) notFound();
  const { specialty, isUuid } = result!;

  if (!specialty.active) notFound();

  // Redirect anciens liens UUID → URL canonique avec slug
  if (isUuid) {
    redirect(`/specialites/${specialty.slug}`);
  }

  const [allSpecialties, contact] = await Promise.all([
    readActiveSpecialties(),
    readContactInfo(),
  ]);

  const others = allSpecialties.filter((s) => s.slug !== specialty.slug).slice(0, 3);

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
      {/* JSON-LD — données serveur uniquement */}
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: jsonLd }} />
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

      {/* Contenu — article + sidebar */}
      <section className="specialty-detail-body">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <SpecialtyArticle details={specialty.details} description={specialty.description} />
            </div>
            <div className="col-lg-4">
              <SpecialtyStickyCard
                title={specialty.title}
                description={specialty.description}
                src={specialty.src || ""}
                id={specialty.id}
              />
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
