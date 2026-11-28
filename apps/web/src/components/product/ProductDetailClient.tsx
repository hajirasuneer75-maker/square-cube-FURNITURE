"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Heart,
  Star,
  Shield,
  Clock,
  Truck,
  MessageCircle,
  Info,
  Camera,
  ShoppingBag,
} from "lucide-react";
import type { Product, WoodType } from "@/types";
import { useCustomizationStore } from "@/store/useCustomizationStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { formatPrice, cn } from "@/lib/utils";
import ImageGallery from "./ImageGallery";
import WoodSelector from "./WoodSelector";
import RoomPreviewModal from "./RoomPreviewModal";

const WOOD_CARE: Record<string, string> = {
  "nilambur-teak":
    "Nilambur Teak is rich in natural oleoresins — wipe with a soft damp cloth and apply pure teak oil once a year to preserve its golden warmth.",
  teak:
    "Teak is naturally water and insect-resistant. Wipe with a damp cloth and apply teak oil once a year to sustain its golden lustre.",
  sheesham:
    "Sheesham develops a rich patina over the years. Dust regularly with a soft cloth and apply wax polish every 6 months.",
  oak:
    "Oak is highly durable and responds well to waxing. Buff twice a year and protect from prolonged direct sunlight.",
  mahogany:
    "Mahogany polishes beautifully due to its fine grain. Apply oil-based furniture polish every 3 months and keep away from direct heat.",
  rosewood:
    "Indian Rosewood carries deep natural figuring. Buff gently with beeswax balm twice yearly to retain satin depth.",
  "marine-ply":
    "BWP Marine Ply with natural architectural veneer is moisture-resistant. Wipe with a dry microfiber cloth.",
  plywood:
    "Wipe clean with a dry cloth. Avoid prolonged moisture on edges.",
  mdf:
    "MDF is sensitive to standing moisture. Clean with a soft slightly damp cloth and dry immediately.",
  "engineered-wood":
    "Engineered wood is dimensionally stable. Dust regularly and avoid abrasive cleaners.",
};

const FINISH_SWATCH_MAP: { id: string; label: string; hex: string; tint: string }[] = [
  { id: "natural-matte", label: "Natural Matte", hex: "#C8A97E", tint: "sepia(8%) saturate(105%)" },
  { id: "walnut-stain",  label: "Walnut Stain",  hex: "#5C3D2E", tint: "sepia(18%) brightness(95%)" },
  { id: "pu-gloss",      label: "PU Gloss",      hex: "#8C6239", tint: "contrast(106%) saturate(112%)" },
  { id: "honey-teak",    label: "Honey Teak",    hex: "#D4A558", tint: "sepia(14%) saturate(118%)" },
  { id: "duco-matte",    label: "Duco Matte",    hex: "#ECE6DC", tint: "brightness(103%) contrast(98%)" },
];

const FABRIC_SWATCHES: { id: string; label: string; hex: string; add: number }[] = [
  { id: "ivory-boucle",   label: "Ivory Bouclé",      hex: "#F2EDE3", add: 0    },
  { id: "oatmeal-linen",  label: "Warm Oatmeal Linen", hex: "#DCD2C0", add: 0    },
  { id: "cognac-leather", label: "Cognac Tan Leather", hex: "#8B5A3C", add: 6500 },
  { id: "charcoal-linen", label: "Charcoal Linen",     hex: "#3E3C3A", add: 1500 },
  { id: "emerald-velvet", label: "Emerald Velvet",     hex: "#284B3E", add: 3500 },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          className={
            rating >= s
              ? "fill-champagne text-champagne"
              : "fill-warm-border text-warm-border"
          }
        />
      ))}
    </div>
  );
}

interface Props {
  product: Product;
}

export default function ProductDetailClient({ product }: Props) {
  const { whatsappNumber } = useSettingsStore();
  const { addItem } = useCartStore();
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

  const [displaySize, setDisplaySize] = useState({ length: "", width: "", height: "" });
  const [sizeUnit, setSizeUnit] = useState<"cm" | "in">("in");
  const [showCare, setShowCare] = useState(false);
  const [roomAROpen, setRoomAROpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const effectiveBase =
    product.offerPrice && product.offerPrice < product.basePrice
      ? product.offerPrice
      : product.basePrice;

  const availableFinishSwatches =
    product.finishSwatches && product.finishSwatches.length > 0
      ? product.finishSwatches.map((label) => {
          const match = FINISH_SWATCH_MAP.find((f) => f.label.toLowerCase() === label.toLowerCase());
          return (
            match ?? {
              id: label.toLowerCase().replace(/\s+/g, "-"),
              label,
              hex: "#B08968",
              tint: "none",
            }
          );
        })
      : FINISH_SWATCH_MAP.slice(0, 4);

  const availableFabricSwatches =
    product.fabricSwatches && product.fabricSwatches.length > 0
      ? product.fabricSwatches.map((label) => {
          const match = FABRIC_SWATCHES.find((f) => f.label.toLowerCase() === label.toLowerCase());
          return (
            match ?? {
              id: label.toLowerCase().replace(/\s+/g, "-"),
              label,
              hex: "#D4C9B8",
              add: 0,
            }
          );
        })
      : ["sofas", "beds", "chairs", "living-room"].includes(product.categorySlug)
      ? FABRIC_SWATCHES
      : [];

  useEffect(() => {
    initForProduct(product.id, product.name, effectiveBase);
    setDisplaySize({ length: "", width: "", height: "" });
    setShowCare(false);
  }, [product.id, product.name, effectiveBase, initForProduct]);

  const selectedFinish = customizations["Finish"] ?? availableFinishSwatches[0]?.label ?? null;
  const selectedFabric = customizations["Fabric"] ?? null;

  // Recalculate price dynamically on wood or fabric swatch change
  useEffect(() => {
    const wood = product.availableWoods?.find((w) => w.id === selectedWoodTypeId);
    let price = effectiveBase;
    if (wood) {
      if (wood.priceModifierType === "FIXED_ADD") price = effectiveBase + wood.priceModifier;
      if (wood.priceModifierType === "MULTIPLIER") price = effectiveBase * wood.priceModifier;
      if (wood.priceModifierType === "FIXED_PRICE") price = wood.priceModifier;
    }
    const fabricObj = availableFabricSwatches.find((f) => f.label === selectedFabric);
    if (fabricObj?.add) price += fabricObj.add;
    setCalculatedPrice(price);
  }, [
    selectedWoodTypeId,
    selectedFabric,
    effectiveBase,
    product.availableWoods,
    availableFabricSwatches,
    setCalculatedPrice,
  ]);

  function handleWoodChange(wood: WoodType) {
    setWoodType(wood.id, wood.name);
    setShowCare(true);
  }

  function handleSizeChange(dim: "length" | "width" | "height", val: string) {
    setDisplaySize((prev) => ({ ...prev, [dim]: val }));
  }

  function handleSizeBlur(dim: "length" | "width" | "height") {
    const raw = displaySize[dim];
    if (!raw) {
      setSize(dim, "");
      return;
    }
    const num = parseFloat(raw);
    if (isNaN(num)) return;
    const cmVal = sizeUnit === "in" ? (num * 2.54).toFixed(1) : raw;
    setSize(dim, cmVal);
  }

  function handleUnitChange(unit: "cm" | "in") {
    if (unit === sizeUnit) return;
    setSizeUnit(unit);
    setDisplaySize((prev) => {
      const convert = (v: string) => {
        if (!v) return "";
        const n = parseFloat(v);
        if (isNaN(n)) return v;
        return unit === "in" ? (n / 2.54).toFixed(1) : (n * 2.54).toFixed(1);
      };
      return {
        length: convert(prev.length),
        width: convert(prev.width),
        height: convert(prev.height),
      };
    });
  }

  function handleWishlist() {
    toggleItem({
      productId: product.id,
      productName: product.name,
      basePrice: effectiveBase,
      primaryImage: product.primaryImage,
      slug: product.slug,
      categoryName: product.categoryName,
      addedAt: new Date().toISOString(),
    });
  }

  function handleAddToCart() {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      sku: product.sku,
      primaryImage: product.primaryImage,
      price: displayPrice,
      woodName: selectedWoodTypeName ?? undefined,
      finishName: selectedFinish ?? undefined,
      fabricName: selectedFabric ?? undefined,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  const displayPrice = calculatedPrice ?? effectiveBase;
  const inWishlist = isInWishlist(product.id);
  const selectedWood = product.availableWoods?.find((w) => w.id === selectedWoodTypeId) ?? null;
  const careText = selectedWood ? WOOD_CARE[selectedWood.slug] ?? null : null;
  const activeFinishObj = availableFinishSwatches.find((f) => f.label === selectedFinish);
  const whatsappUrl = buildWhatsAppUrl(whatsappNumber);

  const priceDiff =
    selectedWood && selectedWood.priceModifierType === "FIXED_ADD" && selectedWood.priceModifier !== 0
      ? selectedWood.priceModifier
      : null;

  return (
    <div className="bg-alabaster min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-ui text-espresso/50 mb-8 flex-wrap">
          <Link href="/" className="hover:text-espresso transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-espresso transition-colors">Collections</Link>
          <span>/</span>
          <Link href={`/categories/${product.categorySlug}`} className="hover:text-espresso transition-colors">
            {product.categoryName}
          </Link>
          <span>/</span>
          <span className="text-espresso truncate max-w-[240px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* ── LEFT: Gallery with live swatch badge & View in Your Room ── */}
          <div className="lg:col-span-7">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="relative bg-white p-3 border border-warm-border shadow-luxury">
                <div style={{ filter: activeFinishObj?.tint ?? "none", transition: "filter 0.35s ease" }}>
                  <ImageGallery images={product.images} productName={product.name} />
                </div>

                {/* Live Configuration Overlay Badge */}
                {(selectedWoodTypeName || selectedFinish || selectedFabric) && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-alabaster border border-warm-border">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-ui font-semibold uppercase tracking-widest text-champagne">
                        Selected Configuration:
                      </span>
                      {selectedWoodTypeName && (
                        <span className="text-xs font-ui font-medium text-espresso bg-white px-2.5 py-0.5 border border-warm-border">
                          {selectedWoodTypeName}
                        </span>
                      )}
                      {selectedFinish && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-ui font-medium text-espresso bg-white px-2.5 py-0.5 border border-warm-border">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/15"
                            style={{ backgroundColor: activeFinishObj?.hex ?? "#B08968" }}
                          />
                          {selectedFinish}
                        </span>
                      )}
                      {selectedFabric && (
                        <span className="text-xs font-ui font-medium text-espresso bg-white px-2.5 py-0.5 border border-warm-border">
                          {selectedFabric}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* WebAR Camera Overlay Trigger */}
                <button
                  type="button"
                  onClick={() => setRoomAROpen(true)}
                  className="mt-3 w-full py-3 px-4 bg-espresso text-white hover:bg-champagne transition-colors flex items-center justify-center gap-2 text-xs font-ui font-semibold uppercase tracking-widest"
                >
                  <Camera size={16} /> View in Your Room (Live Camera / Photo Preview)
                </button>
              </div>

              {/* Trust Strip */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { Icon: Shield, text: product.warranty ?? "5 Year Structural Warranty" },
                  { Icon: Clock, text: product.manufacturingTime ?? "15–24 Days Craft Time" },
                  { Icon: Truck, text: product.deliveryTime ? `Ships in ${product.deliveryTime}` : "Pan-India Delivery" },
                ].map(({ Icon, text }) => (
                  <div key={text} className="flex flex-col items-center gap-2 py-3.5 bg-white border border-warm-border text-center">
                    <Icon size={17} className="text-champagne" />
                    <span className="text-[11px] font-ui text-espresso/75 font-medium leading-snug px-2">
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Configuration & Purchase ── */}
          <div className="lg:col-span-5 flex flex-col gap-7 bg-white border border-warm-border p-6 sm:p-8 shadow-luxury">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="section-label">{product.categoryName}</span>
                <span className="text-warm-border">·</span>
                <span className="font-mono text-xs text-espresso/45">{product.sku}</span>
                {product.stock !== undefined && product.stock > 0 && (
                  <span className="ml-auto text-[10px] font-ui uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5">
                    In Stock ({product.stock})
                  </span>
                )}
              </div>

              <h1 className="font-display text-3xl sm:text-4xl text-espresso tracking-tight leading-tight mb-3">
                {product.name}
              </h1>

              {product.rating !== undefined && product.rating !== null && (
                <div className="flex items-center gap-2.5">
                  <StarRating rating={product.rating} />
                  <span className="text-xs font-ui text-espresso/65">
                    {product.rating.toFixed(1)}{" "}
                    <span className="text-espresso/45">({product.reviewCount ?? 0} reviews)</span>
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="pb-6 border-b border-warm-border">
              <p className="text-[10px] font-ui text-espresso/45 uppercase tracking-widest mb-1.5">
                {selectedWoodTypeId || selectedFabric ? "Configured Price" : "Studio Price"}
              </p>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="font-display text-4xl font-semibold text-espresso">
                  {formatPrice(displayPrice)}
                </span>
                {product.offerPrice && product.offerPrice < product.basePrice && (
                  <span className="font-ui text-lg text-espresso/40 line-through">
                    {formatPrice(product.basePrice)}
                  </span>
                )}
                {priceDiff !== null && (
                  <span className={cn("text-xs font-ui font-medium", priceDiff > 0 ? "text-espresso/60" : "text-emerald-700")}>
                    {priceDiff > 0
                      ? `(+${formatPrice(priceDiff)} for ${selectedWood!.name})`
                      : `(−${formatPrice(Math.abs(priceDiff))} with ${selectedWood!.name})`}
                  </span>
                )}
              </div>
              {product.dimensionsText && (
                <p className="text-xs font-ui text-espresso/60 mt-2">
                  Standard Dimensions: <strong className="text-espresso">{product.dimensionsText}</strong>
                </p>
              )}
            </div>

            {/* Wood Swatch Selector */}
            {product.availableWoods && product.availableWoods.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="section-label">Wood Species Swatch</p>
                  {selectedWoodTypeName && (
                    <span className="text-xs font-ui font-semibold text-espresso">{selectedWoodTypeName}</span>
                  )}
                </div>

                <WoodSelector
                  woods={product.availableWoods}
                  selectedId={selectedWoodTypeId}
                  onChange={handleWoodChange}
                />

                {showCare && careText && (
                  <div className="mt-3 flex gap-2.5 p-3.5 bg-alabaster border border-warm-border">
                    <Info size={14} className="text-champagne flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-ui text-espresso/75 leading-relaxed">{careText}</p>
                  </div>
                )}
              </div>
            )}

            {/* Polish & Finish Swatches */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="section-label">Polish &amp; Finish Swatch</p>
                {selectedFinish && (
                  <span className="text-xs font-ui font-semibold text-espresso">{selectedFinish}</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {availableFinishSwatches.map((finish) => {
                  const isSelected = selectedFinish === finish.label;
                  return (
                    <button
                      key={finish.id}
                      type="button"
                      onClick={() => setCustomization("Finish", finish.label)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2.5 border text-left transition-all duration-200",
                        isSelected
                          ? "border-espresso bg-espresso text-white"
                          : "border-warm-border hover:border-champagne bg-white text-espresso"
                      )}
                    >
                      <span
                        className="w-4 h-4 flex-shrink-0 rounded-full border border-black/15"
                        style={{ backgroundColor: finish.hex }}
                      />
                      <span className="text-xs font-ui font-medium leading-tight">{finish.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fabric / Upholstery Swatches */}
            {availableFabricSwatches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="section-label">Fabric / Upholstery Swatch</p>
                  {selectedFabric && (
                    <span className="text-xs font-ui font-semibold text-espresso">{selectedFabric}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableFabricSwatches.map((fab) => {
                    const isSelected = selectedFabric === fab.label;
                    return (
                      <button
                        key={fab.id}
                        type="button"
                        onClick={() => setCustomization("Fabric", fab.label)}
                        className={cn(
                          "inline-flex items-center gap-2 px-3 py-2 border text-xs font-ui transition-all",
                          isSelected
                            ? "border-champagne bg-bronze-50 text-espresso font-semibold"
                            : "border-warm-border bg-white text-espresso/75 hover:border-champagne"
                        )}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-black/15 flex-shrink-0"
                          style={{ backgroundColor: fab.hex }}
                        />
                        <span>{fab.label}</span>
                        {fab.add > 0 && <span className="text-[10px] text-champagne">+{formatPrice(fab.add)}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom Size */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="section-label">Custom Dimensions (Optional)</p>
                <div className="flex border border-warm-border overflow-hidden">
                  {(["in", "cm"] as const).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => handleUnitChange(u)}
                      className={cn(
                        "px-3 py-1 text-xs font-ui font-semibold transition-colors",
                        sizeUnit === u ? "bg-espresso text-white" : "text-espresso/60 hover:text-espresso"
                      )}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {(["length", "width", "height"] as const).map((dim) => (
                  <div key={dim}>
                    <label className="block text-[10px] font-ui text-espresso/50 uppercase tracking-widest mb-1">
                      {dim}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        placeholder="–"
                        value={displaySize[dim]}
                        onChange={(e) => handleSizeChange(dim, e.target.value)}
                        onBlur={() => handleSizeBlur(dim)}
                        className="input-luxury pr-8 text-center text-sm py-2"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-espresso/45 pointer-events-none">
                        {sizeUnit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <p className="section-label mb-2">Personalisation Notes</p>
              <textarea
                rows={2}
                value={additionalNotes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Carving details, soft-close hardware, delivery floor…"
                className="input-luxury resize-none text-sm"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-1">
              <button
                type="button"
                onClick={handleAddToCart}
                className="btn-primary w-full py-3.5 text-xs"
              >
                <ShoppingBag size={15} />
                {addedToCart ? "Added to Cart ✓" : "Add to Cart"}
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp w-full py-3.5 text-xs uppercase tracking-wider font-semibold"
              >
                <MessageCircle size={17} />
                Chat with Square Cube Furniture on WhatsApp
              </a>

              <button
                type="button"
                onClick={handleWishlist}
                className={cn(
                  "btn-outline w-full py-3 text-xs",
                  inWishlist && "bg-espresso text-white"
                )}
              >
                <Heart size={15} className={cn(inWishlist && "fill-white text-white")} />
                {inWishlist ? "Saved to Wishlist" : "Save to Wishlist"}
              </button>
            </div>

            <p className="text-xs font-ui text-espresso/60 leading-relaxed border-t border-warm-border pt-5">
              {product.description || product.shortDescription}
            </p>
          </div>
        </div>
      </div>

      <RoomPreviewModal
        isOpen={roomAROpen}
        onClose={() => setRoomAROpen(false)}
        productName={product.name}
        productImage={product.primaryImage}
        selectedWood={selectedWoodTypeName}
        selectedFinish={selectedFinish}
      />
    </div>
  );
}
