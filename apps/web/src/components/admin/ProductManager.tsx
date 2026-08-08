"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, X, Check, AlertTriangle, ChevronDown } from "lucide-react";
import type { Product, WoodType } from "@/types";
import { MOCK_PRODUCTS } from "@/lib/constants/mockData";
import { NAVIGATION_CATEGORIES, WOOD_TYPES } from "@/lib/constants/categories";
import { formatPrice, cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type ModalMode = "add" | "edit";
type FormDraft = Pick<Product,
  | "name" | "sku" | "shortDescription" | "basePrice"
  | "categoryName" | "categorySlug" | "categoryId"
  | "manufacturingTime" | "deliveryTime" | "warranty"
  | "isFeatured" | "isActive"
> & { availableWoods: WoodType[] };

const BLANK_DRAFT: FormDraft = {
  name: "", sku: "", shortDescription: "", basePrice: 0,
  categoryName: "", categorySlug: "", categoryId: "",
  manufacturingTime: "", deliveryTime: "", warranty: "",
  isFeatured: false, isActive: true,
  availableWoods: [],
};

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

// ─── ProductManager ───────────────────────────────────────────────────────────

export default function ProductManager() {
  const [products, setProducts]   = useState<Product[]>(MOCK_PRODUCTS);
  const [modal, setModal]         = useState<{ mode: ModalMode; draft: FormDraft; originalId?: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [search, setSearch]       = useState("");
  const [savedId, setSavedId]     = useState<string | null>(null);

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  // ── Open modal helpers ─────────────────────────────────────────────────────
  function openAdd() {
    setModal({ mode: "add", draft: { ...BLANK_DRAFT } });
  }

  function openEdit(p: Product) {
    setModal({
      mode: "edit",
      originalId: p.id,
      draft: {
        name: p.name, sku: p.sku, shortDescription: p.shortDescription,
        basePrice: p.basePrice, categoryName: p.categoryName,
        categorySlug: p.categorySlug, categoryId: p.categoryId,
        manufacturingTime: p.manufacturingTime ?? "",
        deliveryTime: p.deliveryTime ?? "",
        warranty: p.warranty ?? "",
        isFeatured: p.isFeatured, isActive: p.isActive,
        availableWoods: p.availableWoods ? [...p.availableWoods] : [],
      },
    });
  }

  function setDraft(patch: Partial<FormDraft>) {
    setModal((m) => m ? { ...m, draft: { ...m.draft, ...patch } } : null);
  }

  function handleCategoryChange(name: string) {
    const cat = NAVIGATION_CATEGORIES.find((c) => c.name === name);
    setDraft({
      categoryName: name,
      categorySlug: cat?.slug ?? toSlug(name),
      categoryId:   cat?.id   ?? toSlug(name),
    });
  }

  // ── Save ────────────────────────────────────────────────────────────────────
  function handleSave() {
    if (!modal) return;
    const { mode, draft, originalId } = modal;

    if (mode === "add") {
      const newProduct: Product = {
        ...draft,
        id:           Date.now().toString(),
        slug:         toSlug(draft.name),
        description:  draft.shortDescription,
        primaryImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&h=500&fit=crop",
        images:       [],
      };
      setProducts((prev) => [newProduct, ...prev]);
      setSavedId(newProduct.id);
    } else {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === originalId
            ? { ...p, ...draft, slug: toSlug(draft.name) }
            : p
        )
      );
      setSavedId(originalId ?? null);
    }

    setModal(null);
    setTimeout(() => setSavedId(null), 2000);
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  function confirmDelete() {
    if (deleteTarget) {
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget));
      setDeleteTarget(null);
    }
  }

  // ── Wood entries helpers ────────────────────────────────────────────────────
  const [newWoodName, setNewWoodName]     = useState("");
  const [newWoodModifier, setNewWoodModifier] = useState("0");

  function addWood() {
    if (!newWoodName || !modal) return;
    const slug = toSlug(newWoodName);
    const entry: WoodType = {
      id: slug, name: newWoodName, slug,
      priceModifier: parseFloat(newWoodModifier) || 0,
      priceModifierType: "FIXED_ADD",
    };
    setDraft({ availableWoods: [...modal.draft.availableWoods, entry] });
    setNewWoodName("");
    setNewWoodModifier("0");
  }

  function removeWood(idx: number) {
    if (!modal) return;
    setDraft({ availableWoods: modal.draft.availableWoods.filter((_, i) => i !== idx) });
  }

  function updateWoodModifier(idx: number, value: string) {
    if (!modal) return;
    const updated = modal.draft.availableWoods.map((w, i) =>
      i === idx ? { ...w, priceModifier: parseFloat(value) || 0 } : w
    );
    setDraft({ availableWoods: updated });
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 lg:p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Products</h1>
          <p className="text-sm text-stone-500 mt-0.5">{products.length} total</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
          <Plus size={15} />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="search"
          placeholder="Search by name or SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-base max-w-xs text-sm"
        />
      </div>

      {/* Table */}
      <div className="border border-stone-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-stone-200 bg-stone-50">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Product</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Category</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Base Price</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Woods</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtered.map((p) => (
              <tr
                key={p.id}
                className={cn(
                  "hover:bg-stone-50 transition-colors",
                  savedId === p.id && "bg-green-50"
                )}
              >
                {/* Product */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 relative flex-shrink-0 border border-stone-200 overflow-hidden">
                      <Image src={p.primaryImage} alt={p.name} fill sizes="40px" className="object-cover" />
                    </div>
                    <div>
                      <p className="font-medium text-stone-900 leading-tight">{p.name}</p>
                      <p className="text-xs text-stone-400 font-mono">{p.sku}</p>
                    </div>
                  </div>
                </td>
                {/* Category */}
                <td className="px-4 py-3 text-stone-600">{p.categoryName}</td>
                {/* Price */}
                <td className="px-4 py-3 font-medium text-stone-900">{formatPrice(p.basePrice)}</td>
                {/* Woods */}
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {(p.availableWoods ?? []).slice(0, 3).map((w) => (
                      <span key={w.id} className="text-[10px] px-1.5 py-0.5 bg-stone-100 text-stone-600 font-medium">
                        {w.name}
                      </span>
                    ))}
                    {(p.availableWoods?.length ?? 0) > 3 && (
                      <span className="text-[10px] text-stone-400">+{(p.availableWoods?.length ?? 0) - 3}</span>
                    )}
                  </div>
                </td>
                {/* Status */}
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 w-fit",
                      p.isActive ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"
                    )}>
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                    {p.isFeatured && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-gold-100 text-gold-700 w-fit">
                        Featured
                      </span>
                    )}
                  </div>
                </td>
                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => openEdit(p)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(p.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-stone-400">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Edit / Add Modal ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-8 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl shadow-xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
              <h2 className="font-semibold text-stone-900">
                {modal.mode === "add" ? "Add New Product" : "Edit Product"}
              </h2>
              <button onClick={() => setModal(null)} className="p-1.5 hover:bg-stone-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Modal form */}
            <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

              {/* Row: Name / SKU */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="form-label">Product Name</label>
                  <input
                    className="input-base text-sm"
                    value={modal.draft.name}
                    onChange={(e) => setDraft({ name: e.target.value })}
                    placeholder="Royal Teak Dining Table"
                  />
                </div>
                <div>
                  <label className="form-label">SKU</label>
                  <input
                    className="input-base text-sm font-mono"
                    value={modal.draft.sku}
                    onChange={(e) => setDraft({ sku: e.target.value })}
                    placeholder="SC-DT-001"
                  />
                </div>
              </div>

              {/* Row: Category / Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Category</label>
                  <select
                    className="input-base text-sm"
                    value={modal.draft.categoryName}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    <option value="">Select…</option>
                    {NAVIGATION_CATEGORIES.filter((c) => c.slug !== "custom").map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Base Price (₹)</label>
                  <input
                    type="number"
                    className="input-base text-sm"
                    value={modal.draft.basePrice || ""}
                    onChange={(e) => setDraft({ basePrice: parseFloat(e.target.value) || 0 })}
                    placeholder="85000"
                  />
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="form-label">Short Description</label>
                <textarea
                  rows={2}
                  className="input-base text-sm resize-none"
                  value={modal.draft.shortDescription}
                  onChange={(e) => setDraft({ shortDescription: e.target.value })}
                  placeholder="Briefly describe the product…"
                />
              </div>

              {/* Row: Mfg Time / Delivery / Warranty */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { key: "manufacturingTime" as const, label: "Mfg. Time", ph: "20–25 days" },
                  { key: "deliveryTime"      as const, label: "Delivery",  ph: "3–5 days"   },
                  { key: "warranty"          as const, label: "Warranty",  ph: "2 Years"     },
                ].map(({ key, label, ph }) => (
                  <div key={key}>
                    <label className="form-label">{label}</label>
                    <input
                      className="input-base text-sm"
                      value={modal.draft[key] ?? ""}
                      onChange={(e) => setDraft({ [key]: e.target.value })}
                      placeholder={ph}
                    />
                  </div>
                ))}
              </div>

              {/* Toggles */}
              <div className="flex gap-6">
                {([
                  { key: "isActive",   label: "Active (visible on store)" },
                  { key: "isFeatured", label: "Featured on homepage"      },
                ] as { key: "isActive" | "isFeatured"; label: string }[]).map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                    <button
                      type="button"
                      onClick={() => setDraft({ [key]: !modal.draft[key] })}
                      className={cn(
                        "w-9 h-5 rounded-full transition-colors relative",
                        modal.draft[key] ? "bg-stone-900" : "bg-stone-200"
                      )}
                    >
                      <span className={cn(
                        "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                        modal.draft[key] ? "translate-x-4" : "translate-x-0.5"
                      )} />
                    </button>
                    <span className="text-sm text-stone-700">{label}</span>
                  </label>
                ))}
              </div>

              {/* Wood types */}
              <div>
                <p className="form-label mb-3">Available Wood Types & Price Modifiers</p>
                <div className="space-y-2 mb-3">
                  {modal.draft.availableWoods.map((w, idx) => (
                    <div key={w.id} className="flex items-center gap-2 p-2.5 bg-stone-50 border border-stone-200">
                      <span className="flex-1 text-sm font-medium text-stone-700">{w.name}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-stone-400">±₹</span>
                        <input
                          type="number"
                          value={w.priceModifier}
                          onChange={(e) => updateWoodModifier(idx, e.target.value)}
                          className="w-24 border border-stone-200 px-2 py-1 text-sm text-center focus:outline-none focus:border-stone-400"
                          placeholder="0"
                        />
                      </div>
                      <button
                        onClick={() => removeWood(idx)}
                        className="p-1 text-stone-400 hover:text-red-500 transition-colors"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                  {modal.draft.availableWoods.length === 0 && (
                    <p className="text-xs text-stone-400 py-2">No wood types added yet.</p>
                  )}
                </div>

                {/* Add wood row */}
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <select
                      value={newWoodName}
                      onChange={(e) => setNewWoodName(e.target.value)}
                      className="input-base text-sm"
                    >
                      <option value="">Select wood to add…</option>
                      {WOOD_TYPES
                        .filter((w) => !modal.draft.availableWoods.some((aw) => aw.name === w))
                        .map((w) => <option key={w} value={w}>{w}</option>)
                      }
                    </select>
                  </div>
                  <div className="flex items-center gap-1 border border-stone-200 px-2">
                    <span className="text-xs text-stone-400">±₹</span>
                    <input
                      type="number"
                      value={newWoodModifier}
                      onChange={(e) => setNewWoodModifier(e.target.value)}
                      className="w-20 py-2 text-sm text-center focus:outline-none"
                      placeholder="0"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addWood}
                    disabled={!newWoodName}
                    className="btn-outline flex items-center gap-1.5 py-2 px-3 text-sm disabled:opacity-40"
                  >
                    <Plus size={14} />
                    Add
                  </button>
                </div>
              </div>

            </div>

            {/* Modal footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-stone-200 bg-stone-50">
              <button onClick={() => setModal(null)} className="btn-ghost">Cancel</button>
              <button
                onClick={handleSave}
                disabled={!modal.draft.name || !modal.draft.sku}
                className="btn-primary flex items-center gap-2 text-sm py-2 px-4 disabled:opacity-40"
              >
                <Check size={14} />
                {modal.mode === "add" ? "Create Product" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirmation ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white p-6 max-w-sm w-full shadow-xl text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={22} className="text-red-600" />
            </div>
            <h3 className="font-semibold text-stone-900 mb-2">Delete this product?</h3>
            <p className="text-sm text-stone-500 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
