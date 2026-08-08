"use client";

import Link from "next/link";
import { NAVIGATION_CATEGORIES } from "@/lib/constants/categories";
import { cn } from "@/lib/utils";

interface CategorySidebarProps {
  activeSlug?: string;
}

export default function CategorySidebar({ activeSlug }: CategorySidebarProps) {
  return (
    <aside className="w-56 flex-shrink-0">
      <div className="sticky top-28">
        <p className="section-label px-1 mb-4">Categories</p>

        <nav className="space-y-0.5">
          <Link
            href="/products"
            className={cn(
              "flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors rounded-sm",
              !activeSlug
                ? "bg-stone-900 text-white"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            )}
          >
            <span className="text-base leading-none">🛒</span>
            <span className="font-medium">All Products</span>
          </Link>

          {NAVIGATION_CATEGORIES.filter((c) => c.slug !== "custom").map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              title={cat.description}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors rounded-sm",
                activeSlug === cat.slug
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              )}
            >
              <span className="text-base leading-none">{cat.icon}</span>
              <span className="font-medium">{cat.name}</span>
            </Link>
          ))}
        </nav>

        {/* Custom furniture nudge */}
        <div className="mt-6 p-4 bg-stone-900 text-white">
          <p className="text-xs font-medium text-white mb-1">Need something unique?</p>
          <p className="text-xs text-stone-400 mb-3 leading-relaxed">
            We build furniture to your exact requirements.
          </p>
          <Link
            href="/customize"
            className="text-xs font-medium text-gold-400 hover:text-gold-300 transition-colors underline underline-offset-2"
          >
            Start Custom Order →
          </Link>
        </div>
      </div>
    </aside>
  );
}
