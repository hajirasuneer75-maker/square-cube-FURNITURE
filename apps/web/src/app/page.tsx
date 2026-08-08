import Link from "next/link";
import { NAVIGATION_CATEGORIES } from "@/lib/constants/categories";
import WAButton from "@/components/ui/WAButton";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-stone-900 text-white min-h-[70vh] flex items-center">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <p className="section-label text-gold-400 mb-4">Premium Custom Furniture</p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight max-w-2xl mb-6">
            Furniture Crafted for Your Life
          </h1>
          <p className="text-stone-300 text-lg max-w-xl leading-relaxed mb-8">
            Every piece built to your exact specifications — from premium Indian
            teak to engineered wood. WhatsApp us to start your custom order.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/products" className="btn-primary py-3.5 px-8 text-base">
              Browse Collection
            </Link>
            <Link href="/customize" className="btn-outline border-white text-white hover:bg-white hover:text-stone-900 py-3.5 px-8 text-base">
              Custom Furniture
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="section-label mb-2">What We Make</p>
            <h2 className="font-display text-3xl font-semibold text-stone-900">Browse by Category</h2>
          </div>
          <Link href="/products" className="text-sm font-medium text-stone-600 hover:text-stone-900 underline underline-offset-2 transition-colors hidden sm:block">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {NAVIGATION_CATEGORIES.filter((c) => c.slug !== "custom").map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              title={cat.description}
              className="group flex flex-col items-center gap-2 p-5 bg-white border border-stone-100 hover:border-gold-300 hover:shadow-card transition-all duration-200 text-center"
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900 transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Custom CTA Banner */}
      <section className="bg-stone-100">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <p className="section-label mb-2">Bespoke Service</p>
            <h2 className="font-display text-3xl font-semibold text-stone-900 mb-3">
              Can't Find What You're Looking For?
            </h2>
            <p className="text-stone-600 max-w-lg leading-relaxed">
              Describe your dream furniture and we'll build it for you. Upload
              reference images, choose your wood, set your dimensions — we handle
              the rest.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link href="/customize" className="btn-primary py-3.5 px-8 text-base">
              Start Custom Order
            </Link>
            <WAButton
              text="Hello Square Cube! I'd like to discuss a custom furniture order."
              className="btn-whatsapp py-3.5 px-8 text-base"
            >
              Chat on WhatsApp
            </WAButton>
          </div>
        </div>
      </section>
    </div>
  );
}
