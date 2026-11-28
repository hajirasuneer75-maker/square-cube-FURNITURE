"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Calculator,
  MessageCircle,
  Upload,
  X,
  CheckCircle2,
  Loader2,
  Ruler,
} from "lucide-react";
import type { EstimatorRate } from "@/types";
import { useSettingsStore } from "@/store/useSettingsStore";
import { API_BASE_URL, formatPrice, generateWhatsAppUrl } from "@/lib/utils";
import { DEFAULT_ESTIMATOR_RATES, uploadFileToCloudinary } from "@/lib/api";

const FURNITURE_TYPES = [
  { id: "bed",          label: "Bed",          surfaceFactor: 1.15, laborBase: 14000 },
  { id: "sofa",         label: "Sofa",         surfaceFactor: 1.10, laborBase: 16000 },
  { id: "wardrobe",     label: "Wardrobe",     surfaceFactor: 1.35, laborBase: 18000 },
  { id: "dining-table", label: "Dining Table", surfaceFactor: 1.00, laborBase: 11000 },
  { id: "tv-unit",      label: "TV Unit",      surfaceFactor: 0.95, laborBase: 9000  },
  { id: "custom",       label: "Custom",       surfaceFactor: 1.10, laborBase: 12000 },
];

const WOOD_COLORS: Record<string, string> = {
  "Nilambur Teak":       "#9A6B2F",
  "Mahogany":            "#6E2B16",
  "Rosewood":            "#4B2329",
  "Marine Ply + Veneer": "#C5A880",
  "Sheesham":            "#7B4D2C",
};

const FINISH_OPTIONS = [
  { id: "natural-matte", label: "Natural Matte", add: 0,    badge: "#C8A97E" },
  { id: "pu-gloss",      label: "PU Gloss",      add: 6500, badge: "#8C6239" },
  { id: "walnut-stain",  label: "Walnut Stain",  add: 3500, badge: "#4F3122" },
  { id: "duco",          label: "Duco",          add: 8500, badge: "#EAE3D7" },
];

interface CustomStudioClientProps {
  initialRates?: EstimatorRate[];
  embedded?: boolean;
}

export default function CustomStudioClient({
  initialRates,
  embedded = false,
}: CustomStudioClientProps) {
  const whatsappNumber = useSettingsStore((s) => s.whatsappNumber);
  const [rates, setRates] = useState<EstimatorRate[]>(
    initialRates && initialRates.length > 0 ? initialRates : DEFAULT_ESTIMATOR_RATES
  );

  const [furnitureId, setFurnitureId] = useState("bed");
  const [selectedMaterial, setSelectedMaterial] = useState<string>(
    (initialRates && initialRates[0]?.material) || DEFAULT_ESTIMATOR_RATES[0].material
  );
  const [finishId, setFinishId] = useState("natural-matte");
  const [unit, setUnit] = useState<"ft" | "in">("ft");
  const [length, setLength] = useState("6.5");
  const [width, setWidth] = useState("6");
  const [height, setHeight] = useState("3.5");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [notes, setNotes] = useState("");

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialRates && initialRates.length > 0) return;
    fetch(`${API_BASE_URL}/api/estimator-rates`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
          setRates(json.data);
          setSelectedMaterial(json.data[0].material);
        }
      })
      .catch(() => {});
  }, [initialRates]);

  function handleUnitSwitch(nextUnit: "ft" | "in") {
    if (nextUnit === unit) return;
    const conv = (val: string) => {
      const n = parseFloat(val);
      if (isNaN(n)) return val;
      return nextUnit === "in" ? (n * 12).toFixed(0) : (n / 12).toFixed(1);
    };
    setLength((v) => conv(v));
    setWidth((v) => conv(v));
    setHeight((v) => conv(v));
    setUnit(nextUnit);
  }

  async function handlePhotoSelect(file: File) {
    setPhotoFile(file);
    setUploadNotice(null);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);

    setUploadingPhoto(true);
    const { url, error: upErr } = await uploadFileToCloudinary(file, "custom-studio");
    setUploadingPhoto(false);
    if (url) {
      setUploadedPhotoUrl(url);
    } else {
      setUploadedPhotoUrl(null);
      setUploadNotice(upErr || "Preview ready locally; photo will be shared directly in WhatsApp chat.");
    }
  }

  const furniture = FURNITURE_TYPES.find((f) => f.id === furnitureId) ?? FURNITURE_TYPES[0];
  const activeRate = rates.find((r) => r.material === selectedMaterial) ?? rates[0];
  const finish = FINISH_OPTIONS.find((f) => f.id === finishId) ?? FINISH_OPTIONS[0];

  const estimate = useMemo(() => {
    const rawL = Math.max(0.5, parseFloat(length) || 1);
    const rawW = Math.max(0.5, parseFloat(width) || 1);
    const rawH = Math.max(0.5, parseFloat(height) || 1);

    // Normalize to feet
    const lFt = unit === "in" ? rawL / 12 : rawL;
    const wFt = unit === "in" ? rawW / 12 : rawW;
    const hFt = unit === "in" ? rawH / 12 : rawH;

    // Effective architectural surface sq.ft
    const sqFt = Math.max(6, (lFt * wFt + 0.35 * (lFt * hFt + wFt * hFt)) * furniture.surfaceFactor);
    const materialCost = sqFt * (activeRate?.ratePerSqFt ?? 2000);
    const mid = materialCost + furniture.laborBase + finish.add;

    const low = Math.round((mid * 0.9) / 500) * 500;
    const high = Math.round((mid * 1.1) / 500) * 500;
    return { sqFt: Math.round(sqFt * 10) / 10, low, high };
  }, [length, width, height, unit, furniture, activeRate, finish]);

  const budgetRangeStr = `${formatPrice(estimate.low)} – ${formatPrice(estimate.high)}`;

  function buildWhatsAppMessage(refUrl?: string | null, enquiryCode?: string | null) {
    const lines = [
      "Hello Square Cube Furniture! 🪵",
      "",
      `I designed a custom piece in the *Square Cube Furniture Custom Studio*${enquiryCode ? ` (Ref: ${enquiryCode})` : ""}:`,
      "",
      `• *Furniture Type:* ${furniture.label}`,
      `• *Wood / Material:* ${activeRate?.material || selectedMaterial} (₹${activeRate?.ratePerSqFt}/sq.ft)`,
      `• *Finish:* ${finish.label}`,
      `• *Dimensions:* ${length} × ${width} × ${height} ${unit}`,
      `• *Estimated Price Range:* ${budgetRangeStr}`,
    ];
    if (customerName) lines.push(`• *Name:* ${customerName}`);
    if (customerPhone) lines.push(`• *Phone:* ${customerPhone}`);
    if (customerCity) lines.push(`• *City:* ${customerCity}`);
    if (notes.trim()) lines.push(`• *Notes:* ${notes.trim()}`);
    if (refUrl) lines.push("", `*Reference Design Photo:* ${refUrl}`);
    lines.push("", "Please review this estimate and guide me on timelines and exact quote.");
    return lines.join("\n");
  }

  async function handleSaveAndWhatsApp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!customerName.trim() || !customerPhone.trim()) {
      setError("Please enter your name and WhatsApp phone number so we can save your estimate.");
      return;
    }

    setSubmitting(true);
    let enquiryCode: string | null = null;
    try {
      const payload = {
        name: customerName.trim(),
        phone: customerPhone.trim(),
        city: customerCity.trim() || undefined,
        furnitureType: furniture.label,
        woodType: `${activeRate?.material || selectedMaterial} · ${finish.label}`,
        budgetRange: budgetRangeStr,
        length: `${length}${unit}`,
        width: `${width}${unit}`,
        height: `${height}${unit}`,
        description: notes.trim() || `${furniture.label} in ${activeRate?.material} (${finish.label}) — ${length}×${width}×${height} ${unit}`,
        referenceImages: uploadedPhotoUrl ? [uploadedPhotoUrl] : [],
      };

      const res = await fetch(`${API_BASE_URL}/api/custom-orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        enquiryCode = data.enquiryId ?? null;
      }
    } catch {
      // Fallback: continue smoothly to WhatsApp
    }

    if (!enquiryCode) {
      enquiryCode = `ENQ-${Date.now().toString(36).toUpperCase()}`;
    }

    try {
      const existing = JSON.parse(localStorage.getItem("sc-enquiries") ?? "[]");
      localStorage.setItem(
        "sc-enquiries",
        JSON.stringify([
          {
            id: enquiryCode,
            createdAt: new Date().toISOString(),
            name: customerName.trim(),
            phone: customerPhone.trim(),
            email: "",
            city: customerCity.trim(),
            furnitureType: furniture.label,
            woodType: `${activeRate?.material || selectedMaterial} (${finish.label})`,
            budgetRange: budgetRangeStr,
            length: `${length}${unit}`,
            width: `${width}${unit}`,
            height: `${height}${unit}`,
            description: notes.trim() || "Configured via Custom Studio Live Estimator",
            referenceImages: uploadedPhotoUrl ? [uploadedPhotoUrl] : [],
            status: "new",
          },
          ...existing,
        ])
      );
    } catch {
      // ignore storage errors
    }

    setSavedId(enquiryCode);
    setSubmitting(false);

    const waUrl = generateWhatsAppUrl(
      whatsappNumber,
      buildWhatsAppMessage(uploadedPhotoUrl, enquiryCode)
    );
    window.open(waUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className={embedded ? "" : "min-h-screen bg-alabaster"}>
      {!embedded && (
        <div style={{ backgroundColor: "#231F1E" }} className="py-16 text-center px-4">
          <p className="section-label text-champagne mb-4">
            Square Cube Furniture · Architectural Studio
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-white mb-4">
            Custom Studio &amp; Live Price Estimator
          </h1>
          <p className="font-ui text-white/65 text-base sm:text-lg max-w-2xl mx-auto">
            Select your furniture silhouette, Kerala hardwood species, finish, and dimensions for an
            instant INR estimate — then send directly to Square Cube Furniture on WhatsApp.
          </p>
        </div>
      )}

      <div className={embedded ? "" : "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12"}>
        <form onSubmit={handleSaveAndWhatsApp} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Configuration Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Furniture Type */}
            <div className="bg-white border border-warm-border p-6">
              <p className="form-label mb-3">1. Furniture Type</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {FURNITURE_TYPES.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFurnitureId(f.id)}
                    className={`py-3 px-4 text-xs font-ui font-semibold tracking-wide border transition-all ${
                      furnitureId === f.id
                        ? "border-espresso bg-espresso text-white"
                        : "border-warm-border bg-white text-espresso/75 hover:border-champagne"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Wood / Material (Admin Configurable Rates) */}
            <div className="bg-white border border-warm-border p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="form-label mb-0">2. Wood / Material</p>
                <span className="text-[11px] font-ui text-champagne font-medium">
                  Live Studio Rates
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {rates.map((r) => {
                  const active = selectedMaterial === r.material;
                  const swatchColor = WOOD_COLORS[r.material] || "#B08968";
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedMaterial(r.material)}
                      className={`flex items-center justify-between p-3.5 border text-left transition-all ${
                        active
                          ? "border-champagne bg-bronze-50"
                          : "border-warm-border bg-white hover:border-champagne/60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-6 h-6 rounded-full flex-shrink-0 border border-espresso/15 shadow-sm"
                          style={{ backgroundColor: swatchColor }}
                        />
                        <div>
                          <p className="font-ui text-sm font-semibold text-espresso">{r.material}</p>
                          {r.description && (
                            <p className="font-ui text-[11px] text-espresso/50 line-clamp-1">
                              {r.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="font-ui text-xs font-semibold text-champagne ml-2 whitespace-nowrap">
                        ₹{r.ratePerSqFt}/sq.ft
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Polish / Finish */}
            <div className="bg-white border border-warm-border p-6">
              <p className="form-label mb-3">3. Surface Finish</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {FINISH_OPTIONS.map((f) => {
                  const active = finishId === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFinishId(f.id)}
                      className={`p-3 border text-left transition-all ${
                        active
                          ? "border-espresso bg-espresso text-white"
                          : "border-warm-border bg-white text-espresso/75 hover:border-champagne"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/15"
                          style={{ backgroundColor: f.badge }}
                        />
                        <span className="text-xs font-ui font-semibold">{f.label}</span>
                      </div>
                      <p className={`text-[11px] font-ui ${active ? "text-white/70" : "text-espresso/45"}`}>
                        {f.add === 0 ? "Included" : `+${formatPrice(f.add)}`}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Dimensions */}
            <div className="bg-white border border-warm-border p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="form-label mb-0 flex items-center gap-1.5">
                  <Ruler size={13} className="text-champagne" /> 4. Dimensions
                </p>
                <div className="flex border border-warm-border bg-alabaster p-0.5">
                  {(["ft", "in"] as const).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => handleUnitSwitch(u)}
                      className={`px-3 py-1 text-[11px] font-ui font-semibold uppercase tracking-wider transition-colors ${
                        unit === u ? "bg-espresso text-white" : "text-espresso/60 hover:text-espresso"
                      }`}
                    >
                      {u === "ft" ? "Feet" : "Inches"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Length", val: length, setVal: setLength },
                  { label: "Width", val: width, setVal: setWidth },
                  { label: "Height", val: height, setVal: setHeight },
                ].map((d) => (
                  <div key={d.label}>
                    <label className="text-[10px] font-ui font-semibold text-espresso/55 uppercase tracking-widest block mb-1.5">
                      {d.label} ({unit})
                    </label>
                    <input
                      type="number"
                      min="0.5"
                      max={unit === "ft" ? 40 : 480}
                      step="0.5"
                      value={d.val}
                      onChange={(e) => d.setVal(e.target.value)}
                      className="input-luxury text-center font-semibold"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Reference Photo & Client Details */}
            <div className="bg-white border border-warm-border p-6 space-y-4">
              <p className="form-label mb-2">5. Reference Design Photo &amp; Contact Details</p>

              {/* Upload */}
              <div>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-warm-border hover:border-champagne transition-colors p-4 flex items-center justify-between gap-4 cursor-pointer bg-alabaster/50"
                >
                  <div className="flex items-center gap-3">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Reference" className="w-14 h-14 object-cover border border-warm-border" />
                    ) : (
                      <div className="w-12 h-12 bg-white border border-warm-border flex items-center justify-center">
                        <Upload size={18} className="text-champagne" />
                      </div>
                    )}
                    <div>
                      <p className="font-ui text-sm font-medium text-espresso">
                        {photoFile ? photoFile.name : "Upload a reference photo or sketch (optional)"}
                      </p>
                      <p className="font-ui text-xs text-espresso/50">
                        {uploadingPhoto
                          ? "Uploading to Cloudinary…"
                          : uploadedPhotoUrl
                          ? "✓ Uploaded to Cloudinary — link will be attached to WhatsApp"
                          : "JPG, PNG, WEBP up to 10 MB"}
                      </p>
                    </div>
                  </div>
                  {photoFile && (
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setPhotoFile(null);
                        setPhotoPreview(null);
                        setUploadedPhotoUrl(null);
                      }}
                      className="p-1.5 text-espresso/50 hover:text-red-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handlePhotoSelect(f);
                  }}
                />
                {uploadNotice && (
                  <p className="text-xs font-ui text-champagne mt-1.5">{uploadNotice}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your Name *"
                  className="input-luxury"
                />
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="WhatsApp Number *"
                  className="input-luxury"
                />
                <input
                  type="text"
                  value={customerCity}
                  onChange={(e) => setCustomerCity(e.target.value)}
                  placeholder="City (e.g. Kochi)"
                  className="input-luxury"
                />
              </div>

              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Carving style, storage drawers, fabric tone, or room dimensions…"
                className="input-luxury resize-none"
              />
            </div>
          </div>

          {/* Right Live Estimate Summary Card */}
          <div className="lg:col-span-5">
            <div style={{ backgroundColor: "#231F1E" }} className="p-7 text-white sticky top-24 border border-champagne/25 shadow-luxury">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Calculator className="text-champagne" size={18} />
                  <span className="section-label text-champagne">Instant Studio Estimate</span>
                </div>
                <span className="text-[11px] font-ui text-white/45">
                  ~{estimate.sqFt} sq.ft est.
                </span>
              </div>

              <div className="pb-6 mb-6 border-b border-white/10">
                <p className="font-ui text-xs text-white/50 uppercase tracking-wider mb-1">
                  Estimated Price Range (INR)
                </p>
                <p className="font-display text-4xl font-semibold text-white">
                  {formatPrice(estimate.low)}
                </p>
                <p className="font-display text-2xl text-champagne mt-0.5">
                  to {formatPrice(estimate.high)}
                </p>
                <p className="font-ui text-[11px] text-white/40 mt-2 leading-relaxed">
                  Calculated live from Square Cube Furniture studio timber rates. Final quote verified on technical drawing.
                </p>
              </div>

              <div className="space-y-2.5 mb-7 text-xs font-ui">
                <div className="flex justify-between">
                  <span className="text-white/45">Piece</span>
                  <span className="text-white font-medium">{furniture.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/45">Timber</span>
                  <span className="text-white font-medium">{activeRate?.material || selectedMaterial}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/45">Finish</span>
                  <span className="text-white font-medium">{finish.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/45">Size</span>
                  <span className="text-white font-medium">
                    {length} × {width} × {height} {unit}
                  </span>
                </div>
              </div>

              {error && (
                <p className="text-xs font-ui text-red-300 bg-red-950/50 border border-red-400/30 p-3 mb-4">
                  {error}
                </p>
              )}

              {savedId && (
                <div className="flex items-center gap-2 text-xs font-ui text-emerald-300 bg-emerald-950/40 border border-emerald-400/30 p-3 mb-4">
                  <CheckCircle2 size={15} />
                  <span>Saved as {savedId} &amp; WhatsApp opened!</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || uploadingPhoto}
                className="btn-whatsapp w-full py-4 text-xs tracking-wider uppercase font-semibold rounded-sm disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Saving Estimate…
                  </>
                ) : (
                  <>
                    <MessageCircle size={16} /> Send Custom Design &amp; Estimate to WhatsApp
                  </>
                )}
              </button>

              <p className="font-ui text-[11px] text-white/35 text-center mt-3">
                Saves request to Square Cube Furniture Studio &amp; opens WhatsApp (+91 85470 97173)
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
