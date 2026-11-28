import type { Metadata } from "next";
import MaintenanceClient from "@/components/maintenance/MaintenanceClient";

export const metadata: Metadata = {
  title: "Maintenance & Care",
  description:
    "Book furniture polishing, PU refinishing, sofa re-upholstery, hinge repair, termite treatment, and dismantling/shifting with Square Cube Furniture.",
};

export default function MaintenancePage() {
  return <MaintenanceClient />;
}
