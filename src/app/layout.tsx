import type { Metadata } from "next";
import { Great_Vibes, Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const siteUrl =
  process.env.SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-great-vibes",
});

const cormorant = Cormorant_Garamond({
  weight: ["300", "400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-cormorant",
});

const dmSans = DM_Sans({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const siteTitle = "Kaia & Richard — July 10, 2027";
const shareTitle = "Kaia & Richard";
const shareDescription =
  "Saturday, July 10, 2027 · The Vasak Estate, Bellingham, WA";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: shareDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: shareTitle,
    description: shareDescription,
    url: "/",
    type: "website",
    locale: "en_US",
    siteName: "Kaia & Richard",
  },
  twitter: {
    card: "summary_large_image",
    title: shareTitle,
    description: shareDescription,
  },
  appleWebApp: {
    title: shareTitle,
  },
  icons: {
    apple: "/apple-icon",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${greatVibes.variable} ${cormorant.variable} ${dmSans.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
