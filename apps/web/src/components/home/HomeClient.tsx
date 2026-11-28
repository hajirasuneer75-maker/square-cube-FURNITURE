"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Wrench, ArrowRight, ChevronRight, ShieldCheck } from "lucide-react";
import type { Category, EstimatorRate, Product } from "@/types";
import WAButton from "@/components/ui/WAButton";
import ProductCard from "@/components/product/ProductCard";
import CustomStudioClient from "@/components/customize/CustomStudioClient";
import { DEFAULT_CATEGORY_IMAGES } from "@/lib/api";

const WOOD_SHOWCASE = [
  { name: "Nilambur Teak", color: "#9A6B2F", desc: "Kerala's royal timber — golden grain, century-long durability" },
  { name: "Mahogany",      color: "#6E2B16", desc: "Rich reddish-brown luxury hardwood with satin polish" },
  { name: "Rosewood",      color: "#4B2329", desc: "Rare heirloom timber prized for dramatic figuring" },
  { name: "Marine Ply + Veneer", color: "#C5A880", desc: "Architectural IS:710 core clad in real wood veneers" },
];

const CUSTOM_PORTFOLIO = [
  {
    title: "Nilambur Teak 8-Seater Villa Dining",
    city: "Kochi",
    img: "https://images.unsplash.com/photo-1617098474202-0d0d7e35c993?w=800&q=80",
  },
  {
    title: "Fluted Walnut Master Wardrobe Suite",
    city: "Bengaluru",
    img: "https://images.unsplash.com/photo-1558997519-83ea9252edc8?w=800&q=80",
  },
  {
    title: "Alabaster Bouclé Architectural Sectional",
    city: "Thiruvananthapuram",
    img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
  },
];

interface HomeClientProps {
  categories: Category[];
  featuredProducts: Product[];
  estimatorRates: EstimatorRate[];
}

export default function HomeClient({
  categories,
  featuredProducts,
  estimatorRates,
}: HomeClientProps) {
  const [mode, setMode] = useState<"shop" | "studio">("shop");

  const displayCategories = categories.filter((c) => c.slug !== "custom").slice(0, 10);

  return (
    <div style={{ backgroundColor: "#F8F5F0" }}>
      {/* ── ULTRA-LUXURY HERO ─────────────────────────────────────────── */}
      <section
        className="relative min-h-[78vh] flex items-center overflow-hidden"
        style={{ background: "linear-gradient(135deg, #231F1E 0%, #342A26 55%, #1E1918 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-espresso via-espresso/85 to-espresso/40" />

        <div className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 w-full">
          <p className="section-label text-champagne mb-5">
            Square Cube Furniture · Architectural Collection
          </p>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold text-white leading-[1.06] max-w-3xl mb-6">
            Architectural Woodcraft
            <span className="text-champagne block">Designed for Living</span>
          </h1>
          <p className="text-white/70 text-lg max-w-xl leading-relaxed mb-10 font-ui">
            Square Cube Furniture sculpts heirloom furniture in seasoned Nilambur Teak, Mahogany,
            and Rosewood — ready to own or tailored to your space.
          </p>

          <div className="flex flex-wrap gap-3.5">
            <Link href="/products" className="btn-champagne py-3.5 px-8 text-xs">
              Explore Collections
            </Link>
            <button
              type="button"
              onClick={() => {
                setMode("studio");
                document.getElementById("dual-mode-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="btn-outline border-white/60 text-white hover:bg-white hover:text-espresso py-3.5 px-8 text-xs"
            >
              Open Custom Studio
            </button>
            <WAButton
              text="Hello Square Cube Furniture! I'd like to enquire about your luxury furniture."
              className="btn-whatsapp py-3.5 px-7 text-xs"
            >
              WhatsApp Concierge
            </WAButton>
          </div>

          <div className="flex flex-wrap gap-6 mt-14 pt-8 border-t border-white/10">
            {[
              "Nilambur Teak & Heritage Hardwoods",
              "Free AI Room Stylist",
              "Live Custom Price Estimator",
              "Maintenance & Restoration Care",
            ].map((badge) => (
              <div key={badge} className="flex items-center gap-2 text-white/60 text-xs font-ui">
                <ShieldCheck size={14} className="text-champagne" />
                <span>{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DUAL-MODE PILL SWITCHER ───────────────────────────────────── */}
      <section id="dual-mode-section" className="bg-white border-b border-warm-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <div className="flex flex-col items-center gap-4">
            <p className="section-label">Choose Your Experience</p>
            <div className="inline-flex rounded-full border border-warm-border p-1 bg-alabaster shadow-sm">
              <button
                type="button"
                onClick={() => setMode("shop")}
                className={`px-7 py-2.5 rounded-full text-xs font-ui font-semibold tracking-[0.16em] uppercase transition-all duration-300 ${
                  mode === "shop"
                    ? "bg-espresso text-white shadow-sm"
                    : "text-espresso/60 hover:text-espresso"
                }`}
              >
                SHOP COLLECTIONS
              </button>
              <button
                type="button"
                onClick={() => setMode("studio")}
                className={`px-7 py-2.5 rounded-full text-xs font-ui font-semibold tracking-[0.16em] uppercase transition-all duration-300 ${
                  mode === "studio"
                    ? "bg-espresso text-white shadow-sm"
                    : "text-espresso/60 hover:text-espresso"
                }`}
              >
                CUSTOM STUDIO
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── TAB 1: SHOP COLLECTIONS ───────────────────────────────────── */}
      {mode === "shop" && (
        <>
          {/* Explore Furniture Category — Rounded Visual Cards with Centered Titles from DB */}
          <section className="py-16">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="section-label mb-2">Explore Furniture Category</p>
                  <h2 className="editorial-heading text-4xl">Curated Rooms &amp; Silhouettes</h2>
                </div>
                <Link
                  href="/products"
                  className="hidden sm:flex items-center gap-1 text-sm font-ui font-medium text-espresso/65 hover:text-champagne transition-colors"
                >
                  All Collections <ChevronRight size={15} />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
                {displayCategories.map((cat) => {
                  const imgUrl =
                    cat.imageUrl ||
                    DEFAULT_CATEGORY_IMAGES[cat.slug] ||
                    DEFAULT_CATEGORY_IMAGES["living-room"];
                  return (
                    <Link
                      key={cat.id || cat.slug}
                      href={`/categories/${cat.slug}`}
                      className="group relative overflow-hidden rounded-2xl aspect-[4/5] bg-white border border-warm-border shadow-luxury hover:shadow-luxury-hover transition-all duration-500"
                    >
                      <Image
                        src={imgUrl}
                        alt={cat.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-espresso/30 to-espresso/10" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                        <h3 className="font-display text-2xl font-semibold text-white tracking-wide drop-shadow-sm">
                          {cat.name}
                        </h3>
                        <span className="mt-2 inline-block text-[10px] font-ui uppercase tracking-[0.2em] text-champagne bg-espresso/75 px-3 py-1 rounded-full opacity-90 group-hover:bg-champagne group-hover:text-white transition-colors">
                          Explore
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Featured Pieces */}
          <section className="py-16 bg-white border-t border-warm-border">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="section-label mb-2">Signature Pieces</p>
                  <h2 className="editorial-heading text-4xl">Featured Collection</h2>
                </div>
                <Link
                  href="/products"
                  className="flex items-center gap-1 text-sm font-ui font-medium text-espresso/65 hover:text-champagne transition-colors"
                >
                  Browse Full Catalog <ArrowRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.slice(0, 6).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>

          {/* Platform Pillars */}
          <section className="py-16 border-t border-warm-border">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/ai-stylist" className="group luxury-card p-7 hover:border-champagne transition-all">
                  <Sparkles className="text-champagne mb-4" size={24} />
                  <h3 className="font-display text-2xl font-semibold text-espresso mb-2">
                    AI Room Stylist
                  </h3>
                  <p className="text-sm font-ui text-espresso/65 leading-relaxed mb-5">
                    Upload your room photo for instant Gemini AI lighting analysis, wood pairing,
                    and catalog matches — 100% free.
                  </p>
                  <span className="text-xs font-ui font-semibold tracking-widest uppercase text-champagne flex items-center gap-1.5">
                    Launch AI Stylist <ArrowRight size={13} />
                  </span>
                </Link>

                <Link href="/custom-furniture" className="group luxury-card p-7 hover:border-champagne transition-all">
                  <span className="text-2xl mb-4 block">🪵</span>
                  <h3 className="font-display text-2xl font-semibold text-espresso mb-2">
                    Custom Studio &amp; Estimator
                  </h3>
                  <p className="text-sm font-ui text-espresso/65 leading-relaxed mb-5">
                    Configure dimensions, wood species, and finish for an instant live INR quote
                    and send straight to WhatsApp.
                  </p>
                  <span className="text-xs font-ui font-semibold tracking-widest uppercase text-champagne flex items-center gap-1.5">
                    Open Studio <ArrowRight size={13} />
                  </span>
                </Link>

                <Link href="/maintenance" className="group luxury-card p-7 hover:border-champagne transition-all">
                  <Wrench className="text-champagne mb-4" size={24} />
                  <h3 className="font-display text-2xl font-semibold text-espresso mb-2">
                    Maintenance &amp; Care
                  </h3>
                  <p className="text-sm font-ui text-espresso/65 leading-relaxed mb-5">
                    PU refinishing, wood polishing, sofa re-upholstery, hinge repair, termite care,
                    and home shifting services.
                  </p>
                  <span className="text-xs font-ui font-semibold tracking-widest uppercase text-champagne flex items-center gap-1.5">
                    Book Restoration <ArrowRight size={13} />
                  </span>
                </Link>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── TAB 2: CUSTOM STUDIO ──────────────────────────────────────── */}
      {mode === "studio" && (
        <section className="py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
            {/* Wood & Finish Showcase */}
            <div>
              <p className="section-label mb-2">Material Library</p>
              <h2 className="editorial-heading text-4xl mb-8">Wood &amp; Finish Showcase</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {WOOD_SHOWCASE.map((w) => (
                  <div key={w.name} className="luxury-card p-6 rounded-xl">
                    <div
                      className="w-12 h-12 rounded-full mb-4 shadow-sm border border-espresso/10"
                      style={{ backgroundColor: w.color }}
                    />
                    <h3 className="font-display text-xl font-semibold text-espresso mb-1">{w.name}</h3>
                    <p className="text-xs font-ui text-espresso/60 leading-relaxed">{w.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Embedded Live Configurator & Instant Price Estimator */}
            <div>
              <p className="section-label mb-2">Live Configurator</p>
              <h2 className="editorial-heading text-4xl mb-6">
                Instant Custom Price Estimator
              </h2>
              <CustomStudioClient initialRates={estimatorRates} embedded />
            </div>

            {/* Custom Portfolio */}
            <div>
              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="section-label mb-2">Recent Commissions</p>
                  <h2 className="editorial-heading text-3xl">Custom Studio Portfolio</h2>
                </div>
                <Link href="/gallery" className="text-xs font-ui font-semibold uppercase tracking-widest text-champagne hover:underline">
                  View Full Gallery →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {CUSTOM_PORTFOLIO.map((p) => (
                  <div key={p.title} className="luxury-card rounded-2xl overflow-hidden group">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={p.img}
                        alt={p.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-4">
                      <p className="section-label mb-1">{p.city}</p>
                      <p className="font-display text-lg font-semibold text-espresso">{p.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── BOTTOM CONCIERGE BANNER ───────────────────────────────────── */}
      <section style={{ backgroundColor: "#231F1E" }} className="py-16">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="section-label text-champagne mb-4">Private Consultation</p>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold text-white mb-5">
            Speak Directly With Our Master Craftsmen
          </h2>
          <p className="text-white/55 font-ui text-base sm:text-lg max-w-xl mx-auto mb-8">
            Send a floor plan, inspiration photo, or dimension notes — Square Cube Furniture
            crafts your piece with complete transparency.
          </p>
          <WAButton
            text="Hello Square Cube Furniture! I'd like to start a private consultation."
            className="btn-champagne py-4 px-10 text-xs inline-flex"
          >
            Start on WhatsApp ✦
          </WAButton>
        </div>
      </section>
    </div>
  );
}
