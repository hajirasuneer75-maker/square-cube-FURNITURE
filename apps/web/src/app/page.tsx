import HomeClient from "@/components/home/HomeClient";
import {
  fetchCategoriesWithFallback,
  fetchEstimatorRatesWithFallback,
  fetchFeaturedProductsWithFallback,
} from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featuredProducts, estimatorRates] = await Promise.all([
    fetchCategoriesWithFallback(),
    fetchFeaturedProductsWithFallback(),
    fetchEstimatorRatesWithFallback(),
  ]);

  return (
    <HomeClient
      categories={categories}
      featuredProducts={featuredProducts}
      estimatorRates={estimatorRates}
    />
  );
}
