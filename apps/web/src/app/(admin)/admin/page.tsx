"use client";

import { useEffect, useState } from "react";
import { Package, MessageSquare, IndianRupee, TrendingUp } from "lucide-react";
import { MOCK_PRODUCTS } from "@/lib/constants/mockData";
import Link from "next/link";

const MOCK_OPEN_ENQUIRIES = 1; // "new" in MOCK_ENQUIRIES
const QUICK_LINKS = [
  { label: "View all enquiries",  href: "/admin/enquiries" },
  { label: "Add a new product",   href: "/admin/products"  },
  { label: "Open the store →",    href: "/"                },
];

const SYSTEM = [
  { label: "Database",     status: "PostgreSQL · Connected",  ok: true  },
  { label: "File Storage", status: "Cloudinary · Active",     ok: true  },
  { label: "WhatsApp",     status: "wa.me deep links",        ok: true  },
  { label: "Payments",     status: "Coming soon",             ok: false },
];

export default function AdminDashboardPage() {
  const [openEnquiries, setOpenEnquiries] = useState(MOCK_OPEN_ENQUIRIES);
  const [totalEnquiries, setTotalEnquiries] = useState(4);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("sc-enquiries");
      if (stored) {
        const real = JSON.parse(stored) as { status: string }[];
        const newFromForm = real.filter((e) => e.status === "new").length;
        setOpenEnquiries(MOCK_OPEN_ENQUIRIES + newFromForm);
        setTotalEnquiries(4 + real.length);
      }
    } catch { /* localStorage unavailable */ }
  }, []);

  const stats = [
    {
      label:  "Total Products",
      value:  String(MOCK_PRODUCTS.length),
      sub:    `${MOCK_PRODUCTS.filter((p) => p.isFeatured).length} featured`,
      icon:   Package,
      accent: "text-blue-600 bg-blue-50",
    },
    {
      label:  "Open Enquiries",
      value:  String(openEnquiries),
      sub:    `${totalEnquiries} total`,
      icon:   MessageSquare,
      accent: "text-amber-600 bg-amber-50",
    },
    {
      label:  "Est. Revenue (Dec)",
      value:  "₹4.2L",
      sub:    "+18% vs November",
      icon:   IndianRupee,
      accent: "text-green-600 bg-green-50",
    },
    {
      label:  "Avg. Order Value",
      value:  "₹58,000",
      sub:    "Based on 12 orders",
      icon:   TrendingUp,
      accent: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-6xl">

      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold text-stone-900">Dashboard</h1>
        <p className="text-sm text-stone-500 mt-1">
          Welcome back. Here&apos;s what&apos;s happening with Square Cube.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, sub, icon: Icon, accent }) => (
          <div key={label} className="bg-white border border-stone-200 p-5">
            <div className="flex items-start justify-between mb-4">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{label}</p>
              <div className={`w-8 h-8 flex items-center justify-center rounded-full ${accent}`}>
                <Icon size={15} />
              </div>
            </div>
            <p className="text-3xl font-display font-semibold text-stone-900 mb-1">{value}</p>
            <p className="text-xs text-stone-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quick links */}
        <div className="bg-white border border-stone-200 p-5">
          <h2 className="text-sm font-semibold text-stone-700 mb-4">Quick Actions</h2>
          <div className="space-y-1.5">
            {QUICK_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-between p-3 bg-stone-50 hover:bg-stone-100 transition-colors text-sm text-stone-700 group"
              >
                {label}
                <span className="text-stone-300 group-hover:text-stone-600 transition-colors">→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* System status */}
        <div className="bg-white border border-stone-200 p-5">
          <h2 className="text-sm font-semibold text-stone-700 mb-4">System Status</h2>
          <div className="space-y-3">
            {SYSTEM.map(({ label, status, ok }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-stone-500">{label}</span>
                <span className={`text-xs font-medium px-2 py-0.5 ${ok ? "bg-green-50 text-green-700" : "bg-stone-100 text-stone-400"}`}>
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
