import type { Category, EstimatorRate, Product, ProductImage, WoodType } from "@/types";
import { API_BASE_URL } from "./utils";
import { MOCK_PRODUCTS } from "./constants/mockData";
import { NAVIGATION_CATEGORIES } from "./constants/categories";

export const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  "living-room":   "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
  "bedroom":       "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80",
  "dining-room":   "https://images.unsplash.com/photo-1617098474202-0d0d7e35c993?w=800&q=80",
  "office":        "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80",
  "outdoor":       "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
  "kitchen":       "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
  "wardrobes":     "https://images.unsplash.com/photo-1558997519-83ea9252edc8?w=800&q=80",
  "sofas":         "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80",
  "beds":          "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&q=80",
  "tv-units":      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
  "coffee-tables": "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80",
  "kids":          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
  "dining-tables": "https://images.unsplash.com/photo-1617098474202-0d0d7e35c993?w=800&q=80",
  "storage":       "https://images.unsplash.com/photo-1558997519-83ea9252edc8?w=800&q=80",
  "chairs":        "https://images.unsplash.com/photo-1549488344-cbb6c34a1fd4?w=800&q=80",
};

export const DEFAULT_ESTIMATOR_RATES: EstimatorRate[] = [
  { id: "r1", material: "Nilambur Teak", ratePerSqFt: 2400, description: "Seasoned Kerala Nilambur Teak", isActive: true },
  { id: "r2", material: "Mahogany", ratePerSqFt: 1950, description: "Kiln-dried architectural Mahogany", isActive: true },
  { id: "r3", material: "Rosewood", ratePerSqFt: 2850, description: "Heritage Indian Rosewood", isActive: true },
  { id: "r4", material: "Marine Ply + Veneer", ratePerSqFt: 1350, description: "IS:710 Marine Ply with natural veneer", isActive: true },
  { id: "r5", material: "Sheesham", ratePerSqFt: 1650, description: "Solid seasoned Sheesham wood", isActive: true },
];

export function mapApiProduct(raw: any): Product {
  const images: ProductImage[] = Array.isArray(raw.images) ? raw.images : [];
  const primary =
    images.find((i) => i.isPrimary)?.url ??
    images[0]?.url ??
    raw.primaryImage ??
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80";

  const availableWoods: WoodType[] = Array.isArray(raw.woodVariants)
    ? raw.woodVariants.map((wv: any) => ({
        id: wv.woodType?.id ?? wv.woodTypeId,
        name: wv.woodType?.name ?? "Wood",
        slug: wv.woodType?.slug ?? "wood",
        description: wv.woodType?.description ?? null,
        priceModifier: wv.priceModifier ?? 0,
        priceModifierType: wv.priceModifierType ?? "FIXED_ADD",
        imageUrl: wv.woodType?.imageUrl ?? null,
      }))
    : raw.availableWoods ?? [];

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    shortDescription: raw.shortDescription ?? "",
    description: raw.description ?? "",
    basePrice: raw.basePrice,
    offerPrice: raw.offerPrice ?? null,
    sku: raw.sku,
    categoryId: raw.categoryId ?? raw.category?.id ?? "",
    categoryName: raw.category?.name ?? raw.categoryName ?? "Furniture",
    categorySlug: raw.category?.slug ?? raw.categorySlug ?? "living-room",
    images: images.length > 0 ? images : [{ id: "default", url: primary, isPrimary: true, angle: "FRONT" }],
    primaryImage: primary,
    isFeatured: Boolean(raw.isFeatured),
    isActive: raw.isActive !== false,
    manufacturingTime: raw.manufacturingTime ?? null,
    deliveryTime: raw.deliveryTime ?? null,
    warranty: raw.warranty ?? null,
    dimensionsText: raw.dimensions ?? raw.dimensionsText ?? null,
    finishSwatches: Array.isArray(raw.finishSwatches) ? raw.finishSwatches : [],
    fabricSwatches: Array.isArray(raw.fabricSwatches) ? raw.fabricSwatches : [],
    stock: raw.stock ?? 10,
    weight: raw.weight ?? null,
    careInstructions: raw.careInstructions ?? null,
    availableWoods,
    rating: raw.rating ?? null,
    reviewCount: raw.reviewCount ?? 0,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
  };
}

async function safeFetchJson(url: string, timeoutMs = 3000): Promise<any | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchCategoriesWithFallback(): Promise<Category[]> {
  const json = await safeFetchJson(`${API_BASE_URL}/api/categories`);
  if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
    return json.data.map((c: any) => ({
      ...c,
      imageUrl: c.imageUrl || DEFAULT_CATEGORY_IMAGES[c.slug] || DEFAULT_CATEGORY_IMAGES["living-room"],
    }));
  }
  return NAVIGATION_CATEGORIES.filter((c) => c.slug !== "custom").map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    icon: c.icon,
    imageUrl: DEFAULT_CATEGORY_IMAGES[c.slug] || DEFAULT_CATEGORY_IMAGES["living-room"],
  }));
}

export async function fetchProductsWithFallback(queryString = ""): Promise<Product[]> {
  const url = `${API_BASE_URL}/api/products${queryString ? `?${queryString}` : "?pageSize=50"}`;
  const json = await safeFetchJson(url);
  if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
    return json.data.map(mapApiProduct);
  }
  return MOCK_PRODUCTS;
}

export async function fetchFeaturedProductsWithFallback(): Promise<Product[]> {
  const json = await safeFetchJson(`${API_BASE_URL}/api/products/featured`);
  if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
    return json.data.map(mapApiProduct);
  }
  return MOCK_PRODUCTS.filter((p) => p.isFeatured);
}

export async function fetchProductBySlugWithFallback(slug: string): Promise<Product | null> {
  const json = await safeFetchJson(`${API_BASE_URL}/api/products/${encodeURIComponent(slug)}`);
  if (json?.success && json.data) {
    return mapApiProduct(json.data);
  }
  return MOCK_PRODUCTS.find((p) => p.slug === slug) ?? null;
}

export async function fetchEstimatorRatesWithFallback(): Promise<EstimatorRate[]> {
  const json = await safeFetchJson(`${API_BASE_URL}/api/estimator-rates`);
  if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
    return json.data;
  }
  return DEFAULT_ESTIMATOR_RATES;
}

export async function uploadFileToCloudinary(
  file: File,
  folder = "uploads"
): Promise<{ url?: string; error?: string }> {
  try {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${API_BASE_URL}/api/upload?folder=${encodeURIComponent(folder)}`, {
      method: "POST",
      body: fd,
    });
    const data = await res.json();
    if (!res.ok || !data.url) {
      return { error: data.error || "Upload unavailable" };
    }
    return { url: data.url };
  } catch {
    return { error: "API server unreachable for upload" };
  }
}
