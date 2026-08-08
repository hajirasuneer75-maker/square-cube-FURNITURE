import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { NAVIGATION_CATEGORIES } from "@/lib/constants/categories";
import { MOCK_PRODUCTS } from "@/lib/constants/mockData";
import CategorySidebar from "@/components/layout/CategorySidebar";
import ProductCard from "@/components/product/ProductCard";

interface Props { params: { slug: string } }

export function generateStaticParams() {
  return NAVIGATION_CATEGORIES
    .filter((c) => c.slug !== "custom")
    .map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const cat = NAVIGATION_CATEGORIES.find((c) => c.slug === params.slug);
  if (!cat) return { title: "Not Found | Square Cube" };
  return {
    title:       `${cat.name} Furniture | Square Cube`,
    description: cat.description,
  };
}

export default function CategoryPage({ params }: Props) {
  if (params.slug === "custom") redirect("/customize");

  const cat = NAVIGATION_CATEGORIES.find((c) => c.slug === params.slug);
  if (!cat) notFound();

  const products = MOCK_PRODUCTS.filter((p) => p.categorySlug === params.slug);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-400 mb-8 flex-wrap">
        <Link href="/" className="hover:text-stone-700 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-stone-700 transition-colors">Products</Link>
        <span>/</span>
        <span className="text-stone-600">{cat.name}</span>
      </nav>

      {/* Page header */}
      <div className="mb-8">
        <p className="section-label mb-2">{cat.icon} {cat.name}</p>
        <h1 className="font-display text-3xl lg:text-4xl font-semibold text-stone-900">
          {cat.name}
        </h1>
        {cat.description && (
          <p className="text-stone-500 mt-2 max-w-xl">{cat.description}</p>
        )}
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="hidden lg:block">
          <CategorySidebar activeSlug={params.slug} />
        </div>

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {products.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-stone-200">
              <p className="font-display text-xl text-stone-300 mb-2">
                No products in {cat.name} yet
              </p>
              <p className="text-sm text-stone-400 mb-8">
                We&apos;re adding more pieces soon — or we can build one custom for you.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link href="/products" className="btn-outline text-sm py-2.5 px-5">
                  View All Products
                </Link>
                <Link href="/customize" className="btn-primary text-sm py-2.5 px-5">
                  Custom Order
                </Link>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-stone-400 mb-5">
                {products.length} product{products.length !== 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}

          {/* Custom CTA at bottom */}
          <div className="mt-12 p-6 bg-stone-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold mb-1">Don&apos;t see exactly what you need?</p>
              <p className="text-sm text-stone-400">We build any {cat.name.toLowerCase()} piece to your exact specifications.</p>
            </div>
            <Link href="/customize" className="btn-primary flex-shrink-0">
              Start Custom Order →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
