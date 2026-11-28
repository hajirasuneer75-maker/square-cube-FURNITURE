import type { Metadata } from "next";
import ProductsClient from "@/components/product/ProductsClient";
import { fetchProductsWithFallback } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Collections",
  description: "Explore handcrafted teak, mahogany, and rosewood collections at Square Cube Furniture.",
};

export default async function ProductsPage() {
  const products = await fetchProductsWithFallback();
  return <ProductsClient initialProducts={products} />;
}
