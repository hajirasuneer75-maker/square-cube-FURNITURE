"use client";

import { useState, useRef, useEffect } from "react";
import { SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductFilters, SortOption } from "@/types";

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Featured",          value: "featured"   },
  { label: "Price: Low to High", value: "price_asc"  },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Newest",            value: "newest"     },
];

const WOOD_OPTIONS = [
  "Teak", "Sheesham", "Oak", "Mahogany", "Plywood", "MDF", "Engineered Wood",
];

const PRICE_RANGES: { label: string; min?: number; max?: number }[] = [
  { label: "Under ₹20,000",          max: 20000    },
  { label: "₹20,000 – ₹50,000",      min: 20000,   max: 50000    },
  { label: "₹50,000 – ₹1,00,000",    min: 50000,   max: 100000   },
  { label: "Above ₹1,00,000",        min: 100000   },
];

interface DropdownProps {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  align?: "left" | "right";
}

function Dropdown({ label, isOpen, onToggle, isActive, children, align = "left" }: DropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOut(e: MouseEvent) {
      if (isOpen && ref.current && !ref.current.contains(e.target as Node)) {
        onToggle();
      }
    }
    document.addEventListener("mousedown", onOut);
    return () => document.removeEventListener("mousedown", onOut);
  }, [isOpen, onToggle]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 border text-sm transition-colors",
          isActive
            ? "border-stone-900 bg-stone-900 text-white"
            : "border-stone-200 text-stone-700 hover:border-stone-400"
        )}
      >
        {label}
        <ChevronDown
          size={14}
          className={cn("transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute top-full mt-1 min-w-[180px] bg-white border border-stone-200 shadow-lg z-30 animate-slide-down",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface FilterBarProps {
  totalCount: number;
  filters: ProductFilters;
  onFilterChange: (patch: Partial<ProductFilters>) => void;
}

type OpenDropdown = "sort" | "wood" | "price" | null;

export default function FilterBar({ totalCount, filters, onFilterChange }: FilterBarProps) {
  const [open, setOpen] = useState<OpenDropdown>(null);

  function toggle(name: OpenDropdown) {
    setOpen((prev) => (prev === name ? null : name));
  }

  const currentSort = SORT_OPTIONS.find((o) => o.value === filters.sort) ?? SORT_OPTIONS[0];
  const hasFilters = !!(filters.woodType || filters.minPrice !== undefined || filters.maxPrice !== undefined);

  function clearFilters() {
    onFilterChange({ woodType: undefined, minPrice: undefined, maxPrice: undefined });
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
      {/* Count */}
      <p className="text-sm text-stone-500 flex-shrink-0">
        <span className="font-semibold text-stone-900">{totalCount}</span>{" "}
        {totalCount === 1 ? "product" : "products"}
      </p>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">

        {/* Wood */}
        <Dropdown
          label={filters.woodType ? `Wood: ${filters.woodType}` : "Wood Type"}
          isOpen={open === "wood"}
          onToggle={() => toggle("wood")}
          isActive={!!filters.woodType}
        >
          <button
            onClick={() => { onFilterChange({ woodType: undefined }); setOpen(null); }}
            className={cn(
              "w-full text-left px-4 py-2.5 text-sm transition-colors",
              !filters.woodType ? "bg-stone-900 text-white" : "text-stone-700 hover:bg-stone-50"
            )}
          >
            All Woods
          </button>
          {WOOD_OPTIONS.map((wood) => (
            <button
              key={wood}
              onClick={() => { onFilterChange({ woodType: wood }); setOpen(null); }}
              className={cn(
                "w-full text-left px-4 py-2.5 text-sm transition-colors",
                filters.woodType === wood
                  ? "bg-stone-900 text-white"
                  : "text-stone-700 hover:bg-stone-50"
              )}
            >
              {wood}
            </button>
          ))}
        </Dropdown>

        {/* Price */}
        <Dropdown
          label="Price Range"
          isOpen={open === "price"}
          onToggle={() => toggle("price")}
          isActive={filters.minPrice !== undefined || filters.maxPrice !== undefined}
        >
          <button
            onClick={() => { onFilterChange({ minPrice: undefined, maxPrice: undefined }); setOpen(null); }}
            className={cn(
              "w-full text-left px-4 py-2.5 text-sm transition-colors",
              filters.minPrice === undefined && filters.maxPrice === undefined
                ? "bg-stone-900 text-white"
                : "text-stone-700 hover:bg-stone-50"
            )}
          >
            All Prices
          </button>
          {PRICE_RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => { onFilterChange({ minPrice: r.min, maxPrice: r.max }); setOpen(null); }}
              className={cn(
                "w-full text-left px-4 py-2.5 text-sm transition-colors",
                filters.minPrice === r.min && filters.maxPrice === r.max
                  ? "bg-stone-900 text-white"
                  : "text-stone-700 hover:bg-stone-50"
              )}
            >
              {r.label}
            </button>
          ))}
        </Dropdown>

        <div className="h-6 w-px bg-stone-200" />

        {/* Sort */}
        <Dropdown
          label={`Sort: ${currentSort.label}`}
          isOpen={open === "sort"}
          onToggle={() => toggle("sort")}
          align="right"
        >
          <div className="flex items-center gap-1 px-4 py-2.5 border-b border-stone-100">
            <SlidersHorizontal size={12} className="text-stone-400" />
            <span className="text-xs text-stone-400 font-medium uppercase tracking-wide">Sort by</span>
          </div>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onFilterChange({ sort: opt.value }); setOpen(null); }}
              className={cn(
                "w-full text-left px-4 py-2.5 text-sm transition-colors",
                filters.sort === opt.value
                  ? "bg-stone-900 text-white"
                  : "text-stone-700 hover:bg-stone-50"
              )}
            >
              {opt.label}
            </button>
          ))}
        </Dropdown>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors ml-1"
          >
            <X size={12} />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
