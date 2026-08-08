// ─── Core Domain Types ────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
  subcategories?: Category[];
}

export interface WoodType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  priceModifier: number;
  priceModifierType: "MULTIPLIER" | "FIXED_ADD" | "FIXED_PRICE";
  imageUrl?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  angle: "FRONT" | "BACK" | "LEFT" | "RIGHT" | "TOP" | "DETAIL" | "LIFESTYLE";
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  basePrice: number;
  sku: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  images: ProductImage[];
  primaryImage: string;
  isFeatured: boolean;
  isActive: boolean;
  manufacturingTime?: string;
  deliveryTime?: string;
  warranty?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  weight?: number;
  careInstructions?: string;
  availableWoods?: WoodType[];
  rating?: number;
  reviewCount?: number;
  tags?: string[];
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export interface WishlistItem {
  productId: string;
  productName: string;
  basePrice: number;
  primaryImage: string;
  slug: string;
  categoryName: string;
  addedAt: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  role: "CUSTOMER" | "ADMIN";
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export type SortOption = "featured" | "price_asc" | "price_desc" | "newest";

export interface ProductFilters {
  category?: string;
  woodType?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: SortOption;
  search?: string;
  page?: number;
  pageSize?: number;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
