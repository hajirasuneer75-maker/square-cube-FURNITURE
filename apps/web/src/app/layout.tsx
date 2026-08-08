import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Square Cube",
    default: "Square Cube — Premium Custom Furniture",
  },
  description:
    "Premium handcrafted custom furniture built to your exact specifications. Teak, Sheesham, Oak and more. WhatsApp-first consultation.",
  keywords: [
    "custom furniture",
    "teak furniture",
    "bespoke furniture",
    "handcrafted furniture",
    "Square Cube",
  ],
  openGraph: {
    siteName: "Square Cube",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <Navbar />
        <main className="min-h-screen bg-stone-50">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
