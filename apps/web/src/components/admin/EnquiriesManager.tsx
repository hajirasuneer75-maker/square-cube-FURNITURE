"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Wrench,
  Sparkles,
} from "lucide-react";
import type { MaintenanceTicket } from "@/types";
import { cn } from "@/lib/utils";

interface CustomEnquiryRecord {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email?: string | null;
  city?: string | null;
  furnitureType: string;
  woodType?: string | null;
  budgetRange: string;
  length?: string | null;
  width?: string | null;
  height?: string | null;
  description: string;
  referenceImages: string[];
  status: string;
  adminNotes?: string | null;
}

const ENQUIRY_STATUSES = ["PENDING", "IN_PROGRESS", "QUOTED", "COMPLETED", "REJECTED"];
const TICKET_STATUSES = ["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCustomerWa(phone: string, text: string) {
  const digits = phone.replace(/\D/g, "").replace(/^0/, "");
  const full = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${full}?text=${encodeURIComponent(text)}`;
}

export default function EnquiriesManager() {
  const [tab, setTab] = useState<"enquiries" | "maintenance">("enquiries");
  const [enquiries, setEnquiries] = useState<CustomEnquiryRecord[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    setLoading(true);
    try {
      const [enqRes, maintRes] = await Promise.all([
        fetch("/api/proxy/admin/enquiries?pageSize=50"),
        fetch("/api/proxy/maintenance?pageSize=50"),
      ]);
      const enqJson = enqRes.ok ? await enqRes.json() : null;
      const maintJson = maintRes.ok ? await maintRes.json() : null;

      let dbEnq: CustomEnquiryRecord[] = enqJson?.success ? enqJson.data : [];
      let dbTickets: MaintenanceTicket[] = maintJson?.success ? maintJson.data : [];

      // Merge any offline localStorage entries if DB wasn't reached during submission
      try {
        const localEnq = JSON.parse(localStorage.getItem("sc-enquiries") ?? "[]") as CustomEnquiryRecord[];
        const dbIds = new Set(dbEnq.map((e) => e.id));
        const extraEnq = localEnq.filter((e) => !dbIds.has(e.id));
        if (dbEnq.length === 0) dbEnq = extraEnq;

        const localMaint = JSON.parse(localStorage.getItem("sc-maintenance") ?? "[]") as MaintenanceTicket[];
        const tIds = new Set(dbTickets.map((t) => t.id));
        const extraMaint = localMaint.filter((t) => !tIds.has(t.id));
        if (dbTickets.length === 0) dbTickets = extraMaint;
      } catch {
        // ignore
      }

      setEnquiries(dbEnq);
      setTickets(dbTickets);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function updateEnquiryStatus(id: string, status: string) {
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    await fetch(`/api/proxy/admin/enquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch(() => {});
  }

  async function updateTicketStatus(id: string, status: MaintenanceTicket["status"]) {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    await fetch(`/api/proxy/maintenance/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch(() => {});
  }

  const selectedEnquiry = tab === "enquiries" ? enquiries.find((e) => e.id === selectedId) ?? null : null;
  const selectedTicket = tab === "maintenance" ? tickets.find((t) => t.id === selectedId) ?? null : null;

  return (
    <div className="p-6 lg:p-8 flex gap-6 h-full bg-alabaster min-h-full">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <p className="section-label mb-1">Square Cube Furniture · Concierge Hub</p>
            <h1 className="text-2xl font-display font-semibold text-espresso">
              Enquiries &amp; Maintenance Hub
            </h1>
          </div>

          <div className="inline-flex border border-warm-border bg-white p-1">
            <button
              onClick={() => {
                setTab("enquiries");
                setSelectedId(null);
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-xs font-ui font-semibold uppercase tracking-wider transition-colors",
                tab === "enquiries" ? "bg-espresso text-white" : "text-espresso/60 hover:text-espresso"
              )}
            >
              <Sparkles size={13} /> Custom Enquiries ({enquiries.length})
            </button>
            <button
              onClick={() => {
                setTab("maintenance");
                setSelectedId(null);
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-xs font-ui font-semibold uppercase tracking-wider transition-colors",
                tab === "maintenance" ? "bg-espresso text-white" : "text-espresso/60 hover:text-espresso"
              )}
            >
              <Wrench size={13} /> Maintenance Tickets ({tickets.length})
            </button>
          </div>
        </div>

        <div className="border border-warm-border bg-white overflow-x-auto shadow-luxury">
          {loading ? (
            <div className="py-12 text-center text-sm font-ui text-espresso/50">Loading records…</div>
          ) : tab === "enquiries" ? (
            <table className="w-full text-sm font-ui">
              <thead className="border-b border-warm-border bg-alabaster">
                <tr>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-espresso/55 uppercase">Customer</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-espresso/55 uppercase">Piece &amp; Wood</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-espresso/55 uppercase">Estimate / Budget</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-espresso/55 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-espresso/55 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-border">
                {enquiries.map((e) => (
                  <tr
                    key={e.id}
                    onClick={() => setSelectedId(e.id === selectedId ? null : e.id)}
                    className={cn(
                      "hover:bg-alabaster/70 cursor-pointer transition-colors",
                      selectedId === e.id && "bg-bronze-50"
                    )}
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-espresso">{e.name}</p>
                      <p className="text-xs text-espresso/50">{e.city || e.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-espresso">{e.furnitureType}</p>
                      <p className="text-xs text-espresso/50">{e.woodType || "Any wood"}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-espresso/75">{e.budgetRange}</td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-semibold px-2 py-0.5 bg-alabaster border border-warm-border text-espresso">
                        {e.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-espresso/45">{formatDate(e.createdAt)}</td>
                  </tr>
                ))}
                {enquiries.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-espresso/45">
                      No custom enquiries yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm font-ui">
              <thead className="border-b border-warm-border bg-alabaster">
                <tr>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-espresso/55 uppercase">Customer</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-espresso/55 uppercase">Service &amp; Item</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-espresso/55 uppercase">Preferred Date</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-espresso/55 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-espresso/55 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-border">
                {tickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedId(t.id === selectedId ? null : t.id)}
                    className={cn(
                      "hover:bg-alabaster/70 cursor-pointer transition-colors",
                      selectedId === t.id && "bg-bronze-50"
                    )}
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-espresso">{t.name}</p>
                      <p className="text-xs text-espresso/50">{t.city || t.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-espresso">{t.serviceType.replace(/_/g, " ")}</p>
                      <p className="text-xs text-espresso/50">{t.furnitureItem}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-espresso/75">{t.preferredDate || "Flexible"}</td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-semibold px-2 py-0.5 bg-alabaster border border-warm-border text-espresso">
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-espresso/45">{formatDate(t.createdAt)}</td>
                  </tr>
                ))}
                {tickets.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-espresso/45">
                      No maintenance tickets yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail Side Panel */}
      {(selectedEnquiry || selectedTicket) && (
        <div className="w-80 xl:w-96 flex-shrink-0 border border-warm-border bg-white flex flex-col shadow-luxury">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-warm-border bg-alabaster">
            <div>
              <p className="text-[11px] font-mono text-champagne">
                {(selectedEnquiry || selectedTicket)!.id.slice(-8).toUpperCase()}
              </p>
              <p className="font-display text-lg font-semibold text-espresso">
                {(selectedEnquiry || selectedTicket)!.name}
              </p>
            </div>
            <button onClick={() => setSelectedId(null)} className="p-1.5 hover:bg-warm-border/50">
              <X size={15} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5 font-ui text-sm">
            {selectedEnquiry && (
              <>
                <div>
                  <label className="detail-section-label">Status</label>
                  <select
                    value={selectedEnquiry.status}
                    onChange={(e) => updateEnquiryStatus(selectedEnquiry.id, e.target.value)}
                    className="input-luxury py-2 text-xs font-semibold"
                  >
                    {ENQUIRY_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 text-xs">
                  <p className="flex items-center gap-2"><Phone size={12} /> {selectedEnquiry.phone}</p>
                  {selectedEnquiry.email && <p className="flex items-center gap-2"><Mail size={12} /> {selectedEnquiry.email}</p>}
                  {selectedEnquiry.city && <p className="flex items-center gap-2"><MapPin size={12} /> {selectedEnquiry.city}</p>}
                  <p className="flex items-center gap-2"><Calendar size={12} /> {formatDate(selectedEnquiry.createdAt)}</p>
                </div>

                <div className="p-3 bg-alabaster border border-warm-border text-xs space-y-1">
                  <p><strong>Furniture:</strong> {selectedEnquiry.furnitureType}</p>
                  {selectedEnquiry.woodType && <p><strong>Wood:</strong> {selectedEnquiry.woodType}</p>}
                  <p><strong>Estimate / Budget:</strong> {selectedEnquiry.budgetRange}</p>
                  {(selectedEnquiry.length || selectedEnquiry.width || selectedEnquiry.height) && (
                    <p>
                      <strong>Dimensions:</strong> {selectedEnquiry.length} × {selectedEnquiry.width} × {selectedEnquiry.height}
                    </p>
                  )}
                </div>

                <div>
                  <p className="detail-section-label">Description</p>
                  <p className="text-xs text-espresso/80 leading-relaxed">{selectedEnquiry.description}</p>
                </div>

                {selectedEnquiry.referenceImages?.length > 0 && (
                  <div>
                    <p className="detail-section-label">Customer Photos</p>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedEnquiry.referenceImages.map((url, idx) => (
                        <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="relative aspect-video border border-warm-border overflow-hidden">
                          <Image src={url} alt="" fill sizes="160px" className="object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <a
                  href={formatCustomerWa(
                    selectedEnquiry.phone,
                    `Hello ${selectedEnquiry.name}! This is Square Cube Furniture following up on your custom ${selectedEnquiry.furnitureType} request.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp w-full py-2.5 text-xs"
                >
                  <MessageCircle size={15} /> Reply on WhatsApp
                </a>
              </>
            )}

            {selectedTicket && (
              <>
                <div>
                  <label className="detail-section-label">Ticket Status</label>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) =>
                      updateTicketStatus(selectedTicket.id, e.target.value as MaintenanceTicket["status"])
                    }
                    className="input-luxury py-2 text-xs font-semibold"
                  >
                    {TICKET_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 text-xs">
                  <p className="flex items-center gap-2"><Phone size={12} /> {selectedTicket.phone}</p>
                  {selectedTicket.email && <p className="flex items-center gap-2"><Mail size={12} /> {selectedTicket.email}</p>}
                  {selectedTicket.city && <p className="flex items-center gap-2"><MapPin size={12} /> {selectedTicket.city}</p>}
                  <p className="flex items-center gap-2"><Calendar size={12} /> Visit Date: {selectedTicket.preferredDate || "Flexible"}</p>
                </div>

                <div className="p-3 bg-alabaster border border-warm-border text-xs space-y-1">
                  <p><strong>Service:</strong> {selectedTicket.serviceType.replace(/_/g, " ")}</p>
                  <p><strong>Item:</strong> {selectedTicket.furnitureItem}</p>
                </div>

                <div>
                  <p className="detail-section-label">Issue Description</p>
                  <p className="text-xs text-espresso/80 leading-relaxed">{selectedTicket.issueDescription}</p>
                </div>

                {selectedTicket.damagePhotos?.length > 0 && (
                  <div>
                    <p className="detail-section-label">Damage Photos</p>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedTicket.damagePhotos.map((url, idx) => (
                        <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="relative aspect-video border border-warm-border overflow-hidden">
                          <Image src={url} alt="" fill sizes="160px" className="object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <a
                  href={formatCustomerWa(
                    selectedTicket.phone,
                    `Hello ${selectedTicket.name}! This is Square Cube Furniture regarding your ${selectedTicket.serviceType.replace(/_/g, " ").toLowerCase()} service ticket for ${selectedTicket.furnitureItem}.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp w-full py-2.5 text-xs"
                >
                  <MessageCircle size={15} /> Reply on WhatsApp
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
