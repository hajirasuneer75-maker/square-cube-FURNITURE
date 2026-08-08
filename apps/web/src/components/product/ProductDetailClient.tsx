"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Heart, Star, Shield, Clock, Truck, MessageCircle, Info,
} from "lucide-react";
import type { Product, WoodType } from "@/types";
import { useCustomizationStore } from "@/store/useCustomizationStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { formatPrice, cn } from "@/lib/utils";
import ImageGallery from "./ImageGallery";
import WoodSelector from "./WoodSelector";


const WOOD_CARE: Record<string, string> = {
  teak:
    "Teak is naturally water and insect-resistant. Wipe with a damp cloth and apply teak oil once a year to sustain its golden lustre.",
  sheesham:
    "Sheesham develops a rich patina over the years. Dust regularly with a soft cloth and apply wax polish every 6 months.",
  oak:
    "Oak is highly durable and responds well to waxing. Buff twice a year and protect from prolonged direct sunlight.",
  mahogany:
    "Mahogany polishes beautifully due to its fine grain. Apply oil-based furniture polish every 3 months and keep away from direct heat.",
  plywood:
    "Wipe clean with a dry cloth. Avoid prolonged moisture on edges. Apply a laminate-safe cleaner annually.",
  mdf:
    "MDF is sensitive to moisture — never soak. Clean only with a soft, slightly damp cloth and dry immediately.",
  "engineered-wood":
    "Engineered wood is dimensionally stable and hard-wearing. Dust regularly and avoid abrasive cleaners or standing water.",
};

const FINISH_OPTIONS: { id: string; label: string; hex: string | null }[] = [
  { id: "natural",      label: "Natural Polish",  hex: "#C4A354" },
  { id: "walnut-stain", label: "Walnut Stain",    hex: "#5C3D2E" },
  { id: "ebony",        label: "Ebony",            hex: "#1A1A1A" },
  { id: "honey-oak",    label: "Honey Oak",        hex: "#D4A558" },
  { id: "white-wash",   label: "White Wash",       hex: "#F0EDE6" },
  { id: "custom",       label: "Custom Colour",    hex: null       },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          className={
            rating >= s
              ? "fill-gold-500 text-gold-500"
              : "fill-stone-200 text-stone-200"
          }
        />
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  product: Product;
}

export default function ProductDetailClient({ product }: Props) {
  const { whatsappNumber } = useSettingsStore();
  const {
    initForProduct,
    setWoodType,
    setSize,
    setNotes,
    setCustomization,
    setCalculatedPrice,
    selectedWoodTypeId,
    selectedWoodTypeName,
    customizations,
    additionalNotes,
    calculatedPrice,
    buildWhatsAppUrl,
  } = useCustomizationStore();

  const { toggleItem, isInWishlist } = useWishlistStore();

  // Local state for size inputs (in whatever unit is active)
  const [displaySize, setDisplaySize] = useState({ length: "", width: "", height: "" });
  const [sizeUnit, setSizeUnit] = useState<"cm" | "in">("cm");
  const [showCare, setShowCare] = useState(false);

  // Initialise store whenever product changes
  useEffect(() => {
    initForProduct(product.id, product.name, product.basePrice);
    setDisplaySize({ length: "", width: "", height: "" });
    setShowCare(false);
  }, [product.id, product.name, product.basePrice, initForProduct]);

  // Recalculate price when selected wood changes
  useEffect(() => {
    const wood = product.availableWoods?.find((w) => w.id === selectedWoodTypeId);
    if (!wood) {
      setCalculatedPrice(product.basePrice);
      return;
    }
    let price = product.basePrice;
    if (wood.priceModifierType === "FIXED_ADD")   price = product.basePrice + wood.priceModifier;
    if (wood.priceModifierType === "MULTIPLIER")   price = product.basePrice * wood.priceModifier;
    if (wood.priceModifierType === "FIXED_PRICE")  price = wood.priceModifier;
    setCalculatedPrice(price);
  }, [selectedWoodTypeId, product.basePrice, product.availableWoods, setCalculatedPrice]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  function handleWoodChange(wood: WoodType) {
    setWoodType(wood.id, wood.name);
    setShowCare(true);
  }

  function handleSizeChange(dim: "length" | "width" | "height", val: string) {
    setDisplaySize((prev) => ({ ...prev, [dim]: val }));
  }

  function handleSizeBlur(dim: "length" | "width" | "height") {
    const raw = displaySize[dim];
    if (!raw) { setSize(dim, ""); return; }
    const num = parseFloat(raw);
    if (isNaN(num)) return;
    const cmVal = sizeUnit === "in" ? (num * 2.54).toFixed(1) : raw;
    setSize(dim, cmVal);
  }

  function handleUnitChange(unit: "cm" | "in") {
    if (unit === sizeUnit) return;
    setSizeUnit(unit);
    // Convert non-empty displaySize values to the new unit
    setDisplaySize((prev) => {
      const convert = (v: string) => {
        if (!v) return "";
        const n = parseFloat(v);
        if (isNaN(n)) return v;
        return unit === "in"
          ? (n / 2.54).toFixed(1)   // cm → in
          : (n * 2.54).toFixed(1);  // in → cm
      };
      return {
        length: convert(prev.length),
        width:  convert(prev.width),
        height: convert(prev.height),
      };
    });
  }

  function handleWishlist() {
    toggleItem({
      productId:    product.id,
      productName:  product.name,
      basePrice:    product.basePrice,
      primaryImage: product.primaryImage,
      slug:         product.slug,
      categoryName: product.categoryName,
      addedAt:      new Date().toISOString(),
    });
  }

  // ─── Derived values ──────────────────────────────────────────────────────────

  const displayPrice   = calculatedPrice ?? product.basePrice;
  const inWishlist     = isInWishlist(product.id);
  const selectedWood   = product.availableWoods?.find((w) => w.id === selectedWoodTypeId) ?? null;
  const careText       = selectedWood ? (WOOD_CARE[selectedWood.slug] ?? null) : null;
  const selectedFinish = customizations["Finish"] ?? null;
  const whatsappUrl    = buildWhatsAppUrl(whatsappNumber);

  const priceDiff =
    selectedWood && selectedWood.priceModifierType === "FIXED_ADD" && selectedWood.priceModifier !== 0
      ? selectedWood.priceModifier
      : null;

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-400 mb-8 flex-wrap">
        <Link href="/" className="hover:text-stone-700 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-stone-700 transition-colors">Products</Link>
        <span>/</span>
        <Link href={`/categories/${product.categorySlug}`} className="hover:text-stone-700 transition-colors">
          {product.categoryName}
        </Link>
        <span>/</span>
        <span className="text-stone-600 truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">

        {/* ── LEFT: Gallery + guarantees ── */}
        <div className="lg:col-span-7">
          <div className="lg:sticky lg:top-28">

            <ImageGallery images={product.images} productName={product.name} />

            {/* Trust strip */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { Icon: Shield, text: product.warranty     ?? "1 Year Warranty"          },
                { Icon: Clock,  text: product.manufacturingTime ?? "15–20 days to craft" },
                { Icon: Truck,  text: product.deliveryTime ? `Ships in ${product.deliveryTime}` : "Pan-India Delivery" },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-2 py-3.5 border border-stone-200 text-center">
                  <Icon size={17} className="text-stone-400" />
                  <span className="text-[11px] text-stone-600 font-medium leading-snug px-1">{text}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── RIGHT: Customiser ── */}
        <div className="lg:col-span-5 flex flex-col gap-8">

          {/* Product header */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="section-label">{product.categoryName}</span>
              <span className="text-stone-300">·</span>
              <span className="font-mono text-xs text-stone-400">{product.sku}</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl text-stone-900 tracking-tight leading-tight mb-3">
              {product.name}
            </h1>

            {product.rating !== undefined && (
              <div className="flex items-center gap-2.5">
                <StarRating rating={product.rating} />
                <span className="text-sm text-stone-500">
                  {product.rating.toFixed(1)}&ensp;
                  <span className="text-stone-400">({product.reviewCount ?? 0} reviews)</span>
                </span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="pb-7 border-b border-stone-200">
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">
              {selectedWoodTypeId ? "Price for this configuration" : "Starting from"}
            </p>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="font-display text-4xl text-stone-900">
                {formatPrice(displayPrice)}
              </span>
              {priceDiff !== null && (
                <span className={cn(
                  "text-sm font-medium",
                  priceDiff > 0 ? "text-stone-500" : "text-green-600"
                )}>
                  {priceDiff > 0
                    ? `(+${formatPrice(priceDiff)} for ${selectedWood!.name})`
                    : `(−${formatPrice(Math.abs(priceDiff))} with ${selectedWood!.name})`}
                </span>
              )}
            </div>
            <p className="text-xs text-stone-400 mt-1.5">
              Inclusive of GST · Free design consultation included
            </p>
          </div>

          {/* Wood type */}
          {product.availableWoods && product.availableWoods.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="section-label">Wood Type</p>
                {selectedWoodTypeName && (
                  <span className="text-sm font-semibold text-stone-800">
                    {selectedWoodTypeName}
                  </span>
                )}
              </div>

              <WoodSelector
                woods={product.availableWoods}
                selectedId={selectedWoodTypeId}
                onChange={handleWoodChange}
              />

              {/* Maintenance advice — appears on wood selection */}
              {showCare && careText && (
                <div className="mt-3 flex gap-2.5 p-3.5 bg-amber-50 border border-amber-200">
                  <Info size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">{careText}</p>
                </div>
              )}
            </div>
          )}

          {/* Custom size */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="section-label">Custom Size</p>
              <div className="flex border border-stone-200 overflow-hidden">
                {(["cm", "in"] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => handleUnitChange(u)}
                    className={cn(
                      "px-3 py-1 text-xs font-semibold transition-colors",
                      sizeUnit === u
                        ? "bg-stone-900 text-white"
                        : "text-stone-500 hover:text-stone-800"
                    )}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {(["length", "width", "height"] as const).map((dim) => (
                <div key={dim}>
                  <label className="block text-[11px] text-stone-400 uppercase tracking-widest mb-1.5">
                    {dim === "length" ? "Length" : dim === "width" ? "Width" : "Height"}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      placeholder="–"
                      value={displaySize[dim]}
                      onChange={(e) => handleSizeChange(dim, e.target.value)}
                      onBlur={() => handleSizeBlur(dim)}
                      className="input-base pr-8 text-center text-sm"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-stone-400 pointer-events-none select-none">
                      {sizeUnit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-stone-400 mt-2">
              Leave blank to discuss standard sizing on WhatsApp.
            </p>
          </div>

          {/* Polish & finish */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="section-label">Polish & Finish</p>
              {selectedFinish && (
                <span className="text-sm font-semibold text-stone-800">{selectedFinish}</span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FINISH_OPTIONS.map((finish) => {
                const isSelected = selectedFinish === finish.label;
                return (
                  <button
                    key={finish.id}
                    onClick={() => setCustomization("Finish", finish.label)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-3 border-2 text-left transition-all duration-200",
                      isSelected
                        ? "border-stone-900 bg-stone-900"
                        : "border-stone-200 hover:border-stone-400 bg-white"
                    )}
                  >
                    {finish.hex ? (
                      <span
                        className="w-4 h-4 flex-shrink-0 rounded-full border border-stone-200"
                        style={{ backgroundColor: finish.hex }}
                      />
                    ) : (
                      <span className="w-4 h-4 flex-shrink-0 rounded-full bg-gradient-to-br from-stone-200 via-amber-200 to-stone-500" />
                    )}
                    <span className={cn(
                      "text-xs font-medium leading-tight",
                      isSelected ? "text-white" : "text-stone-700"
                    )}>
                      {finish.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional notes */}
          <div>
            <p className="section-label mb-3">Additional Notes</p>
            <textarea
              rows={3}
              value={additionalNotes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g. specific leg style, carving details, matching existing décor, delivery floor, assembly help…"
              className="input-base resize-none text-sm leading-relaxed"
            />
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col gap-3 pt-1">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              <MessageCircle size={18} />
              Chat on WhatsApp · Get a Quote
            </a>

            <button
              onClick={handleWishlist}
              className={cn(
                "btn-outline flex items-center justify-center gap-2",
                inWishlist && "bg-stone-900 text-white border-stone-900"
              )}
            >
              <Heart size={16} className={cn(inWishlist && "fill-white text-white")} />
              {inWishlist ? "Saved to Wishlist" : "Save to Wishlist"}
            </button>
          </div>

          {/* Short description */}
          <p className="text-sm text-stone-500 leading-relaxed border-t border-stone-100 pt-6">
            {product.shortDescription}
          </p>

        </div>
      </div>
    </div>
  );
}
