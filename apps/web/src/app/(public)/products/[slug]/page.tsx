import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MOCK_PRODUCTS } from "@/lib/constants/mockData";
import ProductDetailClient from "@/components/product/ProductDetailClient";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return MOCK_PRODUCTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const product = MOCK_PRODUCTS.find((p) => p.slug === params.slug);
  if (!product) return { title: "Not Found | Square Cube" };
  return {
    title:       `${product.name} | Square Cube`,
    description: product.shortDescription,
    openGraph: {
      title:       product.name,
      description: product.shortDescription,
      images:      [{ url: product.primaryImage, width: 700, height: 500 }],
    },
  };
}

export default function ProductDetailPage({ params }: Props) {
  const product = MOCK_PRODUCTS.find((p) => p.slug === params.slug);
  if (!product) notFound();
  return <ProductDetailClient product={product} />;
}
