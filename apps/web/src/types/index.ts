// ─── Core Domain Types ────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  icon?: string | null;
  subcategories?: Category[];
  _count?: { products: number };
}

export interface WoodType {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  priceModifier: number;
  priceModifierType: "MULTIPLIER" | "FIXED_ADD" | "FIXED_PRICE";
  imageUrl?: string | null;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string | null;
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
  offerPrice?: number | null;
  sku: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  images: ProductImage[];
  primaryImage: string;
  isFeatured: boolean;
  isActive: boolean;
  manufacturingTime?: string | null;
  deliveryTime?: string | null;
  warranty?: string | null;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  dimensionsText?: string | null;
  finishSwatches?: string[];
  fabricSwatches?: string[];
  stock?: number;
  weight?: number | null;
  careInstructions?: string | null;
  availableWoods?: WoodType[];
  rating?: number | null;
  reviewCount?: number;
  tags?: string[];
}

export interface EstimatorRate {
  id: string;
  material: string;
  ratePerSqFt: number;
  description?: string | null;
  isActive: boolean;
}

export interface MaintenanceTicket {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  city?: string | null;
  serviceType: string;
  furnitureItem: string;
  issueDescription: string;
  damagePhotos: string[];
  preferredDate?: string | null;
  status: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  adminNotes?: string | null;
  quotedPrice?: number | null;
  createdAt: string;
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
