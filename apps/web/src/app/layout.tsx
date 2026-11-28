import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Square Cube Furniture",
    default: "Square Cube Furniture — Ultra-Luxury Custom Furniture",
  },
  description:
    "Square Cube Furniture: Ultra-luxury handcrafted custom furniture, AI room styling, and furniture maintenance services. Kerala Teak, Mahogany, Rosewood and more.",
  keywords: [
    "custom furniture",
    "luxury furniture India",
    "teak furniture",
    "handcrafted furniture",
    "Square Cube Furniture",
    "furniture maintenance",
    "AI room stylist",
  ],
  openGraph: {
    siteName: "Square Cube Furniture",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jakarta.variable}`}>
      <body>
        <Navbar />
        <main className="min-h-screen" style={{ backgroundColor: "#F8F5F0" }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
