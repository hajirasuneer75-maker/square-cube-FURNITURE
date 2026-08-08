"use client";

import { useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  MessageCircle,
  Home,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAVIGATION_CATEGORIES, WOOD_TYPES } from "@/lib/constants/categories";
import { useSettingsStore } from "@/store/useSettingsStore";
import DropZone from "./DropZone";
import AIQuoteButton from "./AIQuoteButton";

const BUDGET_RANGES = [
  "Under ₹20,000",
  "₹20,000 – ₹50,000",
  "₹50,000 – ₹1,00,000",
  "₹1,00,000 – ₹2,00,000",
  "Above ₹2,00,000",
  "Flexible – let's discuss",
];

const STEPS = [
  { id: 1, label: "Your Details"   },
  { id: 2, label: "Your Vision"    },
  { id: 3, label: "Reference Images" },
  { id: 4, label: "Review"         },
];

interface FormState {
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
}

const INITIAL: FormState = {
  name: "", phone: "", email: "", city: "",
  furnitureType: "", woodType: "", budgetRange: "",
  length: "", width: "", height: "", description: "",
};

// ─── Step progress indicator ──────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center mb-10">
      {STEPS.map((step, idx) => {
        const done   = current > step.id;
        const active = current === step.id;
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
                done   ? "bg-stone-900 border-stone-900 text-white"
                       : active ? "border-stone-900 bg-white text-stone-900"
                                : "border-stone-200 bg-white text-stone-300"
              )}>
                {done ? <Check size={13} strokeWidth={3} /> : step.id}
              </div>
              <span className={cn(
                "text-[10px] font-medium uppercase tracking-wider whitespace-nowrap hidden sm:block",
                active ? "text-stone-800" : done ? "text-stone-500" : "text-stone-300"
              )}>
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-2 transition-colors",
                current > step.id ? "bg-stone-900" : "bg-stone-200"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Field helpers ────────────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function Input({
  value, onChange, placeholder, type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="input-base"
    />
  );
}

function Select({
  value, onChange, options, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input-base appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 fill=%22none%22 stroke=%22%23888%22 stroke-width=%221.5%22 viewBox=%220 0 24 24%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19 9l-7 7-7-7%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_0.75rem_center]"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CustomOrderForm() {
  const { whatsappNumber } = useSettingsStore();
  const [step, setStep]           = useState(1);
  const [form, setForm]           = useState<FormState>(INITIAL);
  const [files, setFiles]         = useState<File[]>([]);
  const [stepError, setStepError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submission, setSubmission] = useState<{ enquiryId: string; waUrl: string } | null>(null);

  function set(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setStepError(null);
  }

  // ── Validation ──────────────────────────────────────────────────────────────
  function validate(s: number): string | null {
    if (s === 1) {
      if (!form.name.trim()) return "Full name is required.";
      if (form.phone.replace(/\D/g, "").length < 10)
        return "Enter a valid 10-digit WhatsApp number.";
    }
    if (s === 2) {
      if (!form.furnitureType) return "Please select the type of furniture.";
      if (form.description.trim().length < 20)
        return "Please describe your requirement (at least 20 characters).";
      if (!form.budgetRange) return "Please select an approximate budget.";
    }
    return null;
  }

  function handleNext() {
    const err = validate(step);
    if (err) { setStepError(err); return; }
    setStepError(null);
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleBack() {
    setStepError(null);
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    setIsSubmitting(true);
    setStepError(null);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    files.forEach((f) => fd.append("files", f));

    try {
      const res  = await fetch("/api/custom-order", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setStepError(data.error ?? "Submission failed. Please try again.");
        return;
      }

      // Build a WhatsApp follow-up URL
      const lines = [
        "Hello Square Cube! 🛋️",
        "",
        `I just submitted a custom furniture request (${data.enquiryId}).`,
        `*Name:* ${form.name}`,
        `*Phone:* ${form.phone}`,
        form.city ? `*City:* ${form.city}` : null,
        "",
        `*Furniture:* ${form.furnitureType}`,
        form.woodType   ? `*Wood:* ${form.woodType}`     : null,
        `*Budget:* ${form.budgetRange}`,
        [form.length, form.width, form.height].some(Boolean)
          ? `*Size:* L ${form.length}cm × W ${form.width}cm × H ${form.height}cm`
          : null,
        "",
        `*Details:* ${form.description}`,
        "",
        "Please let me know the next steps. Thank you!",
      ].filter(Boolean).join("\n");

      // Persist to localStorage so admin panel can see it
      try {
        const entry = {
          id:              data.enquiryId,
          createdAt:       new Date().toISOString(),
          name:            form.name,
          phone:           form.phone,
          email:           form.email,
          city:            form.city,
          furnitureType:   form.furnitureType,
          woodType:        form.woodType || "",
          budgetRange:     form.budgetRange,
          length:          form.length,
          width:           form.width,
          height:          form.height,
          description:     form.description,
          referenceImages: [] as string[],
          status:          "new",
        };
        const existing = JSON.parse(localStorage.getItem("sc-enquiries") ?? "[]");
        localStorage.setItem("sc-enquiries", JSON.stringify([entry, ...existing]));
      } catch { /* localStorage unavailable */ }

      setSubmission({
        enquiryId: data.enquiryId,
        waUrl: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines)}`,
      });
    } catch {
      setStepError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Success state ────────────────────────────────────────────────────────────
  if (submission) {
    return (
      <div className="bg-white border border-stone-200 p-10 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={32} strokeWidth={2.5} className="text-green-600" />
        </div>
        <h2 className="font-display text-2xl text-stone-900 mb-2">Request Submitted!</h2>
        <p className="text-stone-500 text-sm mb-1">
          Your enquiry ID is{" "}
          <span className="font-mono font-semibold text-stone-800">{submission.enquiryId}</span>
        </p>
        <p className="text-stone-400 text-sm mb-8">
          We'll review your request and reach out within 2–3 hours on WhatsApp.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={submission.waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
          >
            <MessageCircle size={18} />
            Follow Up on WhatsApp
          </a>
          <a href="/" className="btn-outline flex items-center justify-center gap-2">
            <Home size={16} />
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white border border-stone-200 p-6 sm:p-8">
      <StepIndicator current={step} />

      {/* ── Step 1: Contact ─── */}
      {step === 1 && (
        <div className="space-y-5">
          <h2 className="font-display text-xl text-stone-900 mb-6">Tell us who you are</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label required>Full Name</Label>
              <Input value={form.name} onChange={(v) => set("name", v)} placeholder="Priya Sharma" />
            </div>
            <div>
              <Label required>WhatsApp Number</Label>
              <Input value={form.phone} onChange={(v) => set("phone", v)} placeholder="98765 43210" type="tel" />
            </div>
            <div>
              <Label>Email Address</Label>
              <Input value={form.email} onChange={(v) => set("email", v)} placeholder="priya@example.com" type="email" />
            </div>
            <div>
              <Label>City</Label>
              <Input value={form.city} onChange={(v) => set("city", v)} placeholder="Mumbai" />
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Vision ─── */}
      {step === 2 && (
        <div className="space-y-5">
          <h2 className="font-display text-xl text-stone-900 mb-6">Describe your vision</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label required>Furniture Type</Label>
              <Select
                value={form.furnitureType}
                onChange={(v) => set("furnitureType", v)}
                placeholder="Select category…"
                options={NAVIGATION_CATEGORIES.filter((c) => c.slug !== "custom").map((c) => c.name)}
              />
            </div>
            <div>
              <Label>Preferred Wood</Label>
              <Select
                value={form.woodType}
                onChange={(v) => set("woodType", v)}
                placeholder="Any / Discuss on WhatsApp"
                options={WOOD_TYPES}
              />
            </div>
            <div className="sm:col-span-2">
              <Label required>Approximate Budget</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {BUDGET_RANGES.map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => set("budgetRange", range)}
                    className={cn(
                      "px-3 py-2.5 border-2 text-xs font-medium text-left transition-all",
                      form.budgetRange === range
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-200 text-stone-600 hover:border-stone-400"
                    )}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Size (optional) */}
          <div>
            <Label>Approximate Dimensions <span className="text-stone-400 normal-case font-normal">(optional, in cm)</span></Label>
            <div className="grid grid-cols-3 gap-3">
              {(["length", "width", "height"] as const).map((dim) => (
                <div key={dim}>
                  <p className="text-[11px] text-stone-400 uppercase tracking-wider mb-1">
                    {dim === "length" ? "Length" : dim === "width" ? "Width" : "Height"}
                  </p>
                  <input
                    type="number"
                    min="0"
                    value={form[dim]}
                    onChange={(e) => set(dim, e.target.value)}
                    placeholder="–"
                    className="input-base text-center text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label required>Describe Your Requirement</Label>
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="E.g. I need a king-size bed with hydraulic storage, teak wood, natural polish, and built-in side tables. The headboard should have a fabric upholstered panel…"
              className="input-base resize-none text-sm leading-relaxed"
            />
            <p className="text-xs text-stone-400 mt-1.5">
              {form.description.trim().length} / 20 characters minimum
            </p>
          </div>
        </div>
      )}

      {/* ── Step 3: Images ─── */}
      {step === 3 && (
        <div>
          <h2 className="font-display text-xl text-stone-900 mb-2">Reference images</h2>
          <p className="text-sm text-stone-400 mb-6">
            Upload Pinterest photos, sketches, or anything that captures your vision. Completely optional — we can discuss on WhatsApp too.
          </p>
          <DropZone files={files} onChange={setFiles} maxFiles={5} maxSizeMB={10} />
        </div>
      )}

      {/* ── Step 4: Review ─── */}
      {step === 4 && (
        <div>
          <h2 className="font-display text-xl text-stone-900 mb-6">Review your request</h2>

          <div className="space-y-4">
            {/* Contact */}
            <section className="border border-stone-200 p-4">
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-3">Your Details</p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
                <ReviewRow label="Name"   value={form.name}               />
                <ReviewRow label="Phone"  value={form.phone}              />
                {form.email && <ReviewRow label="Email" value={form.email} />}
                {form.city  && <ReviewRow label="City"  value={form.city}  />}
              </div>
            </section>

            {/* Vision */}
            <section className="border border-stone-200 p-4">
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-3">Furniture Details</p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-sm mb-3">
                <ReviewRow label="Type"   value={form.furnitureType}     />
                <ReviewRow label="Budget" value={form.budgetRange}        />
                {form.woodType && <ReviewRow label="Wood" value={form.woodType} />}
                {(form.length || form.width || form.height) && (
                  <ReviewRow
                    label="Size"
                    value={[
                      form.length && `L ${form.length}cm`,
                      form.width  && `W ${form.width}cm`,
                      form.height && `H ${form.height}cm`,
                    ].filter(Boolean).join(" × ")}
                  />
                )}
              </div>
              <div>
                <p className="text-xs text-stone-400 mb-1">Description</p>
                <p className="text-sm text-stone-700 leading-relaxed">{form.description}</p>
              </div>
            </section>

            {/* Files */}
            {files.length > 0 && (
              <section className="border border-stone-200 p-4">
                <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">Reference Images</p>
                <p className="text-sm text-stone-700">{files.length} file{files.length !== 1 ? "s" : ""} attached</p>
              </section>
            )}
          </div>

          {/* AI Quote Generator */}
          <div className="mt-6 pt-6 border-t border-stone-100">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
              AI Quote Preview
            </p>
            <p className="text-sm text-stone-500 mb-4">
              Generate a draft WhatsApp quote message powered by AI — copy it to send alongside your submission.
            </p>
            <AIQuoteButton
              orderData={{
                name:          form.name,
                furnitureType: form.furnitureType,
                woodType:      form.woodType || undefined,
                budgetRange:   form.budgetRange,
                dimensions:    [
                  form.length && `L ${form.length}cm`,
                  form.width  && `W ${form.width}cm`,
                  form.height && `H ${form.height}cm`,
                ].filter(Boolean).join(" × ") || undefined,
                description: form.description,
              }}
            />
          </div>
        </div>
      )}

      {/* Error message */}
      {stepError && (
        <div className="mt-5 flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 text-xs text-red-700">
          <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
          {stepError}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-100">
        <button
          type="button"
          onClick={handleBack}
          className={cn(
            "btn-ghost flex items-center gap-1.5",
            step === 1 && "invisible"
          )}
        >
          <ChevronLeft size={16} />
          Back
        </button>

        {step < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            className="btn-primary flex items-center gap-2"
          >
            Continue
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <><Loader2 size={16} className="animate-spin" /> Submitting…</>
            ) : (
              <><Check size={16} /> Submit Request</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Tiny helper ─────────────────────────────────────────────────────────────

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-stone-400 text-xs">{label}: </span>
      <span className="text-stone-800 font-medium">{value}</span>
    </div>
  );
}
