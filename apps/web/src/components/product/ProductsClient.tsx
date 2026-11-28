"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CategorySidebar from "@/components/layout/CategorySidebar";
import ProductCard from "@/components/product/ProductCard";
import FilterBar from "@/components/product/FilterBar";
import AISearch from "@/components/product/AISearch";
import { NAVIGATION_CATEGORIES } from "@/lib/constants/categories";
import type { Product, ProductFilters } from "@/types";

function ProductsInner({ initialProducts }: { initialProducts: Product[] }) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") ?? undefined;
  const searchParam = searchParams.get("search") ?? undefined;
  const woodParam = searchParams.get("woodType") ?? undefined;

  const [filters, setFilters] = useState<ProductFilters>({
    sort: "featured",
    search: searchParam,
    woodType: woodParam,
  });

  function handleFilterChange(patch: Partial<ProductFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }));
  }

  const activeCategory = categoryParam ?? filters.category;
  const activeCategoryName = activeCategory
    ? NAVIGATION_CATEGORIES.find((c) => c.slug === activeCategory)?.name ?? activeCategory
    : undefined;

  const products = useMemo(() => {
    let list = [...initialProducts];

    if (activeCategory) {
      list = list.filter((p) => p.categorySlug === activeCategory);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.availableWoods?.some((w) => w.name.toLowerCase().includes(q))
      );
    }

    if (filters.woodType) {
      list = list.filter((p) =>
        p.availableWoods?.some((w) => w.name.toLowerCase().includes(filters.woodType!.toLowerCase()))
      );
    }

    if (filters.minPrice !== undefined) {
      list = list.filter((p) => (p.offerPrice ?? p.basePrice) >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      list = list.filter((p) => (p.offerPrice ?? p.basePrice) <= filters.maxPrice!);
    }

    switch (filters.sort) {
      case "price_asc":
        list.sort((a, b) => (a.offerPrice ?? a.basePrice) - (b.offerPrice ?? b.basePrice));
        break;
      case "price_desc":
        list.sort((a, b) => (b.offerPrice ?? b.basePrice) - (a.offerPrice ?? a.basePrice));
        break;
      case "newest":
        list.reverse();
        break;
      case "featured":
      default:
        list.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
    }

    return list;
  }, [initialProducts, filters, activeCategory]);

  return (
    <div className="bg-alabaster min-h-screen">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <p className="section-label mb-2">Square Cube Furniture · Collections</p>
          <h1 className="font-display text-4xl lg:text-5xl font-semibold text-espresso mb-5">
            {activeCategoryName ? activeCategoryName : "All Collections"}
          </h1>
          <div className="max-w-xl">
            <AISearch products={initialProducts} />
          </div>
        </div>

        <div className="flex gap-8">
          <div className="hidden lg:block">
            <CategorySidebar activeSlug={activeCategory} />
          </div>

          <div className="flex-1 min-w-0">
            <FilterBar
              totalCount={products.length}
              filters={filters}
              onFilterChange={handleFilterChange}
            />

            {products.length === 0 ? (
              <div className="py-24 text-center bg-white border border-warm-border mt-6">
                <p className="font-display text-2xl text-espresso/50 mb-2">No matching pieces</p>
                <p className="text-sm font-ui text-espresso/50">Try clearing filters or open Custom Studio.</p>
                <button
                  onClick={() => setFilters({ sort: "featured" })}
                  className="mt-6 btn-outline text-xs py-2.5 px-6"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  return (
    <Suspense>
      <ProductsInner initialProducts={initialProducts} />
    </Suspense>
  );
}
