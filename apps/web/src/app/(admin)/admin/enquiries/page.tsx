import type { Metadata } from "next";
import EnquiriesManager from "@/components/admin/EnquiriesManager";

export const metadata: Metadata = { title: "Enquiries | Square Cube Admin" };

export default function AdminEnquiriesPage() {
  return (
    <div className="flex flex-col h-full">
      <EnquiriesManager />
    </div>
  );
}
