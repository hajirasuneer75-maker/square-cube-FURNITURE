import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { NAVIGATION_CATEGORIES } from "@/lib/constants/categories";
import { fetchCategoriesWithFallback, fetchProductsWithFallback } from "@/lib/api";
import CategorySidebar from "@/components/layout/CategorySidebar";
import ProductCard from "@/components/product/ProductCard";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return NAVIGATION_CATEGORIES
    .filter((c) => c.slug !== "custom")
    .map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cats = await fetchCategoriesWithFallback();
  const cat = cats.find((c) => c.slug === params.slug);
  if (!cat) return { title: "Category Not Found" };
  return {
    title: `${cat.name} Collection`,
    description: cat.description ?? `${cat.name} furniture by Square Cube Furniture.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  if (params.slug === "custom") redirect("/custom-furniture");

  const [cats, allProducts] = await Promise.all([
    fetchCategoriesWithFallback(),
    fetchProductsWithFallback(`category=${encodeURIComponent(params.slug)}`),
  ]);

  const cat =
    cats.find((c) => c.slug === params.slug) ??
    NAVIGATION_CATEGORIES.find((c) => c.slug === params.slug);
  if (!cat) notFound();

  const products = allProducts.filter((p) => p.categorySlug === params.slug);

  return (
    <div className="bg-alabaster min-h-screen">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="flex items-center gap-2 text-xs font-ui text-espresso/50 mb-8 flex-wrap">
          <Link href="/" className="hover:text-espresso transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-espresso transition-colors">Collections</Link>
          <span>/</span>
          <span className="text-espresso">{cat.name}</span>
        </nav>

        <div className="mb-8">
          <p className="section-label mb-2">{cat.icon} {cat.name}</p>
          <h1 className="font-display text-4xl lg:text-5xl font-semibold text-espresso">
            {cat.name}
          </h1>
          {cat.description && (
            <p className="font-ui text-espresso/60 mt-2 max-w-xl">{cat.description}</p>
          )}
        </div>

        <div className="flex gap-8">
          <div className="hidden lg:block">
            <CategorySidebar activeSlug={params.slug} />
          </div>

          <div className="flex-1 min-w-0">
            {products.length === 0 ? (
              <div className="py-24 text-center border border-dashed border-warm-border bg-white">
                <p className="font-display text-2xl text-espresso/50 mb-2">
                  Custom {cat.name} Made to Order
                </p>
                <p className="text-sm font-ui text-espresso/55 mb-8">
                  We craft custom {cat.name.toLowerCase()} pieces in Nilambur Teak, Mahogany, and Rosewood.
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Link href="/products" className="btn-outline text-xs py-2.5 px-6">
                    View All Collections
                  </Link>
                  <Link href="/custom-furniture" className="btn-champagne text-xs py-2.5 px-6">
                    Open Custom Studio
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm font-ui text-espresso/55 mb-5">
                  {products.length} piece{products.length !== 1 ? "s" : ""}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}

            <div className="mt-12 p-8 bg-espresso text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-display text-2xl font-semibold mb-1">
                  Want custom dimensions for {cat.name.toLowerCase()}?
                </p>
                <p className="text-sm font-ui text-white/60">
                  Calculate an instant estimate in the Square Cube Furniture Custom Studio.
                </p>
              </div>
              <Link href="/custom-furniture" className="btn-champagne flex-shrink-0 text-xs">
                Open Custom Studio →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
