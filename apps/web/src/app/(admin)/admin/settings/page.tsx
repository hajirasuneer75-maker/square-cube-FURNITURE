"use client";

import { useState, useEffect } from "react";
import {
  MessageCircle, Building2, Megaphone, RotateCcw,
  Check, AlertTriangle, Eye, EyeOff,
} from "lucide-react";
import { useSettingsStore, SETTINGS_DEFAULTS } from "@/store/useSettingsStore";
import { cn } from "@/lib/utils";

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-stone-200 overflow-hidden">
      <div className="flex items-start gap-3 px-5 py-4 border-b border-stone-100 bg-stone-50">
        <div className="w-8 h-8 bg-stone-900 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon size={15} />
        </div>
        <div>
          <h2 className="font-semibold text-stone-900 text-sm">{title}</h2>
          <p className="text-xs text-stone-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="px-5 py-5 space-y-4">
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-stone-400 mt-1">{hint}</p>}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SettingsPage() {
  const store = useSettingsStore();

  // Local draft so user can edit without immediately saving
  const [draft, setDraft] = useState({ ...SETTINGS_DEFAULTS });
  const [saved, setSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showWAPreview, setShowWAPreview] = useState(false);

  // Hydrate draft from persisted store on mount
  useEffect(() => {
    setDraft({
      whatsappNumber:      store.whatsappNumber,
      whatsappDisplay:     store.whatsappDisplay,
      businessName:        store.businessName,
      businessTagline:     store.businessTagline,
      businessEmail:       store.businessEmail,
      businessCity:        store.businessCity,
      announcementText:    store.announcementText,
      announcementEnabled: store.announcementEnabled,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set(key: keyof typeof draft, value: string | boolean) {
    setDraft((d) => ({ ...d, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    store.updateSettings(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleReset() {
    store.resetSettings();
    setDraft({ ...SETTINGS_DEFAULTS });
    setShowResetConfirm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  // Auto-format WA number as user types (keep only digits)
  function handleWANumberChange(raw: string) {
    const digits = raw.replace(/\D/g, "");
    set("whatsappNumber", digits);
    // Auto-fill display if it matches default pattern
    if (digits.length >= 10) {
      const country = digits.slice(0, digits.length - 10);
      const local   = digits.slice(-10);
      const formatted = `+${country} ${local.slice(0, 5)} ${local.slice(5)}`.trim();
      set("whatsappDisplay", formatted);
    }
  }

  const waPreviewUrl = `https://wa.me/${draft.whatsappNumber}?text=${encodeURIComponent("Hello " + draft.businessName + "! I'd like to enquire about your furniture.")}`;

  return (
    <div className="p-6 lg:p-8 max-w-3xl">

      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Settings</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Manage your business info, WhatsApp number, and storefront settings.
          </p>
        </div>
        <button
          onClick={handleSave}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all flex-shrink-0",
            saved
              ? "bg-green-600 text-white"
              : "bg-stone-900 text-white hover:bg-stone-700"
          )}
        >
          {saved ? (
            <><Check size={14} /> Saved!</>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>

      <div className="space-y-6">

        {/* ── WhatsApp ── */}
        <Section
          icon={MessageCircle}
          title="WhatsApp Contact"
          description="This number appears on every quote button, product card, and contact CTA across your store."
        >
          <Field
            label="WhatsApp Number"
            hint="Include country code with no spaces or dashes. India: 91 + 10-digit number."
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={draft.whatsappNumber}
                onChange={(e) => handleWANumberChange(e.target.value)}
                placeholder="919876543210"
                className="input-base font-mono text-sm flex-1"
                maxLength={15}
              />
              <button
                type="button"
                onClick={() => setShowWAPreview((v) => !v)}
                title="Preview WhatsApp link"
                className="px-3 border border-stone-200 text-stone-500 hover:text-stone-900 hover:border-stone-400 transition-colors"
              >
                {showWAPreview ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {showWAPreview && (
              <div className="mt-2 p-3 bg-stone-50 border border-stone-200 text-xs break-all">
                <span className="text-stone-400">Preview URL: </span>
                <a
                  href={waPreviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#25D366] underline"
                >
                  {waPreviewUrl}
                </a>
              </div>
            )}
          </Field>

          <Field
            label="Display Text"
            hint="Shown in the footer and contact bar. E.g. +91 98765 43210"
          >
            <input
              type="text"
              value={draft.whatsappDisplay}
              onChange={(e) => set("whatsappDisplay", e.target.value)}
              placeholder="+91 98765 43210"
              className="input-base text-sm"
            />
          </Field>
        </Section>

        {/* ── Business Info ── */}
        <Section
          icon={Building2}
          title="Business Information"
          description="Displayed in the site header, footer, and admin panel."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Business Name">
              <input
                type="text"
                value={draft.businessName}
                onChange={(e) => set("businessName", e.target.value)}
                placeholder="Square Cube"
                className="input-base text-sm"
              />
            </Field>
            <Field label="Tagline">
              <input
                type="text"
                value={draft.businessTagline}
                onChange={(e) => set("businessTagline", e.target.value)}
                placeholder="Bespoke Furniture"
                className="input-base text-sm"
              />
            </Field>
            <Field label="Business Email">
              <input
                type="email"
                value={draft.businessEmail}
                onChange={(e) => set("businessEmail", e.target.value)}
                placeholder="hello@squarecube.in"
                className="input-base text-sm"
              />
            </Field>
            <Field label="City / Location">
              <input
                type="text"
                value={draft.businessCity}
                onChange={(e) => set("businessCity", e.target.value)}
                placeholder="Pune, India"
                className="input-base text-sm"
              />
            </Field>
          </div>
        </Section>

        {/* ── Announcement Bar ── */}
        <Section
          icon={Megaphone}
          title="Announcement Bar"
          description="The strip at the very top of your store. Use it for promotions, offers, or delivery info."
        >
          <Field label="Announcement Text">
            <textarea
              rows={2}
              value={draft.announcementText}
              onChange={(e) => set("announcementText", e.target.value)}
              placeholder="✦ Free delivery on orders above ₹50,000  ·  WhatsApp us for a free consultation"
              className="input-base text-sm resize-none"
            />
          </Field>

          <div className="flex items-center justify-between p-4 bg-stone-50 border border-stone-200">
            <div>
              <p className="text-sm font-medium text-stone-800">Show announcement bar</p>
              <p className="text-xs text-stone-400 mt-0.5">
                When off, the bar is hidden for all visitors
              </p>
            </div>
            <button
              type="button"
              onClick={() => set("announcementEnabled", !draft.announcementEnabled)}
              className={cn(
                "w-11 h-6 rounded-full transition-colors relative flex-shrink-0",
                draft.announcementEnabled ? "bg-stone-900" : "bg-stone-300"
              )}
              aria-checked={draft.announcementEnabled}
              role="switch"
            >
              <span className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                draft.announcementEnabled ? "translate-x-6" : "translate-x-1"
              )} />
            </button>
          </div>

          {/* Preview */}
          {draft.announcementEnabled && (
            <div className="bg-stone-900 text-white text-xs py-2 px-4 text-center">
              <span className="tracking-wide">{draft.announcementText || "Announcement text preview"}</span>
            </div>
          )}
        </Section>

        {/* ── Save button ── */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-red-500 transition-colors"
          >
            <RotateCcw size={12} />
            Reset all to defaults
          </button>
          <button
            onClick={handleSave}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all",
              saved
                ? "bg-green-600 text-white"
                : "bg-stone-900 text-white hover:bg-stone-700"
            )}
          >
            {saved ? <><Check size={14} /> Saved!</> : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Reset confirmation modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white p-6 max-w-sm w-full shadow-xl text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={22} className="text-amber-600" />
            </div>
            <h3 className="font-semibold text-stone-900 mb-2">Reset all settings?</h3>
            <p className="text-sm text-stone-500 mb-6">
              This will restore all settings to their factory defaults including the WhatsApp number.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2.5 bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
