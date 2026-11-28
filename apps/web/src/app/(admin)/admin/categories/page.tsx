import type { Metadata } from "next";
import CategoryManager from "@/components/admin/CategoryManager";

export const metadata: Metadata = { title: "Categories | Square Cube Furniture Admin" };

export default function AdminCategoriesPage() {
  return <CategoryManager />;
}
