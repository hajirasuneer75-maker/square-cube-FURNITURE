import type { Metadata } from "next";
import AIStylistClient from "@/components/ai/AIStylistClient";

export const metadata: Metadata = {
  title: "AI Room Stylist",
  description:
    "Upload your room photo and get instant wood, finish, upholstery, and furniture recommendations from Square Cube Furniture using free Google Gemini AI.",
};

export default function AIStylistPage() {
  return <AIStylistClient />;
}
