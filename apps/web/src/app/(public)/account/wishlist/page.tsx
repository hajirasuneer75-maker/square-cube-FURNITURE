"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2, ArrowRight, MessageCircle } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { formatPrice } from "@/lib/utils";

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { whatsappNumber } = useSettingsStore();

  if (items.length === 0) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <Heart size={52} className="text-stone-200 mx-auto mb-6" />
        <h1 className="font-display text-2xl text-stone-900 mb-2">Your wishlist is empty</h1>
        <p className="text-stone-500 mb-8 text-sm">
          Browse our collection and save the pieces you love — they&apos;ll appear here.
        </p>
        <Link href="/products" className="btn-primary">
          Browse Products
        </Link>
      </div>
    );
  }

  const WA_NUMBER = whatsappNumber;
  const waText = encodeURIComponent(
    `Hello Square Cube! 👋\n\nI'm interested in the following items from my wishlist:\n\n${items
      .map((i) => `• ${i.productName} — ${formatPrice(i.basePrice)}`)
      .join("\n")}\n\nPlease provide more details and pricing.`
  );

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="section-label mb-2">Saved Items</p>
          <h1 className="font-display text-3xl font-semibold text-stone-900">My Wishlist</h1>
        </div>
        <button
          onClick={clearWishlist}
          className="text-xs text-stone-400 hover:text-red-500 transition-colors"
        >
          Clear all ({items.length})
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-10">
        {items.map((item) => (
          <div
            key={item.productId}
            className="bg-white border border-stone-200 group relative shadow-card hover:shadow-card-hover transition-shadow"
          >
            {/* Image */}
            <Link
              href={`/products/${item.slug}`}
              className="block relative aspect-[4/3] overflow-hidden bg-stone-100"
            >
              <Image
                src={item.primaryImage}
                alt={item.productName}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </Link>

            {/* Remove button */}
            <button
              onClick={() => removeItem(item.productId)}
              className="absolute top-3 right-3 p-2 bg-white/90 text-stone-400 hover:text-red-500 transition-colors"
              aria-label="Remove from wishlist"
            >
              <Trash2 size={14} />
            </button>

            {/* Card body */}
            <div className="p-4">
              <p className="section-label mb-1">{item.categoryName}</p>
              <Link href={`/products/${item.slug}`}>
                <h3 className="font-display text-base font-semibold text-stone-900 hover:text-stone-700 transition-colors line-clamp-1 mb-3">
                  {item.productName}
                </h3>
              </Link>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-stone-400 uppercase tracking-wide">From</p>
                  <p className="font-display text-base font-semibold text-stone-900">
                    {formatPrice(item.basePrice)}
                  </p>
                </div>
                <Link
                  href={`/products/${item.slug}`}
                  className="flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors"
                >
                  View <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* WhatsApp CTA */}
      <div className="bg-stone-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 justify-between">
        <div>
          <p className="font-display text-lg font-semibold mb-1">
            Interested in {items.length > 1 ? "these pieces" : "this piece"}?
          </p>
          <p className="text-stone-400 text-sm">
            Chat with us on WhatsApp to get a custom quote for everything on your wishlist.
          </p>
        </div>
        <a
          href={`https://wa.me/${WA_NUMBER}?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp flex-shrink-0"
        >
          <MessageCircle size={18} />
          Get Quote on WhatsApp
        </a>
      </div>
    </div>
  );
}
