import type { Metadata } from "next";
import Script from "next/script";
import PageProgress from "@/components/PageProgress";
import "./globals.css";

const BASE_URL = process.env.SITE_URL || "https://captainpurunchi.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Captain Purunchi — Restaurant Fruits de Mer, Bar & H\u00e9bergement \u00e0 Cotonou, B\u00e9nin",
    template: "%s | Captain Purunchi Cotonou",
  },
  description:
    "Captain Purunchi : restaurant gastronomique de fruits de mer, bar rooftop vue mer et h\u00e9bergement \u00e0 Cotonou, B\u00e9nin. Produits frais, cuisine du chef, exp\u00e9rience unique bord de mer. R\u00e9servez en ligne.",
  keywords: [
    "Captain Purunchi", "Captain Purunchi Cotonou", "restaurant Cotonou",
    "restaurant fruits de mer Cotonou", "restaurant bord de mer Cotonou",
    "h\u00f4tel restaurant Cotonou", "complexe gastronomique B\u00e9nin",
    "rooftop Cotonou", "bar vue mer Cotonou", "h\u00e9bergement Cotonou",
    "seafood restaurant Cotonou Benin", "beachfront restaurant Benin",
    "best restaurant Cotonou", "where to eat in Cotonou",
  ],
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    siteName: "Captain Purunchi",
    locale: "fr_FR",
    type: "website",
    url: BASE_URL,
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Captain Purunchi Cotonou" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Captain Purunchi \u2014 Restaurant & H\u00e9bergement \u00e0 Cotonou",
    description: "Fruits de mer frais, rooftop vue mer et chambres confortables \u00e0 Cotonou, B\u00e9nin.",
  },
  alternates: {
    canonical: BASE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
};

// Schema.org JSON-LD for the entire site
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Restaurant",
      "@id": `${BASE_URL}/#restaurant`,
      name: "Captain Purunchi",
      url: BASE_URL,
      logo: `${BASE_URL}/logo.png`,
      image: `${BASE_URL}/logo.png`,
      description: "Restaurant gastronomique de fruits de mer, bar rooftop et h\u00e9bergement bord de mer \u00e0 Cotonou, B\u00e9nin. Cuisine fran\u00e7aise et africaine, produits frais du jour.",
      servesCuisine: ["Fran\u00e7aise", "Fruits de mer", "Africaine", "Grillades"],
      priceRange: "$$",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Fidjross\u00e8, Cotonou",
        addressLocality: "Cotonou",
        addressCountry: "BJ",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 6.3654,
        longitude: 2.3924,
      },
      hasMenu: `${BASE_URL}/menu`,
      acceptsReservations: true,
      openingHoursSpecification: [
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "11:00", closes: "23:00" },
      ],
      sameAs: [],
    },
    {
      "@type": "LodgingBusiness",
      "@id": `${BASE_URL}/#lodging`,
      name: "Captain Purunchi - H\u00e9bergement",
      url: `${BASE_URL}/chambres`,
      description: "Appartements et chambres meubl\u00e9es vue mer \u00e0 Cotonou. Climatisation, Wi-Fi, cuisine \u00e9quip\u00e9e, acc\u00e8s restaurant et rooftop.",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Fidjross\u00e8, Cotonou",
        addressLocality: "Cotonou",
        addressCountry: "BJ",
      },
      priceRange: "$$",
      amenityFeature: [
        { "@type": "LocationFeatureSpecification", name: "Wi-Fi", value: true },
        { "@type": "LocationFeatureSpecification", name: "Climatisation", value: true },
        { "@type": "LocationFeatureSpecification", name: "Parking", value: true },
        { "@type": "LocationFeatureSpecification", name: "Restaurant", value: true },
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      name: "Captain Purunchi",
      url: BASE_URL,
      inLanguage: "fr-FR",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="stylesheet" href="/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/css/style.css" />
        <link rel="stylesheet" href="/css/responsive.css" />
        <link
          id="changeable-colors"
          rel="stylesheet"
          href="/css/colors/strong-blue.css"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <PageProgress />
        {children}

        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/moment.min.js"
          strategy="beforeInteractive"
          id="moment-js"
        />
        <Script
          src="/js/all.js"
          strategy="beforeInteractive"
          id="all-js"
        />
        <Script
          src="/js/bootstrap.min.js"
          strategy="afterInteractive"
          id="bootstrap-js"
        />
        <Script src="/js/custom.js" strategy="afterInteractive" id="custom-js" />
      </body>
    </html>
  );
}
