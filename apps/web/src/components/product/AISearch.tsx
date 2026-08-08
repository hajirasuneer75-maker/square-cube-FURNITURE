"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

interface Recommendation {
  slug:   string;
  reason: string;
}

interface AISearchProps {
  products: Product[];
}

export default function AISearch({ products }: AISearchProps) {
  const [query,   setQuery]   = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Array<{ product: Product; reason: string }> | null>(null);
  const [error,   setError]   = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 3) {
      setResults(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/recommend", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ query: q }),
      });

      const json = await res.json() as {
        success: boolean;
        data?:   { recommendations: Recommendation[] };
        error?:  string;
      };

      if (!json.success || !json.data) {
        setError(json.error ?? "Search failed.");
        setResults(null);
        return;
      }

      const matched = json.data.recommendations
        .map((rec) => {
          const product = products.find((p) => p.slug === rec.slug);
          return product ? { product, reason: rec.reason } : null;
        })
        .filter((r): r is { product: Product; reason: string } => r !== null);

      setResults(matched);
    } catch {
      setError("Unable to reach AI service.");
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, [products]);

  function handleInputChange(value: string) {
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 600);
  }

  function clearSearch() {
    setQuery("");
    setResults(null);
    setError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }

  const primaryImage = (p: Product) =>
    p.images?.find((i) => i.isPrimary)?.url ?? p.images?.[0]?.url ?? "/placeholder-furniture.jpg";

  return (
    <div className="relative w-full">
      {/* Search input */}
      <div className="relative">
        {/* Search icon */}
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          {loading ? (
            <svg className="animate-spin h-4 w-4 text-gold-600" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4 text-stone-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        {/* Sparkle badge */}
        <div className="absolute inset-y-0 left-9 flex items-center pointer-events-none">
          <span className="text-[10px] font-semibold text-gold-600 bg-gold-50 border border-gold-200 rounded px-1 py-0.5 leading-none">
            AI
          </span>
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Describe what you're looking for…"
          className="w-full pl-16 pr-10 py-2.5 text-sm rounded-xl border border-stone-200
                     bg-white text-stone-800 placeholder:text-stone-400
                     focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent
                     transition-shadow"
        />

        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute inset-y-0 right-3 flex items-center text-stone-400 hover:text-stone-600"
            aria-label="Clear search"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Results panel */}
      {results !== null && (
        <div className="mt-3">
          {results.length === 0 ? (
            <p className="text-sm text-stone-500 text-center py-6">
              No matching products found. Try a different description.
            </p>
          ) : (
            <>
              <p className="text-xs font-medium text-stone-500 mb-3 uppercase tracking-wide">
                AI-matched products ({results.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.map(({ product, reason }) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="flex gap-3 p-3 rounded-xl border border-stone-200
                               bg-white hover:border-gold-300 hover:shadow-sm
                               transition-all group"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-stone-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={primaryImage(product)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-stone-800 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gold-700 font-medium mt-0.5">
                        {formatPrice(product.basePrice)}
                      </p>
                      <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                        {reason}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
