"use client";

import Link from "next/link";
import { WOOD_TYPES } from "@/lib/constants/categories";
import { useSettingsStore } from "@/store/useSettingsStore";

const FOOTER_CATEGORIES = [
  { name: "Living Room",    href: "/categories/living-room" },
  { name: "Bedroom",        href: "/categories/bedroom" },
  { name: "Dining Room",    href: "/categories/dining-room" },
  { name: "Office",         href: "/categories/office" },
  { name: "Wardrobes",      href: "/categories/wardrobes" },
  { name: "Sofas",          href: "/categories/sofas" },
  { name: "Beds",           href: "/categories/beds" },
  { name: "Custom Furniture", href: "/customize" },
];

const QUICK_LINKS = [
  { name: "About Us",       href: "/about" },
  { name: "Custom Furniture", href: "/customize" },
  { name: "Gallery",        href: "/gallery" },
  { name: "FAQ",            href: "/faq" },
  { name: "Track Order",    href: "/account/orders" },
  { name: "Contact Us",     href: "/contact" },
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms",          href: "/terms" },
];

const PROMISES = [
  "✦ Handcrafted in India",
  "✦ Premium Quality Wood",
  "✦ Custom Dimensions",
  "✦ WhatsApp-First Support",
  "✦ Satisfaction Guaranteed",
];

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function Footer() {
  const { whatsappNumber, whatsappDisplay, businessName, businessTagline } = useSettingsStore();

  return (
    <footer className="bg-stone-900 text-stone-300">
      {/* Main grid */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <div className="mb-5">
              <p className="font-display text-2xl font-semibold text-white">{businessName}</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-gold-400 mt-0.5">{businessTagline}</p>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed mb-6">
              Premium custom furniture crafted with the finest Indian wood.
              Every piece is built to your exact specifications.
            </p>
            <Link
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-medium px-4 py-2.5 transition-colors"
              suppressHydrationWarning
            >
              <WhatsAppIcon className="w-4 h-4" />
              {whatsappDisplay}
            </Link>
          </div>

          {/* Categories */}
          <div>
            <h3 className="section-label text-gold-400 mb-5">Categories</h3>
            <ul className="space-y-2.5">
              {FOOTER_CATEGORIES.map((cat) => (
                <li key={cat.href}>
                  <Link href={cat.href} className="text-sm text-stone-400 hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="section-label text-gold-400 mb-5">Quick Links</h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-stone-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Wood Types + Promise */}
          <div>
            <h3 className="section-label text-gold-400 mb-5">Wood Types</h3>
            <div className="flex flex-wrap gap-2 mb-8">
              {WOOD_TYPES.map((wood) => (
                <Link
                  key={wood}
                  href={`/products?woodType=${wood}`}
                  className="text-xs text-stone-400 border border-stone-700 px-2.5 py-1 hover:border-gold-600 hover:text-gold-400 transition-colors"
                >
                  {wood}
                </Link>
              ))}
            </div>

            <h3 className="section-label text-gold-400 mb-4">Our Promise</h3>
            <ul className="space-y-2">
              {PROMISES.map((p) => (
                <li key={p} className="text-xs text-stone-500">{p}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-stone-800">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-stone-500">
            © {new Date().getFullYear()} Square Cube. All rights reserved.
          </p>
          <p className="text-xs text-stone-600">
            Made with care in India 🇮🇳
          </p>
        </div>
      </div>
    </footer>
  );
}
