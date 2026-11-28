"use client";

import Link from "next/link";
import { WOOD_TYPES } from "@/lib/constants/categories";
import { useSettingsStore } from "@/store/useSettingsStore";
import { generateWhatsAppUrl, getWhatsAppNumber } from "@/lib/utils";

const FOOTER_LINKS = [
  { label: "Collections", href: "/products" },
  { label: "Custom Studio", href: "/custom-furniture" },
  { label: "AI Room Stylist", href: "/ai-stylist" },
  { label: "Maintenance & Care", href: "/maintenance" },
  { label: "Gallery", href: "/gallery" },
  { label: "About Us", href: "/about" },
  { label: "FAQ", href: "/faq" },
];

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function Footer() {
  const { whatsappNumber, whatsappDisplay } = useSettingsStore();
  const waNum = getWhatsAppNumber(whatsappNumber);
  const waDisplay = whatsappDisplay || "+91 85470 97173";

  return (
    <footer style={{ backgroundColor: "#231F1E" }} className="text-white/70">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="mb-5">
              <p className="font-display text-2xl font-semibold text-white leading-none">
                Square Cube Furniture
              </p>
              <p className="text-[9px] tracking-[0.28em] uppercase text-champagne font-ui mt-2">
                Luxury Custom Furniture Studio
              </p>
            </div>
            <p className="text-sm text-white/55 leading-relaxed mb-6 font-ui">
              Ultra-luxury handcrafted architectural furniture built to your exact proportions.
              Nilambur Teak, Mahogany, Rosewood and Marine Ply veneers.
            </p>
            <a
              href={generateWhatsAppUrl(
                waNum,
                "Hello Square Cube Furniture! I'd like to enquire about your furniture."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white text-sm font-ui font-medium px-4 py-2.5 transition-colors bg-[#25D366] hover:bg-[#1ebe5d]"
              suppressHydrationWarning
            >
              <WhatsAppIcon className="w-4 h-4" />
              {waDisplay}
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="section-label text-champagne mb-5">Navigate</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-ui text-white/55 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Wood Types */}
          <div>
            <h3 className="section-label text-champagne mb-5">Signature Woods</h3>
            <div className="flex flex-wrap gap-2 mb-8">
              {WOOD_TYPES.map((wood) => (
                <Link
                  key={wood}
                  href={`/products?woodType=${encodeURIComponent(wood)}`}
                  className="text-xs font-ui text-white/55 border border-white/15 px-2.5 py-1 hover:border-champagne hover:text-champagne transition-colors"
                >
                  {wood}
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="section-label text-champagne mb-5">Studio Services</h3>
            <ul className="space-y-2.5">
              {[
                { label: "Custom Studio & Estimator", href: "/custom-furniture" },
                { label: "AI Room Stylist", href: "/ai-stylist" },
                { label: "Wood Polishing & PU", href: "/maintenance" },
                { label: "Sofa Re-upholstery", href: "/maintenance" },
                { label: "Termite Treatment", href: "/maintenance" },
                { label: "Dismantling & Shifting", href: "/maintenance" },
              ].map((s) => (
                <li key={s.label}>
                  <Link
                    href={s.href}
                    className="text-sm font-ui text-white/55 hover:text-white transition-colors"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs font-ui text-white/35">
            © {new Date().getFullYear()} Square Cube Furniture. All rights reserved.
          </p>
          <p className="text-xs font-ui text-white/30">
            Handcrafted in Kerala, India · Architectural Quality Guaranteed
          </p>
        </div>
      </div>
    </footer>
  );
}
