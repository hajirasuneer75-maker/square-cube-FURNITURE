import type { Metadata } from "next";
import CustomStudioClient from "@/components/customize/CustomStudioClient";
import { fetchEstimatorRatesWithFallback } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Custom Studio & Live Price Estimator",
  description:
    "Configure furniture type, Kerala wood species, finish, and dimensions for a live INR price estimate at Square Cube Furniture.",
};

export default async function CustomFurniturePage() {
  const rates = await fetchEstimatorRatesWithFallback();
  return <CustomStudioClient initialRates={rates} />;
}
