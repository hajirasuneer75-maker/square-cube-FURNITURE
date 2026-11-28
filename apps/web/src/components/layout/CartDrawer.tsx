"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ShoppingBag, MessageCircle } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { formatPrice, generateWhatsAppUrl } from "@/lib/utils";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, clearCart } = useCartStore();
  const whatsappNumber = useSettingsStore((s) => s.whatsappNumber);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const waMessage = [
    "Hello Square Cube Furniture! 👋",
    "",
    "I would like to order / enquire about the items in my cart:",
    "",
    ...items.map((item, idx) => {
      const details = [item.woodName, item.finishName, item.fabricName].filter(Boolean).join(" · ");
      return `${idx + 1}. *${item.name}* (${item.sku}) × ${item.qty} — ${formatPrice(item.price * item.qty)}${details ? ` [${details}]` : ""}`;
    }),
    "",
    `*Estimated Subtotal:* ${formatPrice(subtotal)}`,
    "",
    "Please share delivery timeline and payment options.",
  ].join("\n");

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-espresso/45 backdrop-blur-sm animate-fade-in"
        onClick={closeCart}
        aria-hidden="true"
      />
      <aside
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-warm-border flex flex-col shadow-luxury-hover"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-warm-border bg-alabaster">
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={18} className="text-champagne" />
            <h2 className="font-display text-xl font-semibold text-espresso">
              Your Selection ({items.reduce((s, i) => s + i.qty, 0)})
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 text-espresso/50 hover:text-espresso transition-colors"
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <ShoppingBag size={44} className="text-warm-border mb-4" />
              <p className="font-display text-2xl text-espresso mb-2">Your cart is empty</p>
              <p className="font-ui text-sm text-espresso/55 mb-6 max-w-xs">
                Explore our handcrafted collections or configure a custom piece in our Studio.
              </p>
              <Link href="/products" onClick={closeCart} className="btn-primary text-xs">
                Explore Collections
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.key} className="flex gap-4 pb-4 border-b border-warm-border">
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={closeCart}
                    className="relative w-20 h-20 flex-shrink-0 bg-alabaster border border-warm-border overflow-hidden"
                  >
                    <Image
                      src={item.primaryImage}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={closeCart}
                        className="font-display text-base font-semibold text-espresso hover:text-champagne transition-colors line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeItem(item.key)}
                        className="text-espresso/30 hover:text-red-500 transition-colors p-1"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {(item.woodName || item.finishName || item.fabricName) && (
                      <p className="font-ui text-[11px] text-espresso/55 mt-0.5">
                        {[item.woodName, item.finishName, item.fabricName].filter(Boolean).join(" · ")}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-warm-border">
                        <button
                          onClick={() => updateQty(item.key, item.qty - 1)}
                          className="p-1.5 text-espresso/60 hover:text-espresso"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2.5 text-xs font-ui font-semibold text-espresso">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.key, item.qty + 1)}
                          className="p-1.5 text-espresso/60 hover:text-espresso"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <p className="font-ui text-sm font-semibold text-espresso">
                        {formatPrice(item.price * item.qty)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-warm-border bg-alabaster space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-ui text-xs uppercase tracking-widest text-espresso/60">
                Estimated Subtotal
              </span>
              <span className="font-display text-2xl font-semibold text-espresso">
                {formatPrice(subtotal)}
              </span>
            </div>
            <a
              href={generateWhatsAppUrl(whatsappNumber, waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp w-full py-3.5 text-xs tracking-wider uppercase font-semibold"
            >
              <MessageCircle size={16} />
              Proceed via Square Cube Furniture WhatsApp
            </a>
            <button
              onClick={clearCart}
              className="w-full text-center text-xs font-ui text-espresso/45 hover:text-red-600 transition-colors"
            >
              Clear selection
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
