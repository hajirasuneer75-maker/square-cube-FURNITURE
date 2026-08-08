"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CategorySidebar from "@/components/layout/CategorySidebar";
import ProductCard from "@/components/product/ProductCard";
import FilterBar from "@/components/product/FilterBar";
import AISearch from "@/components/product/AISearch";
import { MOCK_PRODUCTS } from "@/lib/constants/mockData";
import { NAVIGATION_CATEGORIES } from "@/lib/constants/categories";
import type { ProductFilters } from "@/types";

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") ?? undefined;

  const [filters, setFilters] = useState<ProductFilters>({ sort: "featured" });

  function handleFilterChange(patch: Partial<ProductFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }));
  }

  const activeCategory = categoryParam ?? filters.category;
  const activeCategoryName = activeCategory
    ? (NAVIGATION_CATEGORIES.find((c) => c.slug === activeCategory)?.name ?? activeCategory)
    : undefined;

  const products = useMemo(() => {
    let list = [...MOCK_PRODUCTS];

    // Category — URL param takes priority over filter state
    if (activeCategory) {
      list = list.filter((p) => p.categorySlug === activeCategory);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q)
      );
    }

    if (filters.woodType) {
      list = list.filter((p) =>
        p.availableWoods?.some((w) => w.name === filters.woodType)
      );
    }

    if (filters.minPrice !== undefined) {
      list = list.filter((p) => p.basePrice >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      list = list.filter((p) => p.basePrice <= filters.maxPrice!);
    }

    switch (filters.sort) {
      case "price_asc":  list.sort((a, b) => a.basePrice - b.basePrice); break;
      case "price_desc": list.sort((a, b) => b.basePrice - a.basePrice); break;
      case "newest":     list.reverse(); break;
      case "featured":
      default:
        list.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
    }

    return list;
  }, [filters, activeCategory]);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="mb-8">
        <p className="section-label mb-2">Explore Our Collection</p>
        <h1 className="font-display text-3xl lg:text-4xl font-semibold text-stone-900 mb-5">
          {activeCategoryName ? activeCategoryName : "All Products"}
        </h1>
        {/* AI-powered natural language search */}
        <div className="max-w-lg">
          <AISearch products={MOCK_PRODUCTS} />
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar — desktop only */}
        <div className="hidden lg:block">
          <CategorySidebar activeSlug={activeCategory} />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <FilterBar
            totalCount={products.length}
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          {products.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-display text-2xl text-stone-300 mb-2">No products found</p>
              <p className="text-sm text-stone-400">Try adjusting or clearing your filters.</p>
              <button
                onClick={() => setFilters({ sort: "featured" })}
                className="mt-6 btn-outline text-sm py-2"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsContent />
    </Suspense>
  );
}
