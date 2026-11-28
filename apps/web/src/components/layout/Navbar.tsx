"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, User, Search, Menu, X, ShoppingBag, Sparkles, ArrowRight } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { NAVIGATION_CATEGORIES } from "@/lib/constants/categories";
import { cn, generateWhatsAppUrl, getWhatsAppNumber } from "@/lib/utils";
import MobileMenu from "./MobileMenu";
import CartDrawer from "./CartDrawer";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const NAV_LINKS = [
  { label: "Collections",        href: "/products" },
  { label: "Custom Studio",      href: "/custom-furniture" },
  { label: "Maintenance & Care", href: "/maintenance" },
  { label: "AI Room Stylist",    href: "/ai-stylist", icon: <Sparkles size={13} className="text-champagne" /> },
];

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const shopRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const wishlistCount = useWishlistStore((s) => s.items.length);
  const cartItems = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);
  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);

  const user = useUserStore((s) => s.user);
  const { whatsappNumber, announcementText, announcementEnabled, syncFromServer } = useSettingsStore();
  const waNumber = getWhatsAppNumber(mounted ? whatsappNumber : null);

  const [showAnnouncement, setShowAnnouncement] = useState(false);

  useEffect(() => {
    setMounted(true);
    syncFromServer();
  }, [syncFromServer]);

  useEffect(() => {
    setShowAnnouncement(announcementEnabled);
  }, [announcementEnabled]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (shopRef.current && !shopRef.current.contains(e.target as Node)) setIsShopOpen(false);
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
      {/* Announcement Bar */}
      {showAnnouncement && (
        <div className="bg-espresso text-white text-[11px] py-2 px-8 text-center relative tracking-[0.08em]">
          <span>{announcementText}</span>
          <button
            onClick={() => setShowAnnouncement(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-60 transition-opacity"
            aria-label="Dismiss announcement"
          >
            <X size={11} />
          </button>
        </div>
      )}

      {/* Main Sticky Header */}
      <header
        className={cn(
          "sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b transition-shadow duration-300",
          scrolled ? "border-warm-border shadow-luxury" : "border-warm-border"
        )}
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile Menu Trigger */}
            <button
              className="lg:hidden p-2 -ml-2 text-espresso hover:text-champagne transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            {/* Strict Brand Logo */}
            <Link href="/" className="flex-shrink-0 flex flex-col items-center lg:items-start">
              <span className="font-display text-lg sm:text-xl lg:text-2xl font-semibold tracking-tight text-espresso leading-none">
                Square Cube Furniture
              </span>
              <span className="hidden lg:block text-[9px] tracking-[0.28em] uppercase text-champagne font-ui mt-1">
                Architectural Woodcraft &amp; Studio
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-7">
              <div
                ref={shopRef}
                className="relative"
                onMouseEnter={() => setIsShopOpen(true)}
                onMouseLeave={() => setIsShopOpen(false)}
              >
                <button
                  className={cn(
                    "flex items-center gap-1 text-sm font-ui font-medium tracking-wide transition-colors duration-200",
                    isShopOpen ? "text-champagne" : "text-espresso/75 hover:text-espresso"
                  )}
                  onClick={() => setIsShopOpen((v) => !v)}
                  aria-expanded={isShopOpen}
                >
                  Collections
                </button>

                {isShopOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-6 w-[720px] bg-white border border-warm-border shadow-luxury-hover animate-slide-down">
                    <div className="p-6 grid grid-cols-3 gap-6">
                      <div className="col-span-2">
                        <p className="section-label mb-4">Explore Categories</p>
                        <div className="grid grid-cols-2 gap-0.5">
                          {NAVIGATION_CATEGORIES.filter((c) => c.slug !== "custom").slice(0, 10).map((cat) => (
                            <Link
                              key={cat.slug}
                              href={`/categories/${cat.slug}`}
                              className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-espresso/75 hover:bg-alabaster hover:text-espresso transition-colors"
                              onClick={() => setIsShopOpen(false)}
                            >
                              <span className="text-base leading-none">{cat.icon}</span>
                              <span className="font-ui font-medium">{cat.name}</span>
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div className="border-l border-warm-border pl-6 space-y-4">
                        <div>
                          <p className="section-label mb-2">Custom Studio</p>
                          <p className="text-xs text-espresso/60 leading-relaxed mb-3">
                            Design furniture built to your room&apos;s exact proportions.
                          </p>
                          <Link
                            href="/custom-furniture"
                            className="btn-champagne w-full text-center text-[10px] py-2.5 block"
                            onClick={() => setIsShopOpen(false)}
                          >
                            Open Studio
                          </Link>
                        </div>
                        <div>
                          <p className="section-label mb-2">AI Room Stylist</p>
                          <p className="text-xs text-espresso/60 leading-relaxed mb-3">
                            Free Gemini room analysis &amp; material pairing.
                          </p>
                          <Link
                            href="/ai-stylist"
                            className="btn-outline-champagne w-full text-center text-[10px] py-2.5 block"
                            onClick={() => setIsShopOpen(false)}
                          >
                            Try AI Stylist ✦
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-warm-border px-6 py-3 bg-alabaster flex justify-between items-center">
                      <span className="text-xs text-espresso/45 font-ui">
                        Crafted in Kerala · Pan-India White-Glove Delivery
                      </span>
                      <Link
                        href="/products"
                        className="text-xs font-ui font-semibold text-espresso hover:text-champagne transition-colors"
                        onClick={() => setIsShopOpen(false)}
                      >
                        View All Products →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {NAV_LINKS.slice(1).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 text-sm font-ui font-medium text-espresso/75 hover:text-espresso tracking-wide transition-colors"
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              {/* Search Drawer Toggle */}
              <button
                className="p-2 text-espresso/65 hover:text-espresso transition-colors"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Open search drawer"
              >
                <Search size={18} />
              </button>

              {/* Wishlist */}
              <Link
                href="/account/wishlist"
                className="relative p-2 text-espresso/65 hover:text-espresso transition-colors"
                aria-label={`Wishlist (${mounted ? wishlistCount : 0} items)`}
              >
                <Heart size={18} />
                {mounted && wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 bg-champagne text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Counter */}
              <button
                onClick={openCart}
                className="relative p-2 text-espresso/65 hover:text-espresso transition-colors"
                aria-label={`Cart (${mounted ? cartCount : 0} items)`}
              >
                <ShoppingBag size={18} />
                {mounted && cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 bg-espresso text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Account */}
              <Link
                href={user ? "/account/dashboard" : "/login"}
                className="hidden sm:inline-flex p-2 text-espresso/65 hover:text-espresso transition-colors"
                aria-label="Account"
              >
                <User size={18} />
              </Link>

              {/* Direct WhatsApp Button */}
              <a
                href={generateWhatsAppUrl(
                  waNumber,
                  "Hello Square Cube Furniture! I'd like to enquire about your luxury furniture."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden xl:flex btn-whatsapp py-2 px-4 text-xs gap-1.5 ml-1.5 rounded-full"
                suppressHydrationWarning
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-Down Search Drawer */}
      {isSearchOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-espresso/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsSearchOpen(false)}
          />
          <div className="fixed inset-x-0 top-0 z-50 bg-white border-b border-warm-border shadow-luxury-hover animate-slide-down">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
              <div className="flex items-center justify-between mb-4">
                <p className="section-label">Search Square Cube Furniture</p>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 text-espresso/50 hover:text-espresso transition-colors"
                  aria-label="Close search drawer"
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSearch} className="flex gap-3">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search Nilambur Teak, Dining Tables, Sofas, Wardrobes…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-luxury flex-1"
                />
                <button type="submit" className="btn-primary py-3 px-6 text-xs">
                  Search
                </button>
              </form>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-ui text-espresso/45 uppercase tracking-wider mr-2">
                  Popular:
                </span>
                {["Nilambur Teak", "Dining Table", "King Bed", "Wardrobe", "Sofa"].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      router.push(`/products?search=${encodeURIComponent(term)}`);
                      setIsSearchOpen(false);
                    }}
                    className="text-xs font-ui px-3 py-1 bg-alabaster border border-warm-border text-espresso/75 hover:border-champagne hover:text-espresso transition-colors"
                  >
                    {term}
                  </button>
                ))}
                <Link
                  href="/ai-stylist"
                  onClick={() => setIsSearchOpen(false)}
                  className="ml-auto inline-flex items-center gap-1 text-xs font-ui font-semibold text-champagne hover:underline"
                >
                  Or upload a room photo with AI Stylist <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <CartDrawer />
    </>
  );
}
