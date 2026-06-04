import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { readRoomBySlug, readRoomById, readActiveRooms } from "@/lib/room-store";
import { readContactInfo } from "@/lib/contact-store";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Breadcrumbs from "@/components/Breadcrumbs";
import RoomGallery from "./RoomGallery";
import RoomBookingForm from "./RoomBookingForm";

export const dynamic = "force-dynamic";

async function getRoom(slug: string) {
  // Try slug first
  const bySlug = await readRoomBySlug(slug);
  if (bySlug) return bySlug;
  // UUID fallback → redirect to canonical slug URL
  const byId = await readRoomById(slug);
  if (byId) redirect(`/chambres/${byId.slug}`);
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const room = await getRoom(slug);
  if (!room) return { title: "Chambre introuvable" };
  return {
    title: `${room.name} — Captain Purunchi`,
    description: room.shortDesc || `${room.name} à Captain Purunchi, Cotonou. ${room.price}. Réservez en ligne.`,
    openGraph: {
      title: `${room.name} | Captain Purunchi`,
      description: room.shortDesc,
      url: `/chambres/${room.slug}`,
      images: room.thumb ? [{ url: room.thumb, width: 1200, height: 630, alt: room.name }] : [],
    },
    alternates: { canonical: `/chambres/${room.slug}` },
  };
}

const SPEC_ICONS: Record<string, string> = {
  size: "fa-expand",
  bedType: "fa-bed",
  view: "fa-eye",
  capacity: "fa-users",
};

export default async function RoomDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [room, contact, allRooms] = await Promise.all([
    getRoom(slug),
    readContactInfo(),
    readActiveRooms(),
  ]);

  if (!room) notFound();

  const otherRooms = allRooms.filter(r => r.id !== room.id).slice(0, 3);

  const specs: { icon: string; label: string; value: string }[] = [
    room.capacity && { icon: SPEC_ICONS.capacity, label: "Capacité", value: room.capacity },
    room.size && { icon: SPEC_ICONS.size, label: "Superficie", value: room.size },
    room.bedType && { icon: SPEC_ICONS.bedType, label: "Type de lit", value: room.bedType },
    room.view && { icon: SPEC_ICONS.view, label: "Vue", value: room.view },
  ].filter(Boolean) as { icon: string; label: string; value: string }[];

  const displayImages = room.gallery.length > 0 ? room.gallery : (room.thumb ? [room.thumb] : []);

  return (
    <div className="rd-page">
      <Breadcrumbs items={[
        { name: "Chambres", href: "/chambres" },
        { name: room.name, href: `/chambres/${room.slug}` },
      ]} />
      <Navbar activePage="chambres" />

      {/* Hero */}
      <div
        className="rd-hero"
        style={{ backgroundImage: room.thumb ? `url(${room.thumb})` : undefined }}
      >
        <div className="rd-hero-overlay" />
        <div className="container rd-hero-content">
          <div className="rd-hero-badge">{room.price}</div>
          <h1 className="rd-hero-title">{room.name}</h1>
          {room.shortDesc && <p className="rd-hero-sub">{room.shortDesc}</p>}
        </div>
      </div>

      {/* Main content */}
      <section className="rd-body">
        <div className="container">
          <div className="row">
            {/* Article col */}
            <div className="col-lg-8">
              {/* Gallery */}
              {displayImages.length > 0 && (
                <div className="rd-section">
                  <RoomGallery images={displayImages} name={room.name} />
                </div>
              )}

              {/* Specs */}
              {specs.length > 0 && (
                <div className="rd-section">
                  <h2 className="rd-section-title">Caractéristiques</h2>
                  <div className="rd-specs">
                    {specs.map((s, i) => (
                      <div key={i} className="rd-spec-item">
                        <div className="rd-spec-icon"><i className={`fa ${s.icon}`} aria-hidden="true"></i></div>
                        <div className="rd-spec-body">
                          <span className="rd-spec-label">{s.label}</span>
                          <span className="rd-spec-value">{s.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {room.description && (
                <div className="rd-section">
                  <h2 className="rd-section-title">Description</h2>
                  <p className="rd-desc">{room.description}</p>
                </div>
              )}

              {/* Features */}
              {room.features.length > 0 && (
                <div className="rd-section">
                  <h2 className="rd-section-title">Équipements &amp; services</h2>
                  <ul className="rd-features">
                    {room.features.map((f, i) => (
                      <li key={i}>
                        <i className="fa fa-check" aria-hidden="true"></i>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sticky booking col */}
            <div className="col-lg-4">
              <div className="rd-sticky-wrap">
                <div className="rd-book-card">
                  <div className="rd-book-card-header">
                    <span className="rd-book-price">{room.price}</span>
                    <span className="rd-book-per">par nuit</span>
                  </div>
                  <h3 className="rd-book-title">Réserver cette chambre</h3>
                  <RoomBookingForm roomId={room.id} roomName={room.name} whatsapp={contact.whatsapp} />
                  {contact.whatsapp && (
                    <a
                      href={`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(`Bonjour, je souhaite avoir des informations sur la chambre "${room.name}".`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rd-book-wa"
                    >
                      <i className="fa fa-whatsapp"></i> Réserver par WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Other rooms */}
      {otherRooms.length > 0 && (
        <section className="rd-other-rooms">
          <div className="container">
            <h2 className="rd-other-title">Découvrez aussi</h2>
            <div className="row">
              {otherRooms.map(r => (
                <div key={r.id} className="col-md-4">
                  <Link href={`/chambres/${r.slug}`} className="rd-other-card">
                    <div
                      className="rd-other-img"
                      style={{ backgroundImage: r.thumb ? `url(${r.thumb})` : undefined }}
                    />
                    <div className="rd-other-body">
                      <h3 className="rd-other-name">{r.name}</h3>
                      <span className="rd-other-price">{r.price}</span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer contact={contact} />
      <WhatsAppFloat whatsapp={contact.whatsapp} />
    </div>
  );
}
