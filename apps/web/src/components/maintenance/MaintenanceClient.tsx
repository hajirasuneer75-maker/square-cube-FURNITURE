"use client";

import { useState, useRef } from "react";
import { Wrench, CheckCircle, Loader2, Upload, X, Shield, Sparkles } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { API_BASE_URL, generateWhatsAppUrl } from "@/lib/utils";
import { uploadFileToCloudinary } from "@/lib/api";

const SERVICES = [
  { id: "WOOD_POLISH",          label: "Wood Polishing & Refinishing",  icon: "🪵", desc: "Restore natural grain depth and satin oil sheen" },
  { id: "PU_REFINISH",          label: "PU Gloss / Matte Refinishing",  icon: "✨", desc: "Scratch-resistant Italian PU coat restoration" },
  { id: "REUPHOLSTERY",         label: "Sofa Re-upholstery",            icon: "🛋️", desc: "Fresh bouclé, linen, or top-grain leather wrap" },
  { id: "FOAM_REPLACEMENT",     label: "Foam & Cushion Replacement",    icon: "🔄", desc: "High-resilience multi-density core replacement" },
  { id: "HINGE_REPAIR",         label: "Wardrobe Hinges & Channels",    icon: "🔧", desc: "Soft-close Hettich/Blum hardware realignment" },
  { id: "TERMITE_TREATMENT",    label: "Termite & Borer Treatment",     icon: "🛡️", desc: "Deep timber injection & protective sealing" },
  { id: "DISMANTLING_SHIFTING", label: "Dismantling & Shifting",        icon: "🚚", desc: "White-glove disassembly, transport & reassembly" },
  { id: "GENERAL_REPAIR",       label: "Structural & Joinery Repair",   icon: "🔨", desc: "Joint tightening, veneer patching & restoration" },
];

interface FormState {
  name: string;
  phone: string;
  email: string;
  city: string;
  serviceType: string;
  furnitureItem: string;
  issueDescription: string;
  preferredDate: string;
}

const EMPTY: FormState = {
  name: "",
  phone: "",
  email: "",
  city: "",
  serviceType: "WOOD_POLISH",
  furnitureItem: "",
  issueDescription: "",
  preferredDate: "",
};

export default function MaintenanceClient() {
  const whatsappNumber = useSettingsStore((s) => s.whatsappNumber);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [lastWaUrl, setLastWaUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function set(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handlePhotoSelect(file: File) {
    setPhotoFile(file);
    setUploadNotice(null);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    const { url, error: upErr } = await uploadFileToCloudinary(file, "maintenance");
    setUploading(false);
    if (url) {
      setUploadedPhotoUrl(url);
    } else {
      setUploadedPhotoUrl(null);
      setUploadNotice(upErr || "Photo saved locally; you can also share it directly in WhatsApp.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.serviceType || !form.furnitureItem.trim() || !form.issueDescription.trim()) {
      setError("Please fill in Service Type, Furniture Item, Issue Description, Name, and Phone.");
      return;
    }

    setLoading(true);
    setError(null);
    let createdId = `MT-${Date.now().toString(36).toUpperCase()}`;

    try {
      const res = await fetch(`${API_BASE_URL}/api/maintenance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          damagePhotos: uploadedPhotoUrl ? [uploadedPhotoUrl] : [],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.data?.id) {
          createdId = `MT-${String(data.data.id).slice(-6).toUpperCase()}`;
        }
      }
    } catch {
      // Offline fallback — store locally and open WhatsApp cleanly
    }

    try {
      const existing = JSON.parse(localStorage.getItem("sc-maintenance") ?? "[]");
      localStorage.setItem(
        "sc-maintenance",
        JSON.stringify([
          {
            id: createdId,
            ...form,
            damagePhotos: uploadedPhotoUrl ? [uploadedPhotoUrl] : [],
            status: "OPEN",
            createdAt: new Date().toISOString(),
          },
          ...existing,
        ])
      );
    } catch {
      // ignore storage errors
    }

    const serviceLabel = SERVICES.find((s) => s.id === form.serviceType)?.label ?? form.serviceType;
    const waLines = [
      "Hello Square Cube Furniture! 🛠️",
      "",
      `I would like to book a *Furniture Maintenance & Care* visit (${createdId}):`,
      "",
      `• *Service:* ${serviceLabel}`,
      `• *Furniture Item:* ${form.furnitureItem}`,
      `• *Issue:* ${form.issueDescription}`,
      `• *Preferred Date:* ${form.preferredDate || "Flexible"}`,
      `• *Name:* ${form.name}`,
      `• *Phone:* ${form.phone}`,
      form.city ? `• *Location:* ${form.city}` : null,
      uploadedPhotoUrl ? `\n*Damage Photo:* ${uploadedPhotoUrl}` : null,
      "",
      "Please share inspection availability and cost estimate.",
    ]
      .filter(Boolean)
      .join("\n");

    const waUrl = generateWhatsAppUrl(whatsappNumber, waLines);
    setTicketId(createdId);
    setLastWaUrl(waUrl);
    setSubmitted(true);
    setLoading(false);

    window.open(waUrl, "_blank", "noopener,noreferrer");
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-alabaster px-4 py-20">
        <div className="bg-white border border-warm-border p-10 text-center max-w-md w-full shadow-luxury">
          <CheckCircle className="text-emerald-600 mx-auto mb-4" size={52} />
          <h2 className="font-display text-3xl font-semibold text-espresso mb-2">
            Restoration Ticket Booked
          </h2>
          <p className="font-ui text-sm text-espresso/65 mb-1">
            Ticket Reference: <strong className="text-espresso font-mono">{ticketId}</strong>
          </p>
          <p className="font-ui text-sm text-espresso/60 mb-7">
            Your ticket is registered with Square Cube Furniture and WhatsApp concierge is ready.
          </p>
          <div className="space-y-3">
            <a
              href={lastWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp w-full py-3.5 text-xs uppercase tracking-wider font-semibold"
            >
              Open WhatsApp Message
            </a>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setForm(EMPTY);
                setPhotoFile(null);
                setPhotoPreview(null);
                setUploadedPhotoUrl(null);
              }}
              className="btn-outline w-full py-3 text-xs"
            >
              Book Another Service
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-alabaster">
      {/* Hero */}
      <div style={{ backgroundColor: "#231F1E" }} className="py-16 text-center px-4">
        <p className="section-label text-champagne mb-4">
          Square Cube Furniture · Concierge Care
        </p>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-white mb-4">
          Maintenance &amp; Restoration Portal
        </h1>
        <p className="font-ui text-white/65 text-base sm:text-lg max-w-2xl mx-auto">
          Preserve heirloom timber, renew upholstery, fix soft-close wardrobe hardware, or schedule
          safe dismantling &amp; shifting with Square Cube Furniture master technicians.
        </p>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Service Cards */}
        <div className="mb-14">
          <p className="section-label mb-3">Specialist Services</p>
          <h2 className="editorial-heading text-3xl mb-6">Select What Needs Care</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SERVICES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  set("serviceType", s.id);
                  document.getElementById("maintenance-form")?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`text-left p-5 bg-white border transition-all ${
                  form.serviceType === s.id
                    ? "border-champagne shadow-luxury"
                    : "border-warm-border hover:border-champagne/60"
                }`}
              >
                <span className="text-2xl block mb-2.5">{s.icon}</span>
                <p className="font-display text-lg font-semibold text-espresso mb-1">{s.label}</p>
                <p className="font-ui text-xs text-espresso/55 leading-relaxed">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Booking Form */}
        <div id="maintenance-form" className="max-w-3xl mx-auto">
          <div className="bg-white border border-warm-border p-7 sm:p-10 shadow-luxury">
            <div className="flex items-center justify-between mb-7 pb-5 border-b border-warm-border">
              <div className="flex items-center gap-3">
                <Wrench className="text-champagne" size={22} />
                <div>
                  <h2 className="font-display text-2xl font-semibold text-espresso">
                    Schedule Technician Visit
                  </h2>
                  <p className="font-ui text-xs text-espresso/50">
                    Ticket syncs to Admin Dashboard &amp; opens WhatsApp Concierge
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-ui text-champagne">
                <Shield size={14} /> Quality Guaranteed
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="form-label">Service Type *</label>
                <select
                  value={form.serviceType}
                  onChange={(e) => set("serviceType", e.target.value)}
                  className="input-luxury"
                >
                  {SERVICES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.icon} {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Furniture Item *</label>
                <input
                  required
                  value={form.furnitureItem}
                  onChange={(e) => set("furnitureItem", e.target.value)}
                  placeholder="e.g. 6-Seater Teak Dining Table, L-Shape Sofa, 3-Door Wardrobe"
                  className="input-luxury"
                />
              </div>

              <div>
                <label className="form-label">Issue Description *</label>
                <textarea
                  required
                  value={form.issueDescription}
                  onChange={(e) => set("issueDescription", e.target.value)}
                  rows={4}
                  placeholder="Describe surface wear, sagging cushions, hinge misalignment, or shifting address…"
                  className="input-luxury resize-none"
                />
              </div>

              {/* Optional Damage Photo Upload (Cloudinary) */}
              <div>
                <label className="form-label">Damage / Item Photo (Optional)</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-warm-border hover:border-champagne transition-colors p-4 flex items-center justify-between gap-4 cursor-pointer bg-alabaster/50"
                >
                  <div className="flex items-center gap-3">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Damage preview" className="w-16 h-16 object-cover border border-warm-border" />
                    ) : (
                      <div className="w-12 h-12 bg-white border border-warm-border flex items-center justify-center">
                        <Upload size={18} className="text-champagne" />
                      </div>
                    )}
                    <div>
                      <p className="font-ui text-sm font-medium text-espresso">
                        {photoFile ? photoFile.name : "Upload damage photo for faster quote"}
                      </p>
                      <p className="font-ui text-xs text-espresso/50">
                        {uploading
                          ? "Uploading to Cloudinary…"
                          : uploadedPhotoUrl
                          ? "✓ Uploaded to Cloudinary — attached to ticket & WhatsApp"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Your Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Full name"
                    className="input-luxury"
                  />
                </div>
                <div>
                  <label className="form-label">WhatsApp Phone *</label>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="input-luxury"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Location / City</label>
                  <input
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    placeholder="e.g. Kochi, Kerala"
                    className="input-luxury"
                  />
                </div>
                <div>
                  <label className="form-label">Preferred Date</label>
                  <input
                    type="date"
                    value={form.preferredDate}
                    onChange={(e) => set("preferredDate", e.target.value)}
                    className="input-luxury"
                  />
                </div>
                <div>
                  <label className="form-label">Email (optional)</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="you@example.com"
                    className="input-luxury"
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-700 text-xs font-ui bg-red-50 border border-red-200 p-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || uploading}
                className="btn-whatsapp w-full py-4 text-xs tracking-wider uppercase font-semibold rounded-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Submitting Ticket…
                  </>
                ) : (
                  <>
                    <Sparkles size={15} /> Submit Ticket &amp; Open WhatsApp Concierge
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
