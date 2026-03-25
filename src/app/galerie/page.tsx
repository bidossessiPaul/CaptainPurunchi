import type { Metadata } from "next";
import { readActiveGalleryImages } from "@/lib/gallery-store";
import { readContactInfo } from "@/lib/contact-store";
import GalerieClient from "./GalerieClient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Galerie Photos \u2014 Restaurant, Rooftop & Chambres",
  description:
    "Parcourez les photos du Captain Purunchi \u00e0 Cotonou : plats de fruits de mer, ambiance rooftop vue mer, chambres confortables, soir\u00e9es \u00e0 th\u00e8me et \u00e9v\u00e9nements au B\u00e9nin.",
  openGraph: {
    title: "Galerie Photos | Captain Purunchi Cotonou",
    description: "D\u00e9couvrez en images l\u2019exp\u00e9rience Captain Purunchi : fruits de mer, rooftop, chambres et ambiance \u00e0 Cotonou.",
    url: "/galerie",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Galerie Captain Purunchi" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Galerie Photos | Captain Purunchi Cotonou",
    description: "Photos du Captain Purunchi \u00e0 Cotonou : plats, rooftop, chambres et \u00e9v\u00e9nements.",
  },
  keywords: [
    "galerie photos Captain Purunchi", "photos restaurant Cotonou",
    "images fruits de mer Cotonou", "photos rooftop Cotonou",
    "galerie restaurant B\u00e9nin", "Captain Purunchi photos",
  ],
  alternates: { canonical: "/galerie" },
};

export const dynamic = "force-dynamic";

export default async function GaleriePage() {
  const [images, contact] = await Promise.all([
    readActiveGalleryImages(),
    readContactInfo(),
  ]);

  return (
    <div className="galerie-page">
      <Breadcrumbs items={[{ name: "Galerie Photos", href: "/galerie" }]} />
      <Navbar activePage="galerie" />

      <div className="galerie-page-header">
        <div className="container">
          <h1>Notre Galerie</h1>
          <p>{images.length} photos</p>
        </div>
      </div>

      <GalerieClient images={images} />

      <Footer contact={contact} />
      <WhatsAppFloat whatsapp={contact.whatsapp} />
    </div>
  );
}
