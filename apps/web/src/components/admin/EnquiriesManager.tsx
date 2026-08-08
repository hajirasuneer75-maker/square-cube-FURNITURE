"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  X, MessageCircle, Phone, Mail, MapPin, Package,
  Calendar, Eye, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = "new" | "in-progress" | "quoted" | "completed";

interface Enquiry {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  furnitureType: string;
  woodType: string;
  budgetRange: string;
  length: string;
  width: string;
  height: string;
  description: string;
  referenceImages: string[];
  status: Status;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_ENQUIRIES: Enquiry[] = [
  {
    id: "ENQ-001",
    createdAt: "2025-12-15T10:30:00Z",
    name: "Priya Sharma",
    phone: "9876543210",
    email: "priya@example.com",
    city: "Mumbai",
    furnitureType: "Bedroom",
    woodType: "Teak",
    budgetRange: "₹50,000 – ₹1,00,000",
    length: "200", width: "180", height: "120",
    description:
      "I need a custom king-size bed with hydraulic storage drawers underneath and a matching side table. Prefer teak with a natural polish finish and carved headboard.",
    referenceImages: [
      "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400&h=300&fit=crop",
    ],
    status: "new",
  },
  {
    id: "ENQ-002",
    createdAt: "2025-12-14T14:00:00Z",
    name: "Arjun Mehta",
    phone: "8765432109",
    email: "",
    city: "Delhi",
    furnitureType: "Office",
    woodType: "Sheesham",
    budgetRange: "₹20,000 – ₹50,000",
    length: "150", width: "75", height: "75",
    description:
      "L-shaped executive desk with cable management channels and a built-in drawer pedestal. Modern minimalist design preferred. Sheesham with walnut stain.",
    referenceImages: [],
    status: "in-progress",
  },
  {
    id: "ENQ-003",
    createdAt: "2025-12-13T09:15:00Z",
    name: "Kavita Patel",
    phone: "7654321098",
    email: "kavita.p@gmail.com",
    city: "Bangalore",
    furnitureType: "Dining Room",
    woodType: "Oak",
    budgetRange: "₹1,00,000 – ₹2,00,000",
    length: "220", width: "100", height: "78",
    description:
      "8-seater dining table for our new home. Solid oak, dark walnut stain, brass hairpin legs. We saw something similar at a café in Indiranagar.",
    referenceImages: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop",
    ],
    status: "quoted",
  },
  {
    id: "ENQ-004",
    createdAt: "2025-12-10T16:45:00Z",
    name: "Rohit Singhania",
    phone: "9543210876",
    email: "",
    city: "Hyderabad",
    furnitureType: "Wardrobes",
    woodType: "MDF",
    budgetRange: "₹50,000 – ₹1,00,000",
    length: "240", width: "60", height: "240",
    description:
      "3-panel sliding wardrobe with full-length mirror, acrylic gloss shutters, internal shoe rack, and hanging rods. Floor-to-ceiling height.",
    referenceImages: [],
    status: "completed",
  },
];

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<Status, { label: string; classes: string }> = {
  "new":         { label: "New",         classes: "bg-blue-100 text-blue-700"   },
  "in-progress": { label: "In Progress", classes: "bg-amber-100 text-amber-700" },
  "quoted":      { label: "Quoted",      classes: "bg-orange-100 text-orange-700"},
  "completed":   { label: "Completed",   classes: "bg-green-100 text-green-700" },
};

const ALL_STATUSES: Status[] = ["new", "in-progress", "quoted", "completed"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EnquiriesManager() {
  const [enquiries, setEnquiries]   = useState<Enquiry[]>(MOCK_ENQUIRIES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");

  // Merge real submissions from localStorage with mock data
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sc-enquiries");
      if (stored) {
        const real = JSON.parse(stored) as Enquiry[];
        const mockIds = new Set(MOCK_ENQUIRIES.map((e) => e.id));
        const fresh = real.filter((e) => !mockIds.has(e.id));
        if (fresh.length > 0) {
          setEnquiries([...fresh, ...MOCK_ENQUIRIES]);
        }
      }
    } catch { /* localStorage unavailable */ }
  }, []);

  const filtered =
    statusFilter === "all"
      ? enquiries
      : enquiries.filter((e) => e.status === statusFilter);

  const selected = enquiries.find((e) => e.id === selectedId) ?? null;

  function updateStatus(id: string, status: Status) {
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    if (selected?.id === id) {
      setSelectedId(id); // keep panel open
    }
  }

  const counts: Record<Status | "all", number> = {
    all:          enquiries.length,
    "new":         enquiries.filter((e) => e.status === "new").length,
    "in-progress": enquiries.filter((e) => e.status === "in-progress").length,
    "quoted":      enquiries.filter((e) => e.status === "quoted").length,
    "completed":   enquiries.filter((e) => e.status === "completed").length,
  };

  return (
    <div className="p-6 lg:p-8 flex gap-6 h-full">

      {/* Left: Table */}
      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-stone-900">Custom Enquiries</h1>
          <p className="text-sm text-stone-500 mt-0.5">{enquiries.length} total requests</p>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-1 mb-5 border-b border-stone-200">
          {(["all", ...ALL_STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-2 text-xs font-semibold -mb-px border-b-2 transition-colors capitalize whitespace-nowrap",
                statusFilter === s
                  ? "border-stone-900 text-stone-900"
                  : "border-transparent text-stone-400 hover:text-stone-700"
              )}
            >
              {s === "all" ? "All" : STATUS_CONFIG[s].label}
              <span className={cn(
                "ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                statusFilter === s ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-500"
              )}>
                {counts[s]}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="border border-stone-200 bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-stone-200 bg-stone-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Request</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Budget</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((e) => (
                <tr
                  key={e.id}
                  className={cn(
                    "hover:bg-stone-50 transition-colors cursor-pointer",
                    selectedId === e.id && "bg-stone-50 border-l-2 border-l-stone-900"
                  )}
                  onClick={() => setSelectedId(e.id === selectedId ? null : e.id)}
                >
                  {/* Customer */}
                  <td className="px-4 py-3">
                    <p className="font-medium text-stone-900">{e.name}</p>
                    <p className="text-xs text-stone-400">{e.city || "—"}</p>
                  </td>
                  {/* Request */}
                  <td className="px-4 py-3">
                    <p className="text-stone-700">{e.furnitureType}</p>
                    <p className="text-xs text-stone-400">{e.woodType || "Any wood"}</p>
                  </td>
                  {/* Budget */}
                  <td className="px-4 py-3 text-stone-600 text-xs">{e.budgetRange}</td>
                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={cn(
                      "text-[11px] font-semibold px-2 py-0.5",
                      STATUS_CONFIG[e.status].classes
                    )}>
                      {STATUS_CONFIG[e.status].label}
                    </span>
                  </td>
                  {/* Date */}
                  <td className="px-4 py-3 text-xs text-stone-400">{formatDate(e.createdAt)}</td>
                  {/* View */}
                  <td className="px-4 py-3">
                    <Eye size={15} className={cn(
                      "transition-colors",
                      selectedId === e.id ? "text-stone-900" : "text-stone-300"
                    )} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-stone-400">
                    No enquiries in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: Detail panel */}
      {selected && (
        <div className="w-80 xl:w-96 flex-shrink-0 border border-stone-200 bg-white overflow-y-auto flex flex-col">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-stone-200 bg-stone-50 sticky top-0">
            <div>
              <p className="text-xs font-mono font-semibold text-stone-500">{selected.id}</p>
              <p className="font-semibold text-stone-900 text-sm">{selected.name}</p>
            </div>
            <button
              onClick={() => setSelectedId(null)}
              className="p-1.5 hover:bg-stone-200 transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

            {/* Status update */}
            <div>
              <p className="detail-section-label">Status</p>
              <div className="relative">
                <select
                  value={selected.status}
                  onChange={(e) => updateStatus(selected.id, e.target.value as Status)}
                  className={cn(
                    "w-full border px-3 py-2 text-sm font-medium appearance-none pr-8 focus:outline-none",
                    STATUS_CONFIG[selected.status].classes
                  )}
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-3 pointer-events-none opacity-60" />
              </div>
            </div>

            {/* Contact */}
            <div>
              <p className="detail-section-label">Contact</p>
              <div className="space-y-2">
                <DetailRow icon={Phone} value={selected.phone} />
                {selected.email && <DetailRow icon={Mail} value={selected.email} />}
                {selected.city  && <DetailRow icon={MapPin} value={selected.city}  />}
                <DetailRow icon={Calendar} value={formatDate(selected.createdAt)} />
              </div>
            </div>

            {/* Furniture */}
            <div>
              <p className="detail-section-label">Furniture Details</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-400">Type</span>
                  <span className="font-medium text-stone-800">{selected.furnitureType}</span>
                </div>
                {selected.woodType && (
                  <div className="flex justify-between">
                    <span className="text-stone-400">Wood</span>
                    <span className="font-medium text-stone-800">{selected.woodType}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-stone-400">Budget</span>
                  <span className="font-medium text-stone-800">{selected.budgetRange}</span>
                </div>
                {(selected.length || selected.width || selected.height) && (
                  <div className="flex justify-between">
                    <span className="text-stone-400">Size (cm)</span>
                    <span className="font-medium text-stone-800 text-xs">
                      {[
                        selected.length && `L ${selected.length}`,
                        selected.width  && `W ${selected.width}`,
                        selected.height && `H ${selected.height}`,
                      ].filter(Boolean).join(" × ")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="detail-section-label">Description</p>
              <p className="text-sm text-stone-700 leading-relaxed">{selected.description}</p>
            </div>

            {/* Reference images */}
            {selected.referenceImages.length > 0 && (
              <div>
                <p className="detail-section-label">Reference Images ({selected.referenceImages.length})</p>
                <div className="grid grid-cols-2 gap-2">
                  {selected.referenceImages.map((url, idx) => (
                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block relative aspect-video bg-stone-100 border border-stone-200 overflow-hidden hover:opacity-90 transition-opacity">
                      <Image src={url} alt={`Reference ${idx + 1}`} fill sizes="150px" className="object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Panel footer actions */}
          <div className="px-4 py-4 border-t border-stone-200 space-y-2">
            <a
              href={`https://wa.me/${selected.phone.replace(/\D/g, "").replace(/^0/, "91")}?text=${encodeURIComponent(`Hello ${selected.name}! This is Square Cube regarding your custom furniture enquiry (${selected.id}).`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp text-xs py-2.5 w-full"
            >
              <MessageCircle size={15} />
              Reply on WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

function DetailRow({ icon: Icon, value }: { icon: React.ElementType; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon size={13} className="text-stone-400 flex-shrink-0" />
      <span className="text-stone-700">{value}</span>
    </div>
  );
}
