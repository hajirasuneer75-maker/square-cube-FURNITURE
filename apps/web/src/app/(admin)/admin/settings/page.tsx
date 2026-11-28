"use client";

import { useState, useEffect } from "react";
import {
  MessageCircle,
  Building2,
  Megaphone,
  Calculator,
  Check,
  Plus,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import type { EstimatorRate } from "@/types";
import { useSettingsStore, SETTINGS_DEFAULTS } from "@/store/useSettingsStore";
import { DEFAULT_ESTIMATOR_RATES } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const store = useSettingsStore();
  const [draft, setDraft] = useState({ ...SETTINGS_DEFAULTS });
  const [rates, setRates] = useState<EstimatorRate[]>(DEFAULT_ESTIMATOR_RATES);
  const [newMaterial, setNewMaterial] = useState("");
  const [newRate, setNewRate] = useState("2000");
  const [newDesc, setNewDesc] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft({
      whatsappNumber: store.whatsappNumber,
      whatsappDisplay: store.whatsappDisplay,
      businessName: store.businessName,
      businessTagline: store.businessTagline,
      businessEmail: store.businessEmail,
      businessCity: store.businessCity,
      announcementText: store.announcementText,
      announcementEnabled: store.announcementEnabled,
      heroHeadline: store.heroHeadline,
      heroSubheadline: store.heroSubheadline,
      heroBannerUrl: store.heroBannerUrl,
    });

    Promise.all([
      fetch("/api/proxy/site-settings").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/proxy/estimator-rates/all").then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]).then(([settingsJson, ratesJson]) => {
      if (settingsJson?.success && settingsJson.data) {
        const d = settingsJson.data as Record<string, string>;
        setDraft((prev) => ({
          ...prev,
          ...(d.whatsappNumber ? { whatsappNumber: d.whatsappNumber } : {}),
          ...(d.whatsappDisplay ? { whatsappDisplay: d.whatsappDisplay } : {}),
          ...(d.businessName ? { businessName: d.businessName } : {}),
          ...(d.businessTagline ? { businessTagline: d.businessTagline } : {}),
          ...(d.businessEmail ? { businessEmail: d.businessEmail } : {}),
          ...(d.businessCity ? { businessCity: d.businessCity } : {}),
          ...(d.announcementText ? { announcementText: d.announcementText } : {}),
          ...(d.announcementEnabled !== undefined ? { announcementEnabled: d.announcementEnabled !== "false" } : {}),
          ...(d.heroHeadline ? { heroHeadline: d.heroHeadline } : {}),
          ...(d.heroSubheadline ? { heroSubheadline: d.heroSubheadline } : {}),
          ...(d.heroBannerUrl ? { heroBannerUrl: d.heroBannerUrl } : {}),
        }));
      }
      if (ratesJson?.success && Array.isArray(ratesJson.data) && ratesJson.data.length > 0) {
        setRates(ratesJson.data);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set<K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    setSaved(false);
  }

  function handleWANumberChange(raw: string) {
    const digits = raw.replace(/\D/g, "");
    set("whatsappNumber", digits);
    if (digits.length >= 10) {
      const country = digits.slice(0, digits.length - 10);
      const local = digits.slice(-10);
      set("whatsappDisplay", `+${country} ${local.slice(0, 5)} ${local.slice(5)}`.trim());
    }
  }

  async function handleSaveAll() {
    store.updateSettings(draft);
    await fetch("/api/proxy/site-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...draft,
        announcementEnabled: String(draft.announcementEnabled),
      }),
    }).catch(() => {});
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleUpdateRate(rate: EstimatorRate, nextValue: number) {
    setRates((prev) => prev.map((r) => (r.id === rate.id ? { ...r, ratePerSqFt: nextValue } : r)));
    await fetch(`/api/proxy/estimator-rates/${rate.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ratePerSqFt: nextValue }),
    }).catch(() => {});
  }

  async function handleAddRate() {
    if (!newMaterial.trim()) return;
    const res = await fetch("/api/proxy/estimator-rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        material: newMaterial.trim(),
        ratePerSqFt: Number(newRate) || 2000,
        description: newDesc.trim() || null,
      }),
    }).catch(() => null);
    if (res && res.ok) {
      const json = await res.json();
      if (json.data) {
        setRates((prev) => [...prev.filter((r) => r.id !== json.data.id), json.data]);
      }
    }
    setNewMaterial("");
    setNewRate("2000");
    setNewDesc("");
  }

  async function handleDeleteRate(id: string) {
    setRates((prev) => prev.filter((r) => r.id !== id));
    await fetch(`/api/proxy/estimator-rates/${id}`, { method: "DELETE" }).catch(() => {});
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl bg-alabaster min-h-full">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <p className="section-label mb-1">Square Cube Furniture · Studio Configuration</p>
          <h1 className="text-2xl font-display font-semibold text-espresso">
            Estimator Rates &amp; Store Settings
          </h1>
          <p className="text-sm font-ui text-espresso/60 mt-0.5">
            Control live Custom Studio wood rates, homepage banners, and official WhatsApp number.
          </p>
        </div>
        <button
          onClick={handleSaveAll}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 text-xs font-ui font-semibold uppercase tracking-wider transition-all flex-shrink-0",
            saved ? "bg-emerald-600 text-white" : "bg-espresso text-white hover:bg-champagne"
          )}
        >
          {saved ? <><Check size={14} /> Saved</> : "Save All Settings"}
        </button>
      </div>

      <div className="space-y-6">
        {/* Estimator Rates */}
        <section className="bg-white border border-warm-border shadow-luxury">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-warm-border bg-alabaster">
            <Calculator size={17} className="text-champagne" />
            <div>
              <h2 className="font-display text-lg font-semibold text-espresso">
                Custom Studio Timber Rates (INR / sq.ft)
              </h2>
              <p className="text-xs font-ui text-espresso/55">
                Used immediately by the Custom Studio Live Price Estimator.
              </p>
            </div>
          </div>
          <div className="p-6 space-y-3">
            {rates.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-3 p-3 bg-alabaster border border-warm-border">
                <div className="flex-1 min-w-[160px]">
                  <p className="font-ui text-sm font-semibold text-espresso">{r.material}</p>
                  {r.description && <p className="text-xs text-espresso/50">{r.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-ui text-espresso/60">₹</span>
                  <input
                    type="number"
                    value={r.ratePerSqFt}
                    onChange={(e) => handleUpdateRate(r, parseFloat(e.target.value) || 0)}
                    className="w-28 input-luxury py-1.5 text-center font-semibold"
                  />
                  <span className="text-xs font-ui text-espresso/50">/ sq.ft</span>
                </div>
                <button
                  onClick={() => handleDeleteRate(r.id)}
                  className="p-1.5 text-espresso/45 hover:text-red-600"
                  title="Remove material rate"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            <div className="pt-3 border-t border-warm-border flex flex-wrap gap-2">
              <input
                value={newMaterial}
                onChange={(e) => setNewMaterial(e.target.value)}
                placeholder="New material (e.g. Jackwood)"
                className="input-luxury flex-1 min-w-[160px] text-xs"
              />
              <input
                type="number"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                placeholder="Rate ₹/sq.ft"
                className="input-luxury w-28 text-xs text-center"
              />
              <input
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Short note"
                className="input-luxury flex-1 min-w-[140px] text-xs"
              />
              <button
                type="button"
                onClick={handleAddRate}
                className="btn-outline py-2 px-4 text-xs"
              >
                <Plus size={14} /> Add Rate
              </button>
            </div>
          </div>
        </section>

        {/* WhatsApp Contact */}
        <section className="bg-white border border-warm-border shadow-luxury">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-warm-border bg-alabaster">
            <MessageCircle size={17} className="text-champagne" />
            <div>
              <h2 className="font-display text-lg font-semibold text-espresso">
                Official Shop WhatsApp Number
              </h2>
              <p className="text-xs font-ui text-espresso/55">
                Digits with country code, no &quot;+&quot; prefix (default: 918547097173).
              </p>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">WhatsApp Digits</label>
              <input
                value={draft.whatsappNumber}
                onChange={(e) => handleWANumberChange(e.target.value)}
                placeholder="918547097173"
                className="input-luxury font-mono"
              />
            </div>
            <div>
              <label className="form-label">Display Format</label>
              <input
                value={draft.whatsappDisplay}
                onChange={(e) => set("whatsappDisplay", e.target.value)}
                placeholder="+91 85470 97173"
                className="input-luxury"
              />
            </div>
          </div>
        </section>

        {/* Homepage Banner & Announcement */}
        <section className="bg-white border border-warm-border shadow-luxury">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-warm-border bg-alabaster">
            <ImageIcon size={17} className="text-champagne" />
            <div>
              <h2 className="font-display text-lg font-semibold text-espresso">
                Homepage Banners &amp; Top Announcement
              </h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="form-label">Hero Headline</label>
              <input
                value={draft.heroHeadline}
                onChange={(e) => set("heroHeadline", e.target.value)}
                className="input-luxury"
              />
            </div>
            <div>
              <label className="form-label">Hero Subheadline</label>
              <textarea
                rows={2}
                value={draft.heroSubheadline}
                onChange={(e) => set("heroSubheadline", e.target.value)}
                className="input-luxury resize-none"
              />
            </div>
            <div>
              <label className="form-label">Hero Banner Image URL</label>
              <input
                value={draft.heroBannerUrl}
                onChange={(e) => set("heroBannerUrl", e.target.value)}
                className="input-luxury text-xs"
              />
            </div>
            <div>
              <label className="form-label flex items-center gap-2">
                <Megaphone size={13} className="text-champagne" /> Top Announcement Strip
              </label>
              <input
                value={draft.announcementText}
                onChange={(e) => set("announcementText", e.target.value)}
                className="input-luxury"
              />
              <label className="inline-flex items-center gap-2 mt-2 text-xs font-ui cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.announcementEnabled}
                  onChange={(e) => set("announcementEnabled", e.target.checked)}
                  className="accent-espresso"
                />
                Show top announcement strip
              </label>
            </div>
          </div>
        </section>

        {/* Business Info */}
        <section className="bg-white border border-warm-border shadow-luxury">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-warm-border bg-alabaster">
            <Building2 size={17} className="text-champagne" />
            <h2 className="font-display text-lg font-semibold text-espresso">
              Business Identity
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Brand Name</label>
              <input
                value={draft.businessName}
                onChange={(e) => set("businessName", e.target.value)}
                placeholder="Square Cube Furniture"
                className="input-luxury"
              />
            </div>
            <div>
              <label className="form-label">Studio Tagline</label>
              <input
                value={draft.businessTagline}
                onChange={(e) => set("businessTagline", e.target.value)}
                placeholder="Architectural Woodcraft & Custom Studio"
                className="input-luxury"
              />
            </div>
            <div>
              <label className="form-label">Business Email</label>
              <input
                value={draft.businessEmail}
                onChange={(e) => set("businessEmail", e.target.value)}
                className="input-luxury"
              />
            </div>
            <div>
              <label className="form-label">City / Region</label>
              <input
                value={draft.businessCity}
                onChange={(e) => set("businessCity", e.target.value)}
                className="input-luxury"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
