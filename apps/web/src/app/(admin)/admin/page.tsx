"use client";

import { useEffect, useState } from "react";
import { Package, MessageSquare, Wrench, FolderTree } from "lucide-react";
import { MOCK_PRODUCTS } from "@/lib/constants/mockData";
import Link from "next/link";

const QUICK_LINKS = [
  { label: "Manage Categories & Cover Images", href: "/admin/categories" },
  { label: "Add or Edit Products & Swatches", href: "/admin/products" },
  { label: "Review Enquiries & Maintenance Tickets", href: "/admin/enquiries" },
  { label: "Configure Estimator Rates & WhatsApp", href: "/admin/settings" },
  { label: "Open Storefront →", href: "/" },
];

const SYSTEM = [
  { label: "Database", status: "PostgreSQL · Neon Connected", ok: true },
  { label: "AI Room Stylist", status: "Google Gemini Free Tier + Fallback", ok: true },
  { label: "File Storage", status: "Cloudinary Integration", ok: true },
  { label: "WhatsApp Concierge", status: "+91 85470 97173", ok: true },
];

export default function AdminDashboardPage() {
  const [productCount, setProductCount] = useState(MOCK_PRODUCTS.length);
  const [categoryCount, setCategoryCount] = useState(10);
  const [openEnquiries, setOpenEnquiries] = useState(0);
  const [openTickets, setOpenTickets] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/proxy/admin/products").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/proxy/categories").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/proxy/admin/enquiries/stats").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/proxy/admin/maintenance/stats").then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]).then(([prods, cats, enq, maint]) => {
      if (prods?.success && Array.isArray(prods.data)) setProductCount(prods.data.length);
      if (cats?.success && Array.isArray(cats.data)) setCategoryCount(cats.data.length);
      if (enq?.success && enq.data) setOpenEnquiries(enq.data.pending ?? 0);
      if (maint?.success && maint.data) setOpenTickets(maint.data.open ?? 0);
    });
  }, []);

  const stats = [
    {
      label: "Categories",
      value: String(categoryCount),
      sub: "Live database categories",
      icon: FolderTree,
      accent: "text-champagne bg-bronze-50",
    },
    {
      label: "Catalog Products",
      value: String(productCount),
      sub: "Active & draft pieces",
      icon: Package,
      accent: "text-espresso bg-alabaster",
    },
    {
      label: "Pending Enquiries",
      value: String(openEnquiries),
      sub: "Custom Studio requests",
      icon: MessageSquare,
      accent: "text-amber-700 bg-amber-50",
    },
    {
      label: "Open Maintenance",
      value: String(openTickets),
      sub: "Restoration & repair tickets",
      icon: Wrench,
      accent: "text-emerald-700 bg-emerald-50",
    },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-6xl bg-alabaster min-h-full">
      <div className="mb-8">
        <p className="section-label mb-1">Square Cube Furniture · Control Center</p>
        <h1 className="text-3xl font-display font-semibold text-espresso">Admin Overview</h1>
        <p className="text-sm font-ui text-espresso/60 mt-1">
          Full store, category, custom estimator rate, and maintenance management without touching code.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, sub, icon: Icon, accent }) => (
          <div key={label} className="bg-white border border-warm-border p-5 shadow-luxury">
            <div className="flex items-start justify-between mb-4">
              <p className="text-[11px] font-ui font-semibold text-espresso/55 uppercase tracking-wider">
                {label}
              </p>
              <div className={`w-8 h-8 flex items-center justify-center rounded-full ${accent}`}>
                <Icon size={15} />
              </div>
            </div>
            <p className="text-3xl font-display font-semibold text-espresso mb-1">{value}</p>
            <p className="text-xs font-ui text-espresso/45">{sub}</p>
          </div>
        ))}
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-warm-border p-6 shadow-luxury">
          <h2 className="text-sm font-ui font-semibold text-espresso mb-4 uppercase tracking-wider">
            Quick Actions
          </h2>
          <div className="space-y-2">
            {QUICK_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-between p-3 bg-alabaster hover:bg-silk transition-colors text-sm font-ui text-espresso group border border-warm-border"
              >
                <span>{label}</span>
                <span className="text-champagne group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white border border-warm-border p-6 shadow-luxury">
          <h2 className="text-sm font-ui font-semibold text-espresso mb-4 uppercase tracking-wider">
            Platform Architecture
          </h2>
          <div className="space-y-3">
            {SYSTEM.map(({ label, status, ok }) => (
              <div key={label} className="flex items-center justify-between text-sm font-ui py-1 border-b border-warm-border last:border-none">
                <span className="text-espresso/65">{label}</span>
                <span className={`text-xs font-medium px-2.5 py-0.5 ${ok ? "bg-emerald-50 text-emerald-700" : "bg-alabaster text-espresso/45"}`}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
