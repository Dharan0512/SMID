import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = "https://sminterior.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Sree Mahalakshmi Interior Decorators — SMID | Bespoke Interiors, Chennai",
    template: "%s | SMID Chennai",
  },
  description:
    "SMID — Sree Mahalakshmi Interior Decorators. Award-quality modular kitchens, wardrobes and bespoke woodwork crafted in Vadapalani, Chennai. 5.0★ on Google.",
  applicationName: "SMID",
  keywords: [
    "interior design Chennai",
    "modular kitchen Chennai",
    "wardrobe design",
    "interior decorators Vadapalani",
    "SMID",
    "Sree Mahalakshmi Interior Decorators",
    "bespoke woodwork Chennai",
  ],
  authors: [{ name: "Sree Mahalakshmi Interior Decorators" }],
  creator: "SMID",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Sree Mahalakshmi Interior Decorators (SMID)",
    title: "SMID — Crafted Interiors for Life | Chennai",
    description:
      "Bespoke modular kitchens, wardrobes and fine woodwork, built with obsessive craft in Vadapalani, Chennai.",
    images: [
      {
        url: "/media/smidworkimage1.webp",
        width: 960,
        height: 1280,
        alt: "Bespoke lavender modular kitchen by SMID",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SMID — Crafted Interiors for Life | Chennai",
    description:
      "Bespoke modular kitchens, wardrobes and fine woodwork in Vadapalani, Chennai.",
    images: ["/media/smidworkimage1.webp"],
  },
  category: "Interior Design",
};

// Rich result eligibility: LocalBusiness with address, geo, hours & rating.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  name: "Sree Mahalakshmi Interior Decorators",
  alternateName: "SMID",
  url: SITE_URL,
  image: `${SITE_URL}/media/smidworkimage1.webp`,
  telephone: "+91-70924-45892",
  priceRange: "₹₹",
  address: {
    "@type": "PostalAddress",
    streetAddress: "No. 7/2, North, 2nd St, Vadapalani",
    addressLocality: "Chennai",
    addressRegion: "Tamil Nadu",
    postalCode: "600026",
    addressCountry: "IN",
  },
  areaServed: "Chennai",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "09:00",
      closes: "19:00",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5.0",
    reviewCount: "8",
    bestRating: "5",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
