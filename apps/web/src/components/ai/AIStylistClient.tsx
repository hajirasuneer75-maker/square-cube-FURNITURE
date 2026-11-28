"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Upload, Sparkles, X, Loader2, ArrowRight, MessageCircle } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { formatPrice, generateWhatsAppUrl } from "@/lib/utils";

const ROOM_TYPES = ["Living Room", "Bedroom", "Dining", "Office"];
const STYLE_TYPES = [
  {
    id: "kerala-heritage",
    label: "Kerala Heritage Teak",
    desc: "Seasoned Nilambur Teak, brass inlays & warm traditional grain",
  },
  {
    id: "modern-luxury",
    label: "Modern Luxury",
    desc: "Clean architectural lines with champagne bronze & walnut finishes",
  },
  {
    id: "minimalist-warm",
    label: "Minimalist Warm",
    desc: "Airy silk cream tones, matte textures & understated joinery",
  },
];

interface MatchedProduct {
  slug: string;
  name: string;
  categoryName: string;
  basePrice: number;
  primaryImage: string;
  reason: string;
}

interface StylistResult {
  analysis: string;
  woodRecommendations: string[];
  finishRecommendations: string[];
  upholsteryColors: Array<{ name: string; hex: string } | string>;
  matchedProducts: MatchedProduct[];
  whatsappMessage: string;
  usedFallback?: boolean;
}

export default function AIStylistClient() {
  const whatsappNumber = useSettingsStore((s) => s.whatsappNumber);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [roomType, setRoomType] = useState("Living Room");
  const [styleType, setStyleType] = useState("kerala-heritage");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StylistResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file (JPG, PNG, WEBP).");
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      setError("Image must be under 6 MB.");
      return;
    }
    setImageFile(file);
    setError(null);
    setResult(null);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function handleAnalyze() {
    if (!imageFile) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("image", imageFile);
      fd.append("roomType", roomType);
      fd.append("styleType", styleType);
      const res = await fetch("/api/ai/room-stylist", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.result) throw new Error(data.error || "Analysis failed.");
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-alabaster">
      {/* Hero */}
      <div style={{ backgroundColor: "#231F1E" }} className="py-16 text-center px-4">
        <p className="section-label text-champagne mb-4">
          Powered by Google Gemini 2.5 Flash · 100% Free Tier
        </p>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-white mb-4">
          AI Room Stylist
        </h1>
        <p className="font-ui text-white/65 text-base sm:text-lg max-w-2xl mx-auto">
          Upload a photo of your room and let Square Cube Furniture&apos;s AI evaluate your lighting,
          wall colors, and space — matching you with ideal timber, finishes, and catalog pieces.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Upload + Preferences */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <label className="form-label">1. Upload Room Photo</label>
              <div
                className="relative border-2 border-dashed border-warm-border hover:border-champagne transition-colors cursor-pointer bg-white aspect-[4/3] flex flex-col items-center justify-center overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Uploaded room"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageFile(null);
                        setImagePreview(null);
                        setResult(null);
                      }}
                      className="absolute top-3 right-3 bg-espresso/85 text-white p-1.5 hover:bg-espresso z-10"
                      aria-label="Remove room photo"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <div className="p-6 text-center">
                    <Upload className="text-champagne mx-auto mb-3" size={32} />
                    <p className="font-ui text-sm font-medium text-espresso/80">
                      Drop your room photo here
                    </p>
                    <p className="font-ui text-xs text-espresso/45 mt-1">
                      or click to browse · JPG, PNG, WEBP up to 6 MB
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </div>

            <div>
              <label className="form-label">2. Room Type</label>
              <div className="grid grid-cols-2 gap-2">
                {ROOM_TYPES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRoomType(r)}
                    className={`py-2.5 px-4 text-xs font-ui font-semibold border transition-all ${
                      roomType === r
                        ? "border-espresso bg-espresso text-white"
                        : "border-warm-border bg-white text-espresso/75 hover:border-champagne"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="form-label">3. Architectural Style</label>
              <div className="space-y-2">
                {STYLE_TYPES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStyleType(s.id)}
                    className={`w-full text-left p-3.5 border transition-all ${
                      styleType === s.id
                        ? "border-champagne bg-bronze-50"
                        : "border-warm-border bg-white hover:border-champagne/60"
                    }`}
                  >
                    <span className="font-ui text-sm font-semibold text-espresso block">{s.label}</span>
                    <span className="font-ui text-xs text-espresso/55 block mt-0.5">{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-red-700 text-xs font-ui bg-red-50 border border-red-200 p-3">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!imageFile || loading}
              className="btn-champagne w-full py-4 text-xs disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Analysing Room Space…
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Analyse Room &amp; Recommend Pieces
                </>
              )}
            </button>
          </div>

          {/* Right: Output */}
          <div className="lg:col-span-7">
            {!result && !loading && (
              <div className="bg-white border border-warm-border p-10 h-full min-h-[420px] flex flex-col items-center justify-center text-center">
                <Sparkles className="text-champagne/40 mb-4" size={48} />
                <h2 className="font-display text-2xl font-semibold text-espresso mb-2">
                  Your Room Styling Blueprint
                </h2>
                <p className="font-ui text-sm text-espresso/55 max-w-md leading-relaxed">
                  Upload a room photo, pick your room type and aesthetic, and receive timber,
                  polish, upholstery, and Square Cube Furniture catalog matches instantly.
                </p>
              </div>
            )}

            {loading && (
              <div className="bg-white border border-warm-border p-10 h-full min-h-[420px] flex flex-col items-center justify-center text-center">
                <Loader2 className="text-champagne animate-spin mb-4" size={44} />
                <h2 className="font-display text-2xl font-semibold text-espresso mb-2">
                  Analysing Lighting, Walls &amp; Proportions…
                </h2>
                <p className="font-ui text-sm text-espresso/55">
                  Matching materials and pieces from the Square Cube Furniture catalog.
                </p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* Analysis */}
                <div className="bg-white border border-warm-border p-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="section-label mb-0">Lighting, Wall &amp; Space Analysis</p>
                    <span className="text-[10px] font-ui uppercase tracking-widest text-espresso/45">
                      {result.usedFallback ? "Studio Smart Guide" : "Gemini 2.5 Vision"}
                    </span>
                  </div>
                  <p className="font-ui text-sm text-espresso/85 leading-relaxed">
                    {result.analysis}
                  </p>
                </div>

                {/* Woods, Finishes, Upholstery */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white border border-warm-border p-4">
                    <p className="section-label mb-2.5">Wood Species</p>
                    <ul className="space-y-1.5">
                      {result.woodRecommendations.map((w) => (
                        <li key={w} className="font-ui text-xs font-medium text-espresso flex items-center gap-1.5">
                          <span className="text-champagne">✦</span> {w}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white border border-warm-border p-4">
                    <p className="section-label mb-2.5">Polish Finishes</p>
                    <ul className="space-y-1.5">
                      {result.finishRecommendations.map((f) => (
                        <li key={f} className="font-ui text-xs font-medium text-espresso flex items-center gap-1.5">
                          <span className="text-champagne">✦</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white border border-warm-border p-4">
                    <p className="section-label mb-2.5">Upholstery Palette</p>
                    <ul className="space-y-2">
                      {result.upholsteryColors.map((c, idx) => {
                        const name = typeof c === "string" ? c : c.name;
                        const hex = typeof c === "string" ? "#D4B090" : c.hex;
                        return (
                          <li key={idx} className="flex items-center gap-2 font-ui text-xs text-espresso">
                            <span
                              className="w-4 h-4 rounded-full border border-black/15 flex-shrink-0"
                              style={{ backgroundColor: hex }}
                            />
                            {name}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                {/* Catalog Recommendations */}
                {result.matchedProducts.length > 0 && (
                  <div className="bg-white border border-warm-border p-6">
                    <p className="section-label mb-4">
                      Matched from Square Cube Furniture Catalog
                    </p>
                    <div className="space-y-3">
                      {result.matchedProducts.map((item) => (
                        <Link
                          key={item.slug}
                          href={`/products/${item.slug}`}
                          className="flex gap-4 p-3 border border-warm-border hover:border-champagne transition-all group bg-alabaster/40"
                        >
                          <div className="relative w-24 h-20 flex-shrink-0 bg-white overflow-hidden">
                            <Image
                              src={item.primaryImage}
                              alt={item.name}
                              fill
                              sizes="96px"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-[10px] font-ui uppercase tracking-widest text-champagne">
                                  {item.categoryName}
                                </p>
                                <h3 className="font-display text-lg font-semibold text-espresso group-hover:text-champagne transition-colors">
                                  {item.name}
                                </h3>
                              </div>
                              <p className="font-ui text-sm font-semibold text-espresso whitespace-nowrap">
                                {formatPrice(item.basePrice)}
                              </p>
                            </div>
                            <p className="font-ui text-xs text-espresso/60 mt-1 line-clamp-2">
                              {item.reason}
                            </p>
                          </div>
                          <ArrowRight size={16} className="text-espresso/30 group-hover:text-champagne self-center flex-shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* WhatsApp Send */}
                <a
                  href={generateWhatsAppUrl(whatsappNumber, result.whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp w-full py-4 text-xs tracking-wider uppercase font-semibold"
                >
                  <MessageCircle size={16} />
                  Discuss Recommendations on WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
