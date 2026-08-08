"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, ChevronRight } from "lucide-react";
import { NAVIGATION_CATEGORIES } from "@/lib/constants/categories";
import { useSettingsStore } from "@/store/useSettingsStore";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { whatsappNumber } = useSettingsStore();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 max-w-[90vw] bg-white flex flex-col",
          "animate-slide-in-left"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div>
            <p className="font-display text-lg font-semibold text-stone-900">Square Cube</p>
            <p className="text-[10px] tracking-[0.15em] uppercase text-gold-600">Bespoke Furniture</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 transition-colors rounded-sm"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Category List */}
        <div className="flex-1 overflow-y-auto py-4">
          <p className="px-5 mb-2 section-label">Browse Categories</p>

          <nav className="space-y-0.5 px-3">
            <Link
              href="/products"
              className="flex items-center justify-between px-3 py-3 rounded-sm text-sm text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors group"
              onClick={onClose}
            >
              <span className="flex items-center gap-3">
                <span className="text-base">🛒</span>
                <span className="font-medium">All Products</span>
              </span>
              <ChevronRight size={14} className="text-stone-300 group-hover:text-stone-500" />
            </Link>

            {NAVIGATION_CATEGORIES.filter((c) => c.slug !== "custom").map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="flex items-center justify-between px-3 py-3 rounded-sm text-sm text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors group"
                onClick={onClose}
              >
                <span className="flex items-center gap-3">
                  <span className="text-base leading-none">{cat.icon}</span>
                  <span className="font-medium">{cat.name}</span>
                </span>
                <ChevronRight size={14} className="text-stone-300 group-hover:text-stone-500" />
              </Link>
            ))}
          </nav>

          <div className="mx-5 my-4 h-px bg-stone-100" />

          <nav className="space-y-0.5 px-3">
            {[
              { href: "/customize", icon: "✏️", label: "Custom Furniture" },
              { href: "/gallery",   icon: "🖼️", label: "Gallery" },
              { href: "/faq",       icon: "❓", label: "FAQ" },
              { href: "/about",     icon: "ℹ️",  label: "About Us" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between px-3 py-3 rounded-sm text-sm text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors group"
                onClick={onClose}
              >
                <span className="flex items-center gap-3">
                  <span className="text-base leading-none">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </span>
                <ChevronRight size={14} className="text-stone-300 group-hover:text-stone-500" />
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-100 space-y-3">
          <Link
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello Square Cube! I'd like to enquire about furniture.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp w-full text-sm py-3"
            onClick={onClose}
          >
            <WhatsAppIcon className="w-4 h-4" />
            Chat on WhatsApp
          </Link>

          <div className="flex gap-2">
            <Link
              href="/login"
              className="flex-1 btn-outline text-sm py-2.5 text-center"
              onClick={onClose}
            >
              Login
            </Link>
            <Link
              href="/register"
              className="flex-1 btn-primary text-sm py-2.5 text-center"
              onClick={onClose}
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
