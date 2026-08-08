"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, User, Search, Menu, X, ChevronDown } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useUserStore } from "@/store/useUserStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { NAVIGATION_CATEGORIES } from "@/lib/constants/categories";
import { cn } from "@/lib/utils";
import MobileMenu from "./MobileMenu";

// Reusable WhatsApp SVG
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const shopRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const wishlistCount = useWishlistStore((s) => s.items.length);
  const user          = useUserStore((s) => s.user);
  const { whatsappNumber, announcementText, announcementEnabled } = useSettingsStore();

  // Only show announcement if enabled in settings (once dismissed, stays hidden for session)
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  useEffect(() => { setShowAnnouncement(announcementEnabled); }, [announcementEnabled]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (shopRef.current && !shopRef.current.contains(e.target as Node)) {
        setIsShopOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    setIsSearchOpen(false);
    setSearchQuery("");
  }

  return (
    <>
      {/* ── Announcement Bar ──────────────────────────────────────── */}
      {showAnnouncement && (
        <div className="bg-stone-900 text-white text-xs py-2 px-4 text-center relative">
          <span className="tracking-wide">{announcementText}</span>
          <button
            onClick={() => setShowAnnouncement(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
            aria-label="Dismiss"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* ── Main Header ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-stone-100 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Hamburger (mobile) */}
            <button
              className="lg:hidden p-2 -ml-2 text-stone-700 hover:text-stone-900 transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex flex-col items-center lg:items-start">
              <span className="font-display text-xl lg:text-2xl font-semibold tracking-tight text-stone-900">
                Square Cube
              </span>
              <span className="hidden lg:block text-[10px] tracking-[0.2em] uppercase text-gold-600 font-sans mt-0.5">
                Bespoke Furniture
              </span>
            </Link>

            {/* ── Desktop Nav ─────────────────────────────────────── */}
            <nav className="hidden lg:flex items-center gap-8">

              {/* Shop + Mega Menu */}
              <div
                ref={shopRef}
                className="relative"
                onMouseEnter={() => setIsShopOpen(true)}
                onMouseLeave={() => setIsShopOpen(false)}
              >
                <button
                  className={cn(
                    "flex items-center gap-1 text-sm font-medium tracking-wide transition-colors duration-200",
                    isShopOpen ? "text-gold-600" : "text-stone-700 hover:text-stone-900"
                  )}
                  onClick={() => setIsShopOpen((v) => !v)}
                  aria-expanded={isShopOpen}
                >
                  Shop
                  <ChevronDown
                    size={14}
                    className={cn("transition-transform duration-200", isShopOpen && "rotate-180")}
                  />
                </button>

                {isShopOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-5 w-[680px] bg-white border border-stone-100 shadow-xl animate-slide-down">
                    <div className="p-6 grid grid-cols-3 gap-6">
                      <div className="col-span-2">
                        <p className="section-label mb-4">Browse Categories</p>
                        <div className="grid grid-cols-2 gap-0.5">
                          {NAVIGATION_CATEGORIES.filter((c) => c.slug !== "custom").map((cat) => (
                            <Link
                              key={cat.slug}
                              href={`/categories/${cat.slug}`}
                              className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors rounded-sm"
                              onClick={() => setIsShopOpen(false)}
                            >
                              <span className="text-base leading-none">{cat.icon}</span>
                              <span className="font-medium">{cat.name}</span>
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div className="border-l border-stone-100 pl-6">
                        <p className="section-label mb-4">Custom Order</p>
                        <p className="text-sm text-stone-500 leading-relaxed mb-4">
                          Can't find what you need? We build to your exact specifications.
                        </p>
                        <Link
                          href="/customize"
                          className="btn-primary w-full text-center text-xs py-2.5 block"
                          onClick={() => setIsShopOpen(false)}
                        >
                          Start Customizing
                        </Link>
                        <Link
                          href="/gallery"
                          className="block mt-3 text-sm text-stone-500 hover:text-stone-900 underline underline-offset-2 transition-colors"
                          onClick={() => setIsShopOpen(false)}
                        >
                          View our Gallery →
                        </Link>
                      </div>
                    </div>

                    <div className="border-t border-stone-100 px-6 py-3 bg-stone-50 flex justify-between items-center">
                      <span className="text-xs text-stone-400">
                        Manufacturing Time: 12–35 Working Days
                      </span>
                      <Link
                        href="/products"
                        className="text-xs font-medium text-stone-900 hover:text-gold-600 transition-colors"
                        onClick={() => setIsShopOpen(false)}
                      >
                        View All Products →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link href="/customize" className="text-sm font-medium text-stone-700 hover:text-stone-900 tracking-wide transition-colors">
                Custom Furniture
              </Link>
              <Link href="/gallery" className="text-sm font-medium text-stone-700 hover:text-stone-900 tracking-wide transition-colors">
                Gallery
              </Link>
              <Link href="/faq" className="text-sm font-medium text-stone-700 hover:text-stone-900 tracking-wide transition-colors">
                FAQ
              </Link>
            </nav>

            {/* ── Right Icons ─────────────────────────────────────── */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search */}
              <button
                className="p-2 text-stone-600 hover:text-stone-900 transition-colors"
                onClick={() => setIsSearchOpen((v) => !v)}
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              {/* Wishlist */}
              <Link
                href="/account/wishlist"
                className="relative p-2 text-stone-600 hover:text-stone-900 transition-colors"
                aria-label={`Wishlist (${wishlistCount} items)`}
              >
                <Heart size={18} />
                {wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 bg-gold-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Account */}
              <Link
                href={user ? "/account/dashboard" : "/login"}
                className="p-2 text-stone-600 hover:text-stone-900 transition-colors"
                aria-label="Account"
              >
                <User size={18} />
              </Link>

              {/* WhatsApp CTA — desktop only */}
              <Link
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello Square Cube! I'd like to enquire about your furniture.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden xl:flex btn-whatsapp py-2 px-4 text-xs gap-1.5 ml-2"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                WhatsApp Us
              </Link>
            </div>
          </div>
        </div>

        {/* ── Expandable Search Bar ────────────────────────────────── */}
        {isSearchOpen && (
          <div className="border-t border-stone-100 bg-white animate-slide-down">
            <form
              onSubmit={handleSearch}
              className="max-w-2xl mx-auto px-4 py-4 flex gap-3"
            >
              <input
                autoFocus
                type="text"
                placeholder="Search furniture, categories, wood types…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-base flex-1"
              />
              <button type="submit" className="btn-primary py-2.5 px-5 text-sm">
                Search
              </button>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-2.5 text-stone-400 hover:text-stone-700 transition-colors"
                aria-label="Close search"
              >
                <X size={18} />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile Drawer */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
}
