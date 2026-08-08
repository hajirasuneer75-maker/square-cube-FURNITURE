import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title:       "Gallery | Square Cube",
  description: "Browse our portfolio of handcrafted custom furniture — beds, dining tables, wardrobes, office setups, and more.",
};

const GALLERY = [
  {
    url:      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop",
    alt:      "Teak sofa with velvet upholstery",
    category: "Living Room",
    span:     "col-span-2",
  },
  {
    url:      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&h=800&fit=crop",
    alt:      "King-size bed with carved headboard",
    category: "Bedroom",
    span:     "row-span-2",
  },
  {
    url:      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=600&fit=crop",
    alt:      "8-seater dining table — solid oak",
    category: "Dining Room",
    span:     "",
  },
  {
    url:      "https://images.unsplash.com/photo-1549488344-cbb6c34a1fd4?w=800&h=600&fit=crop",
    alt:      "Minimalist accent chair",
    category: "Living Room",
    span:     "",
  },
  {
    url:      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&h=600&fit=crop",
    alt:      "Full living room set — sheesham",
    category: "Living Room",
    span:     "col-span-2",
  },
  {
    url:      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&h=600&fit=crop",
    alt:      "Walnut finish dressing table",
    category: "Bedroom",
    span:     "",
  },
  {
    url:      "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&h=600&fit=crop",
    alt:      "Master bedroom with storage bed",
    category: "Bedroom",
    span:     "",
  },
  {
    url:      "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&h=600&fit=crop",
    alt:      "Round dining table — teak with brass inlay",
    category: "Dining Room",
    span:     "",
  },
  {
    url:      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
    alt:      "Open wardrobe system — engineered wood",
    category: "Wardrobes",
    span:     "col-span-2",
  },
  {
    url:      "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800&h=600&fit=crop",
    alt:      "Home office setup — L-shaped desk",
    category: "Office",
    span:     "",
  },
  {
    url:      "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&h=600&fit=crop",
    alt:      "TV unit with floating shelves",
    category: "TV Units",
    span:     "",
  },
];

export default function GalleryPage() {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <p className="section-label mb-2">Our Work</p>
        <h1 className="font-display text-3xl lg:text-4xl font-semibold text-stone-900 mb-3">
          Furniture Gallery
        </h1>
        <p className="text-stone-500 max-w-xl leading-relaxed">
          Every piece you see here was crafted to a client&apos;s exact specifications — custom wood,
          custom size, custom finish. Yours could be next.
        </p>
      </div>

      {/* Gallery grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[220px]">
        {GALLERY.map((img, i) => (
          <div
            key={i}
            className={`relative overflow-hidden bg-stone-100 group ${img.span}`}
          >
            <Image
              src={img.url}
              alt={img.alt}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end">
              <div className="p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span className="text-[10px] font-semibold text-white/70 uppercase tracking-wider">
                  {img.category}
                </span>
                <p className="text-white text-sm font-medium leading-tight mt-0.5">
                  {img.alt}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-16 bg-stone-900 text-white px-8 py-12 text-center">
        <p className="section-label text-gold-400 mb-3">Bespoke Service</p>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-3">
          Like what you see? Let&apos;s build yours.
        </h2>
        <p className="text-stone-400 max-w-md mx-auto text-sm leading-relaxed mb-8">
          Share your vision — a photo, a sketch, or just a description — and our craftsmen will bring
          it to life in premium Indian hardwood.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/customize" className="btn-primary py-3.5 px-8">
            Start Custom Order
          </Link>
          <Link href="/products" className="btn-outline border-stone-500 text-stone-300 hover:bg-stone-800 hover:border-stone-300 py-3.5 px-8">
            Browse Collection
          </Link>
        </div>
      </div>
    </div>
  );
}
