import type { Metadata } from "next";
import { readActiveMenu } from "@/lib/menu-store";
import { readContactInfo } from "@/lib/contact-store";
import MenuPageClient from "./MenuPageClient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Carte & Menu Fruits de Mer \u2014 Restaurant Gastronomique Cotonou",
  description:
    "Carte du Captain Purunchi \u00e0 Cotonou : homard grill\u00e9, gambas, poissons bras\u00e9s, grillades au feu de bois et cocktails. Produits frais. Commandez en ligne.",
  openGraph: {
    title: "Carte & Menu | Captain Purunchi Cotonou",
    description: "Fruits de mer frais, grillades, cocktails et plats du chef. Cuisine gastronomique fran\u00e7aise et africaine \u00e0 Cotonou, B\u00e9nin.",
    url: "/menu",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Captain Purunchi Menu" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Carte & Menu | Captain Purunchi Cotonou",
    description: "Fruits de mer frais, grillades, cocktails et plats du chef \u00e0 Cotonou, B\u00e9nin.",
  },
  keywords: [
    "carte fruits de mer Cotonou", "menu gastronomique Cotonou", "homard grill\u00e9 Cotonou",
    "gambas royales restaurant Cotonou", "cuisine fran\u00e7aise Cotonou", "restaurant poissons frais Cotonou",
    "plats du jour Cotonou", "commander en ligne restaurant Cotonou",
  ],
  alternates: { canonical: "/menu" },
};

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const [categories, contact] = await Promise.all([
    readActiveMenu(),
    readContactInfo(),
  ]);

  const menuJsonLd = {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: "Carte Captain Purunchi",
    description: "Carte et menu du restaurant Captain Purunchi à Cotonou",
    hasMenuSection: categories.map((cat) => ({
      "@type": "MenuSection",
      name: cat.name,
      hasMenuItem: cat.items.map((item) => ({
        "@type": "MenuItem",
        name: item.name,
        description: item.description || undefined,
        ...(item.price && {
          offers: {
            "@type": "Offer",
            price: item.price.replace(/[^\d]/g, ""),
            priceCurrency: "XOF",
          },
        }),
      })),
    })),
  };

  return (
    <div className="menu-page">
      <Breadcrumbs items={[{ name: "Carte & Menu", href: "/menu" }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(menuJsonLd) }}
      />
      <Navbar activePage="menu" />

      {/* Hero Header */}
      <div className="menu-page-header">
        <div className="container">
          <h1>Notre Carte</h1>
          <p>
            Des saveurs authentiques, des produits frais et des recettes
            qui vous transportent au cœur de l{"'"}océan.
          </p>
        </div>
      </div>

      {/* Menu Content */}
      <div className="container">
        <MenuPageClient categories={categories} whatsapp={contact.whatsapp} />
      </div>

      <Footer contact={contact} />
      <WhatsAppFloat whatsapp={contact.whatsapp} />
    </div>
  );
}
