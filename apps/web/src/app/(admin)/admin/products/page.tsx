import type { Metadata } from "next";
import ProductManager from "@/components/admin/ProductManager";

export const metadata: Metadata = { title: "Products | Square Cube Furniture Admin" };

export default function AdminProductsPage() {
  return <ProductManager />;
}
