"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Eye } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { cn, formatPrice, generateWhatsAppUrl } from "@/lib/utils";
import type { Product } from "@/types";

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            className={cn(
              "w-3 h-3",
              i < Math.round(rating) ? "text-gold-400" : "text-stone-200"
            )}
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-[10px] text-stone-400">({count})</span>
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const { whatsappNumber } = useSettingsStore();
  const inWishlist = isInWishlist(product.id);

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleItem({
      productId: product.id,
      productName: product.name,
      basePrice: product.basePrice,
      primaryImage: product.primaryImage,
      slug: product.slug,
      categoryName: product.categoryName,
      addedAt: new Date().toISOString(),
    });
  }

  const waUrl = generateWhatsAppUrl(
    whatsappNumber,
    `Hello Square Cube! 👋\n\nI am interested in: *${product.name}*\nProduct ID: ${product.sku}\n\nPlease provide more details and pricing.`
  );

  return (
    <article
      className="group relative bg-white shadow-card hover:shadow-card-hover transition-shadow duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Image ── */}
      <Link href={`/products/${product.slug}`} className="block relative overflow-hidden aspect-[4/3] bg-stone-100">
        <Image
          src={product.primaryImage}
          alt={product.name}
          fill
          className={cn(
            "object-cover transition-transform duration-700 ease-out",
            hovered ? "scale-105" : "scale-100"
          )}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Hover overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-300",
            hovered ? "opacity-100" : "opacity-0"
          )}
          aria-hidden="true"
        >
          <span className="bg-white text-stone-900 text-xs font-medium tracking-wide px-4 py-2 flex items-center gap-1.5">
            <Eye size={12} />
            View Details
          </span>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {product.isFeatured && (
            <span className="bg-gold-500 text-white text-[10px] font-semibold tracking-wide px-2 py-1">
              FEATURED
            </span>
          )}
          {product.manufacturingTime && (
            <span className="bg-white/90 text-stone-600 text-[10px] font-medium px-2 py-1">
              {product.manufacturingTime}
            </span>
          )}
        </div>
      </Link>

      {/* Wishlist button */}
      <button
        onClick={handleWishlist}
        className={cn(
          "absolute top-3 right-3 p-2 rounded-full transition-all duration-200",
          inWishlist
            ? "bg-red-50 text-red-500 opacity-100"
            : cn(
                "bg-white/90 text-stone-400 hover:text-red-400",
                hovered ? "opacity-100" : "opacity-0"
              )
        )}
        aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart size={16} className={cn(inWishlist && "fill-red-500")} />
      </button>

      {/* ── Card body ── */}
      <div className="p-4">
        <p className="section-label mb-1.5">{product.categoryName}</p>

        <Link href={`/products/${product.slug}`}>
          <h3 className="font-display text-base font-semibold text-stone-900 leading-tight mb-2 hover:text-stone-700 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <p className="text-xs text-stone-500 mb-3 line-clamp-2 leading-relaxed">
          {product.shortDescription}
        </p>

        {product.rating && product.reviewCount && (
          <div className="mb-3">
            <StarRating rating={product.rating} count={product.reviewCount} />
          </div>
        )}

        {/* Wood types */}
        {product.availableWoods && product.availableWoods.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            {product.availableWoods.slice(0, 3).map((wood) => (
              <span
                key={wood.id}
                className="text-[10px] border border-stone-200 text-stone-500 px-2 py-0.5"
              >
                {wood.name}
              </span>
            ))}
            {product.availableWoods.length > 3 && (
              <span className="text-[10px] text-stone-400">
                +{product.availableWoods.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Price + WhatsApp */}
        <div className="flex items-end justify-between mt-auto pt-2 border-t border-stone-50">
          <div>
            <p className="text-[10px] text-stone-400 uppercase tracking-wide">Starting from</p>
            <p className="font-display text-lg font-semibold text-stone-900">
              {formatPrice(product.basePrice)}
            </p>
          </div>

          <Link
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2.5 bg-[#25D366] text-white hover:bg-[#1ebe5d] transition-colors"
            aria-label={`Chat about ${product.name} on WhatsApp`}
          >
            <WhatsAppIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
