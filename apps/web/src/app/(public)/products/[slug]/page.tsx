import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetailClient from "@/components/product/ProductDetailClient";
import { fetchProductBySlugWithFallback, fetchProductsWithFallback } from "@/lib/api";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const products = await fetchProductsWithFallback();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await fetchProductBySlugWithFallback(params.slug);
  if (!product) return { title: "Piece Not Found" };
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: `${product.name} | Square Cube Furniture`,
      description: product.shortDescription,
      images: [{ url: product.primaryImage, width: 800, height: 600 }],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await fetchProductBySlugWithFallback(params.slug);
  if (!product) notFound();
  return <ProductDetailClient product={product} />;
}
