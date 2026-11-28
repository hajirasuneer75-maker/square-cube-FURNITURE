"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Upload,
  Loader2,
  Star,
} from "lucide-react";
import type { Category, Product, ProductImage, WoodType } from "@/types";
import { MOCK_PRODUCTS } from "@/lib/constants/mockData";
import { NAVIGATION_CATEGORIES, WOOD_TYPES } from "@/lib/constants/categories";
import { formatPrice, cn, slugify } from "@/lib/utils";
import { mapApiProduct } from "@/lib/api";

const FINISH_PRESETS = ["Natural Matte", "Walnut Stain", "PU Gloss", "Honey Teak", "Duco Matte"];
const FABRIC_PRESETS = ["Ivory Bouclé", "Warm Oatmeal Linen", "Cognac Tan Leather", "Charcoal Linen", "Emerald Velvet"];

interface FormDraft {
  name: string;
  sku: string;
  shortDescription: string;
  description: string;
  basePrice: number;
  offerPrice: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  dimensionsText: string;
  stock: number;
  manufacturingTime: string;
  deliveryTime: string;
  warranty: string;
  isFeatured: boolean;
  isActive: boolean;
  finishSwatches: string[];
  fabricSwatches: string[];
  images: Array<{ url: string; isPrimary: boolean; angle: ProductImage["angle"] }>;
  availableWoods: WoodType[];
}

const BLANK_DRAFT: FormDraft = {
  name: "",
  sku: "",
  shortDescription: "",
  description: "",
  basePrice: 0,
  offerPrice: "",
  categoryId: "",
  categoryName: "",
  categorySlug: "",
  dimensionsText: "",
  stock: 10,
  manufacturingTime: "15–22 days",
  deliveryTime: "3–5 days",
  warranty: "5 Years",
  isFeatured: false,
  isActive: true,
  finishSwatches: ["Natural Matte", "Walnut Stain"],
  fabricSwatches: [],
  images: [],
  availableWoods: [],
};

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: "add" | "edit"; draft: FormDraft; originalId?: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newImgUrl, setNewImgUrl] = useState("");
  const [newWoodName, setNewWoodName] = useState("");
  const [newWoodModifier, setNewWoodModifier] = useState("0");

  async function loadAll() {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/proxy/admin/products"),
        fetch("/api/proxy/categories"),
      ]);
      const prodJson = prodRes.ok ? await prodRes.json() : null;
      const catJson = catRes.ok ? await catRes.json() : null;

      if (prodJson?.success && Array.isArray(prodJson.data)) {
        setProducts(prodJson.data.map(mapApiProduct));
      } else {
        setProducts(MOCK_PRODUCTS);
      }

      if (catJson?.success && Array.isArray(catJson.data)) {
        setCategories(catJson.data);
      } else {
        setCategories(
          NAVIGATION_CATEGORIES.filter((c) => c.slug !== "custom").map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
          }))
        );
      }
    } catch {
      setProducts(MOCK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() {
    setError(null);
    const defaultCat = categories[0];
    setModal({
      mode: "add",
      draft: {
        ...BLANK_DRAFT,
        categoryId: defaultCat?.id ?? "",
        categoryName: defaultCat?.name ?? "",
        categorySlug: defaultCat?.slug ?? "",
      },
    });
  }

  function openEdit(p: Product) {
    setError(null);
    setModal({
      mode: "edit",
      originalId: p.id,
      draft: {
        name: p.name,
        sku: p.sku,
        shortDescription: p.shortDescription,
        description: p.description || p.shortDescription,
        basePrice: p.basePrice,
        offerPrice: p.offerPrice ? String(p.offerPrice) : "",
        categoryId: p.categoryId,
        categoryName: p.categoryName,
        categorySlug: p.categorySlug,
        dimensionsText: p.dimensionsText ?? "",
        stock: p.stock ?? 10,
        manufacturingTime: p.manufacturingTime ?? "",
        deliveryTime: p.deliveryTime ?? "",
        warranty: p.warranty ?? "",
        isFeatured: p.isFeatured,
        isActive: p.isActive,
        finishSwatches: p.finishSwatches ?? ["Natural Matte", "Walnut Stain"],
        fabricSwatches: p.fabricSwatches ?? [],
        images: p.images.map((i) => ({ url: i.url, isPrimary: i.isPrimary, angle: i.angle })),
        availableWoods: p.availableWoods ? [...p.availableWoods] : [],
      },
    });
  }

  function setDraft(patch: Partial<FormDraft>) {
    setModal((m) => (m ? { ...m, draft: { ...m.draft, ...patch } } : null));
  }

  function handleCategoryChange(id: string) {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;
    setDraft({
      categoryId: cat.id,
      categoryName: cat.name,
      categorySlug: cat.slug,
    });
  }

  async function handleUploadImage(files: FileList) {
    if (!modal) return;
    setUploadingImg(true);
    setError(null);
    try {
      const added: Array<{ url: string; isPrimary: boolean; angle: ProductImage["angle"] }> = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/proxy/upload?folder=products", { method: "POST", body: fd });
        const json = await res.json();
        if (!res.ok || !json.url) {
          setError(json.error || "Cloudinary upload failed. Paste image URL instead.");
          continue;
        }
        added.push({
          url: json.url,
          isPrimary: modal.draft.images.length === 0 && added.length === 0,
          angle: "FRONT",
        });
      }
      if (added.length > 0) {
        setDraft({ images: [...modal.draft.images, ...added] });
      }
    } finally {
      setUploadingImg(false);
    }
  }

  function addImageUrl() {
    if (!modal || !newImgUrl.trim()) return;
    setDraft({
      images: [
        ...modal.draft.images,
        {
          url: newImgUrl.trim(),
          isPrimary: modal.draft.images.length === 0,
          angle: "FRONT",
        },
      ],
    });
    setNewImgUrl("");
  }

  function toggleSwatch(listKey: "finishSwatches" | "fabricSwatches", val: string) {
    if (!modal) return;
    const current = modal.draft[listKey];
    setDraft({
      [listKey]: current.includes(val) ? current.filter((x) => x !== val) : [...current, val],
    });
  }

  function addWood() {
    if (!newWoodName || !modal) return;
    const slug = slugify(newWoodName);
    const entry: WoodType = {
      id: slug,
      name: newWoodName,
      slug,
      priceModifier: parseFloat(newWoodModifier) || 0,
      priceModifierType: "FIXED_ADD",
    };
    setDraft({ availableWoods: [...modal.draft.availableWoods, entry] });
    setNewWoodName("");
    setNewWoodModifier("0");
  }

  async function handleSave() {
    if (!modal) return;
    setSaving(true);
    setError(null);
    const { mode, draft, originalId } = modal;

    const payload = {
      name: draft.name,
      slug: slugify(draft.name),
      sku: draft.sku,
      categoryId: draft.categoryId,
      shortDescription: draft.shortDescription,
      description: draft.description || draft.shortDescription,
      basePrice: Number(draft.basePrice),
      offerPrice: draft.offerPrice ? Number(draft.offerPrice) : null,
      dimensions: draft.dimensionsText || null,
      stock: Number(draft.stock) || 0,
      manufacturingTime: draft.manufacturingTime || null,
      deliveryTime: draft.deliveryTime || null,
      warranty: draft.warranty || null,
      isFeatured: draft.isFeatured,
      isActive: draft.isActive,
      finishSwatches: draft.finishSwatches,
      fabricSwatches: draft.fabricSwatches,
      images: draft.images,
      woodVariants: draft.availableWoods.map((w) => ({
        woodName: w.name,
        priceModifier: w.priceModifier,
        priceModifierType: w.priceModifierType,
      })),
    };

    try {
      const url = mode === "add" ? "/api/proxy/products" : `/api/proxy/products/${originalId}`;
      const res = await fetch(url, {
        method: mode === "add" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || "Failed to save product.");
        return;
      }
      setModal(null);
      setSavedId(json.data.id);
      await loadAll();
      setTimeout(() => setSavedId(null), 2000);
    } catch {
      setError("Could not reach backend API.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/proxy/products/${deleteTarget}`, { method: "DELETE" });
    setDeleteTarget(null);
    await loadAll();
  }

  return (
    <div className="p-6 lg:p-8 bg-alabaster min-h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="section-label mb-1">Square Cube Furniture · Catalog</p>
          <h1 className="text-2xl font-display font-semibold text-espresso">Product Manager</h1>
          <p className="text-xs font-ui text-espresso/55 mt-0.5">
            {products.length} products · Offer prices, dimensions, swatches &amp; Cloudinary gallery
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 py-2.5 px-4 text-xs">
          <Plus size={14} /> Add Product
        </button>
      </div>

      <div className="mb-4">
        <input
          type="search"
          placeholder="Search by name or SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-luxury max-w-xs text-sm"
        />
      </div>

      <div className="border border-warm-border bg-white overflow-x-auto shadow-luxury">
        <table className="w-full text-sm font-ui">
          <thead className="border-b border-warm-border bg-alabaster">
            <tr>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-espresso/55 uppercase tracking-wider">Product</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-espresso/55 uppercase tracking-wider">Category</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-espresso/55 uppercase tracking-wider">Price</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-espresso/55 uppercase tracking-wider">Stock</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-espresso/55 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-espresso/45">
                  Loading products…
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr
                  key={p.id}
                  className={cn(
                    "hover:bg-alabaster/60 transition-colors",
                    savedId === p.id && "bg-emerald-50"
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 relative flex-shrink-0 border border-warm-border overflow-hidden">
                        <Image src={p.primaryImage} alt={p.name} fill sizes="44px" className="object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-espresso leading-tight">{p.name}</p>
                        <p className="text-[11px] text-espresso/45 font-mono">
                          {p.sku} {p.dimensionsText ? `· ${p.dimensionsText}` : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-espresso/75">{p.categoryName}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-espresso">
                      {formatPrice(p.offerPrice && p.offerPrice < p.basePrice ? p.offerPrice : p.basePrice)}
                    </span>
                    {p.offerPrice && p.offerPrice < p.basePrice && (
                      <span className="ml-1.5 text-xs text-espresso/40 line-through">
                        {formatPrice(p.basePrice)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-espresso/70">{p.stock ?? 10}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span
                        className={cn(
                          "text-[10px] font-semibold px-2 py-0.5 w-fit",
                          p.isActive ? "bg-emerald-100 text-emerald-700" : "bg-alabaster text-espresso/50"
                        )}
                      >
                        {p.isActive ? "Active" : "Draft"}
                      </span>
                      {p.isFeatured && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-bronze-100 text-bronze-700 w-fit">
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 justify-end">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 text-espresso/50 hover:text-espresso hover:bg-alabaster transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p.id)}
                        className="p-1.5 text-espresso/50 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-espresso/60 p-4 pt-6 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl shadow-luxury-hover border border-warm-border">
            <div className="flex items-center justify-between px-6 py-4 border-b border-warm-border bg-alabaster">
              <h2 className="font-display text-xl font-semibold text-espresso">
                {modal.mode === "add" ? "Add New Product" : "Edit Product"}
              </h2>
              <button onClick={() => setModal(null)} className="p-1.5 hover:bg-warm-border/50">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">
              {error && (
                <p className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 font-ui">{error}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="form-label">Product Name *</label>
                  <input
                    className="input-luxury"
                    value={modal.draft.name}
                    onChange={(e) => setDraft({ name: e.target.value })}
                    placeholder="Nilambur Heritage Dining Table"
                  />
                </div>
                <div>
                  <label className="form-label">SKU *</label>
                  <input
                    className="input-luxury font-mono"
                    value={modal.draft.sku}
                    onChange={(e) => setDraft({ sku: e.target.value })}
                    placeholder="SCF-DT-101"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="form-label">Category *</label>
                  <select
                    className="input-luxury"
                    value={modal.draft.categoryId}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    <option value="">Select category…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Regular Price (₹) *</label>
                  <input
                    type="number"
                    className="input-luxury"
                    value={modal.draft.basePrice || ""}
                    onChange={(e) => setDraft({ basePrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="form-label">Offer Price (₹)</label>
                  <input
                    type="number"
                    className="input-luxury"
                    value={modal.draft.offerPrice}
                    onChange={(e) => setDraft({ offerPrice: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="form-label">Dimensions</label>
                  <input
                    className="input-luxury"
                    value={modal.draft.dimensionsText}
                    onChange={(e) => setDraft({ dimensionsText: e.target.value })}
                    placeholder="72 × 36 × 30 in"
                  />
                </div>
                <div>
                  <label className="form-label">Stock</label>
                  <input
                    type="number"
                    className="input-luxury"
                    value={modal.draft.stock}
                    onChange={(e) => setDraft({ stock: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>
                <div>
                  <label className="form-label">Warranty</label>
                  <input
                    className="input-luxury"
                    value={modal.draft.warranty}
                    onChange={(e) => setDraft({ warranty: e.target.value })}
                    placeholder="5 Years"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Short Description</label>
                <textarea
                  rows={2}
                  className="input-luxury resize-none"
                  value={modal.draft.shortDescription}
                  onChange={(e) => setDraft({ shortDescription: e.target.value })}
                />
              </div>

              {/* Multiple Images */}
              <div>
                <label className="form-label">Product Images (Cloudinary Multi-Upload or URL)</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {modal.draft.images.map((img, idx) => (
                    <div key={idx} className="relative w-24 h-20 border border-warm-border overflow-hidden group">
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() =>
                          setDraft({
                            images: modal.draft.images.map((x, i) => ({ ...x, isPrimary: i === idx })),
                          })
                        }
                        title="Set as primary"
                        className={`absolute bottom-1 left-1 p-1 rounded ${
                          img.isPrimary ? "bg-champagne text-white" : "bg-white/85 text-espresso/60"
                        }`}
                      >
                        <Star size={10} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDraft({
                            images: modal.draft.images.filter((_, i) => i !== idx),
                          })
                        }
                        className="absolute top-1 right-1 p-1 bg-espresso/80 text-white"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  <label className="w-24 h-20 border-2 border-dashed border-warm-border hover:border-champagne flex flex-col items-center justify-center cursor-pointer text-xs font-ui text-espresso/60">
                    {uploadingImg ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    <span className="mt-1 text-[10px]">Upload</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.length) handleUploadImage(e.target.files);
                      }}
                    />
                  </label>
                </div>
                <div className="flex gap-2">
                  <input
                    className="input-luxury flex-1 text-xs"
                    value={newImgUrl}
                    onChange={(e) => setNewImgUrl(e.target.value)}
                    placeholder="Or paste HTTPS image URL…"
                  />
                  <button type="button" onClick={addImageUrl} className="btn-outline px-3 py-2 text-xs">
                    Add URL
                  </button>
                </div>
              </div>

              {/* Finish & Fabric Swatches */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Finish Swatches</label>
                  <div className="flex flex-wrap gap-1.5">
                    {FINISH_PRESETS.map((f) => {
                      const active = modal.draft.finishSwatches.includes(f);
                      return (
                        <button
                          key={f}
                          type="button"
                          onClick={() => toggleSwatch("finishSwatches", f)}
                          className={`px-2.5 py-1 text-xs border ${
                            active ? "bg-espresso text-white border-espresso" : "bg-white text-espresso/70 border-warm-border"
                          }`}
                        >
                          {f}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="form-label">Fabric / Upholstery Swatches</label>
                  <div className="flex flex-wrap gap-1.5">
                    {FABRIC_PRESETS.map((f) => {
                      const active = modal.draft.fabricSwatches.includes(f);
                      return (
                        <button
                          key={f}
                          type="button"
                          onClick={() => toggleSwatch("fabricSwatches", f)}
                          className={`px-2.5 py-1 text-xs border ${
                            active ? "bg-champagne text-white border-champagne" : "bg-white text-espresso/70 border-warm-border"
                          }`}
                        >
                          {f}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Wood Variants */}
              <div>
                <label className="form-label">Wood / Material Options &amp; Price Adjustments</label>
                <div className="space-y-2 mb-2.5">
                  {modal.draft.availableWoods.map((w, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 bg-alabaster border border-warm-border">
                      <span className="flex-1 text-xs font-semibold text-espresso">{w.name}</span>
                      <span className="text-xs text-espresso/50">±₹</span>
                      <input
                        type="number"
                        value={w.priceModifier}
                        onChange={(e) => {
                          const updated = modal.draft.availableWoods.map((x, i) =>
                            i === idx ? { ...x, priceModifier: parseFloat(e.target.value) || 0 } : x
                          );
                          setDraft({ availableWoods: updated });
                        }}
                        className="w-24 input-luxury py-1 text-center text-xs"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setDraft({
                            availableWoods: modal.draft.availableWoods.filter((_, i) => i !== idx),
                          })
                        }
                        className="p-1 text-espresso/50 hover:text-red-500"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <select
                    value={newWoodName}
                    onChange={(e) => setNewWoodName(e.target.value)}
                    className="input-luxury flex-1 text-xs"
                  >
                    <option value="">Select wood to add…</option>
                    {WOOD_TYPES.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={newWoodModifier}
                    onChange={(e) => setNewWoodModifier(e.target.value)}
                    className="w-24 input-luxury text-center text-xs"
                    placeholder="±₹"
                  />
                  <button
                    type="button"
                    onClick={addWood}
                    disabled={!newWoodName}
                    className="btn-outline py-2 px-3 text-xs"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-ui">
                  <input
                    type="checkbox"
                    checked={modal.draft.isActive}
                    onChange={(e) => setDraft({ isActive: e.target.checked })}
                    className="accent-espresso"
                  />
                  <span>Active on Storefront</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-ui">
                  <input
                    type="checkbox"
                    checked={modal.draft.isFeatured}
                    onChange={(e) => setDraft({ isFeatured: e.target.checked })}
                    className="accent-champagne"
                  />
                  <span>Featured Piece</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-warm-border bg-alabaster">
              <button onClick={() => setModal(null)} className="btn-ghost text-xs">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving || !modal.draft.name || !modal.draft.sku || !modal.draft.categoryId}
                className="btn-primary py-2.5 px-5 text-xs"
              >
                <Check size={14} /> {saving ? "Saving…" : modal.mode === "add" ? "Create Product" : "Save Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/60 p-4">
          <div className="bg-white p-6 max-w-sm w-full shadow-luxury-hover text-center border border-warm-border">
            <AlertTriangle size={28} className="text-red-600 mx-auto mb-3" />
            <h3 className="font-display text-xl font-semibold text-espresso mb-2">Delete product?</h3>
            <p className="text-xs font-ui text-espresso/60 mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="btn-ghost flex-1 text-xs">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-2.5 bg-red-600 text-white text-xs font-semibold">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
