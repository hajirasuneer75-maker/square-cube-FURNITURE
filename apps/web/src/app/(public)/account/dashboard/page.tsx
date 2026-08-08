"use client";

import Link from "next/link";
import { Heart, MessageCircle, Package, ArrowRight } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useSettingsStore } from "@/store/useSettingsStore";

export default function AccountDashboardPage() {
  const { items } = useWishlistStore();
  const { whatsappNumber } = useSettingsStore();

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-xl">
        <p className="section-label mb-2">My Account</p>
        <h1 className="font-display text-3xl font-semibold text-stone-900 mb-2">
          Account Dashboard
        </h1>
        <p className="text-stone-500 text-sm mb-10">
          Manage your saved items and track your custom furniture orders.
        </p>

        {/* Quick links */}
        <div className="space-y-3 mb-10">
          <Link
            href="/account/wishlist"
            className="flex items-center justify-between p-5 bg-white border border-stone-200 hover:border-stone-400 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-50 flex items-center justify-center flex-shrink-0">
                <Heart size={18} className="text-red-400" />
              </div>
              <div>
                <p className="font-semibold text-stone-900 text-sm">My Wishlist</p>
                <p className="text-xs text-stone-400 mt-0.5">
                  {items.length} saved item{items.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <ArrowRight size={16} className="text-stone-300 group-hover:text-stone-600 transition-colors" />
          </Link>

          <Link
            href="/customize"
            className="flex items-center justify-between p-5 bg-white border border-stone-200 hover:border-stone-400 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Package size={18} className="text-amber-500" />
              </div>
              <div>
                <p className="font-semibold text-stone-900 text-sm">New Custom Order</p>
                <p className="text-xs text-stone-400 mt-0.5">
                  Describe your dream furniture and we&apos;ll build it
                </p>
              </div>
            </div>
            <ArrowRight size={16} className="text-stone-300 group-hover:text-stone-600 transition-colors" />
          </Link>

          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello Square Cube! I would like to track my order.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-5 bg-white border border-stone-200 hover:border-stone-400 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-50 flex items-center justify-center flex-shrink-0">
                <MessageCircle size={18} className="text-green-500" />
              </div>
              <div>
                <p className="font-semibold text-stone-900 text-sm">Track My Order</p>
                <p className="text-xs text-stone-400 mt-0.5">
                  Chat with us on WhatsApp for order updates
                </p>
              </div>
            </div>
            <ArrowRight size={16} className="text-stone-300 group-hover:text-stone-600 transition-colors" />
          </a>
        </div>

        <div className="p-4 bg-stone-50 border border-stone-200">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
            How ordering works
          </p>
          <ol className="space-y-1.5 text-sm text-stone-600 list-decimal list-inside">
            <li>Submit a custom order request or browse our collection</li>
            <li>Our team reviews and reaches out within 2–3 hours on WhatsApp</li>
            <li>Finalise design, wood type, dimensions and pricing</li>
            <li>We craft your piece and deliver pan-India (15–30 days)</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
