import type { Metadata, Viewport } from "next";
import Script from "next/script";
import PageProgress from "@/components/PageProgress";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import "./globals.css";

const BASE_URL = process.env.SITE_URL || "https://captainpurunchi.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Captain Purunchi — Restaurant Fruits de Mer \u00e0 Cotonou",
    template: "%s | Captain Purunchi Cotonou",
  },
  description:
    "Captain Purunchi : restaurant fruits de mer, bar rooftop et h\u00e9bergement \u00e0 Cotonou, B\u00e9nin. Produits frais, cuisine du chef. R\u00e9servez en ligne.",
  keywords: [
    "Captain Purunchi", "Captain Purunchi Cotonou", "restaurant Cotonou",
    "restaurant fruits de mer Cotonou", "restaurant bord de mer Cotonou",
    "h\u00f4tel restaurant Cotonou", "complexe gastronomique B\u00e9nin",
    "rooftop Cotonou", "bar vue mer Cotonou", "h\u00e9bergement Cotonou",
    "seafood restaurant Cotonou Benin", "beachfront restaurant Benin",
    "best restaurant Cotonou", "where to eat in Cotonou",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Captain Purunchi",
  },
  openGraph: {
    siteName: "Captain Purunchi",
    locale: "fr_FR",
    type: "website",
    url: BASE_URL,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Captain Purunchi Cotonou" }],
  },
  twitter: {
    card: "summary_large_image",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Captain Purunchi Cotonou" }],
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

export const viewport: Viewport = {
  themeColor: "#c8a97e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Schema.org JSON-LD for the entire site
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Restaurant", "FoodEstablishment"],
      "@id": `${BASE_URL}/#restaurant`,
      name: "Captain Purunchi",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.png`,
        width: 200,
        height: 200,
      },
      image: `${BASE_URL}/og-image.jpg`,
      description: "Restaurant gastronomique de fruits de mer, bar rooftop et h\u00e9bergement bord de mer \u00e0 Cotonou, B\u00e9nin. Cuisine fran\u00e7aise et africaine, produits frais du jour.",
      servesCuisine: ["Fran\u00e7aise", "Fruits de mer", "Africaine", "Grillades", "B\u00e9ninoise"],
      priceRange: "$$",
      telephone: "+22901912770 70",
      email: "contact@captainpurunchi.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "O6bp 2556 pk 3, Fidjross\u00e8",
        addressLocality: "Cotonou",
        addressRegion: "Littoral",
        addressCountry: "BJ",
        postalCode: "01 BP 2556",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 6.3654,
        longitude: 2.3924,
      },
      hasMap: "https://www.google.com/maps/dir/?api=1&destination=6.3654,2.3924",
      hasMenu: `${BASE_URL}/menu`,
      acceptsReservations: true,
      currenciesAccepted: "XOF",
      paymentAccepted: "Cash, Mobile Money",
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: "Monday",
          opens: "09:00",
          closes: "22:00",
        },
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          opens: "09:00",
          closes: "23:00",
        },
      ],
      sameAs: [
        "https://www.facebook.com/61558389656062",
        "https://www.instagram.com/captainpurunchi",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+22901912770 70",
        contactType: "reservations",
        availableLanguage: ["French"],
      },
    },
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "Captain Purunchi",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.png`,
        width: 200,
        height: 200,
      },
      description: "Restaurant fruits de mer, bar rooftop et h\u00e9bergement \u00e0 Cotonou, B\u00e9nin.",
      telephone: "+22901912770 70",
      email: "contact@captainpurunchi.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "O6bp 2556 pk 3, Fidjross\u00e8",
        addressLocality: "Cotonou",
        addressCountry: "BJ",
      },
      sameAs: [
        "https://www.facebook.com/61558389656062",
        "https://www.instagram.com/captainpurunchi",
        "https://wa.me/22901912770 70",
      ],
    },
    {
      "@type": "LodgingBusiness",
      "@id": `${BASE_URL}/#lodging`,
      name: "Captain Purunchi \u2014 H\u00e9bergement",
      url: `${BASE_URL}/chambres`,
      telephone: "+22901912770 70",
      description: "Chambres et suites vue mer \u00e0 Cotonou. Climatisation, Wi-Fi, petit-d\u00e9jeuner inclus, acc\u00e8s restaurant et rooftop Captain Purunchi.",
      address: {
        "@type": "PostalAddress",
        streetAddress: "O6bp 2556 pk 3, Fidjross\u00e8",
        addressLocality: "Cotonou",
        addressCountry: "BJ",
      },
      priceRange: "$$",
      checkinTime: "12:00",
      checkoutTime: "11:00",
      amenityFeature: [
        { "@type": "LocationFeatureSpecification", name: "Wi-Fi gratuit", value: true },
        { "@type": "LocationFeatureSpecification", name: "Climatisation", value: true },
        { "@type": "LocationFeatureSpecification", name: "Parking gratuit", value: true },
        { "@type": "LocationFeatureSpecification", name: "Restaurant sur place", value: true },
        { "@type": "LocationFeatureSpecification", name: "Rooftop", value: true },
        { "@type": "LocationFeatureSpecification", name: "Petit-d\u00e9jeuner", value: true },
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      name: "Captain Purunchi",
      url: BASE_URL,
      inLanguage: "fr-FR",
      potentialAction: {
        "@type": "ReserveAction",
        target: `${BASE_URL}/reservation`,
        name: "R\u00e9server une table",
      },
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
        <ServiceWorkerRegister />
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
