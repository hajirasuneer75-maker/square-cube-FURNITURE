"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, X, Check, Upload, Loader2 } from "lucide-react";
import type { Category } from "@/types";
import { slugify } from "@/lib/utils";
import { DEFAULT_CATEGORY_IMAGES } from "@/lib/api";

interface CategoryDraft {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  icon: string;
}

const BLANK: CategoryDraft = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  icon: "🪵",
};

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: "add" | "edit"; id?: string; draft: CategoryDraft } | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadCategories() {
    setLoading(true);
    try {
      const res = await fetch("/api/proxy/categories");
      const json = await res.json();
      if (res.ok && json.success) {
        setCategories(json.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleImageUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/proxy/upload?folder=categories", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || "Cloudinary upload failed — paste an image URL instead.");
      } else if (modal) {
        setModal({ ...modal, draft: { ...modal.draft, imageUrl: data.url } });
      }
    } catch {
      setError("Upload failed. You can still paste an HTTPS image URL.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!modal || !modal.draft.name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...modal.draft,
        slug: modal.draft.slug.trim() || slugify(modal.draft.name),
      };
      const url =
        modal.mode === "add"
          ? "/api/proxy/categories"
          : `/api/proxy/categories/${modal.id}`;
      const res = await fetch(url, {
        method: modal.mode === "add" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Could not save category.");
        return;
      }
      setModal(null);
      await loadCategories();
    } catch {
      setError("Network error while saving category.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    const res = await fetch(`/api/proxy/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json().catch(() => null);
      setError(json?.error || "Could not delete category.");
      return;
    }
    await loadCategories();
  }

  return (
    <div className="p-6 lg:p-8 bg-alabaster min-h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="section-label mb-1">Square Cube Furniture · Store Structure</p>
          <h1 className="text-2xl font-display font-semibold text-espresso">Category Manager</h1>
          <p className="text-xs font-ui text-espresso/55 mt-0.5">
            Manage category names and cover images shown on the homepage &amp; mega-menu.
          </p>
        </div>
        <button
          onClick={() => {
            setError(null);
            setModal({ mode: "add", draft: { ...BLANK } });
          }}
          className="btn-primary py-2.5 px-4 text-xs"
        >
          <Plus size={14} /> Add Category
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-xs font-ui text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-sm font-ui text-espresso/50">Loading categories…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {categories.map((cat) => {
            const cover = cat.imageUrl || DEFAULT_CATEGORY_IMAGES[cat.slug] || DEFAULT_CATEGORY_IMAGES["living-room"];
            return (
              <div key={cat.id} className="bg-white border border-warm-border overflow-hidden shadow-luxury flex flex-col">
                <div className="relative aspect-[16/10] bg-alabaster">
                  <Image src={cover} alt={cat.name} fill sizes="320px" className="object-cover" />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-espresso">
                        {cat.icon} {cat.name}
                      </h3>
                      <p className="text-[11px] font-mono text-espresso/45">/{cat.slug}</p>
                    </div>
                    <span className="text-[10px] font-ui bg-alabaster border border-warm-border px-2 py-0.5 text-espresso/70">
                      {cat._count?.products ?? 0} items
                    </span>
                  </div>
                  {cat.description && (
                    <p className="text-xs font-ui text-espresso/55 mt-2 line-clamp-2">{cat.description}</p>
                  )}
                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-warm-border">
                    <button
                      onClick={() => {
                        setError(null);
                        setModal({
                          mode: "edit",
                          id: cat.id,
                          draft: {
                            name: cat.name,
                            slug: cat.slug,
                            description: cat.description ?? "",
                            imageUrl: cat.imageUrl ?? "",
                            icon: cat.icon ?? "🪵",
                          },
                        });
                      }}
                      className="p-1.5 text-espresso/60 hover:text-espresso hover:bg-alabaster transition-colors"
                      title="Edit category"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 text-espresso/50 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete category"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/60 p-4">
          <div className="bg-white border border-warm-border w-full max-w-lg shadow-luxury-hover">
            <div className="flex items-center justify-between px-6 py-4 border-b border-warm-border bg-alabaster">
              <h2 className="font-display text-xl font-semibold text-espresso">
                {modal.mode === "add" ? "New Category" : "Edit Category"}
              </h2>
              <button onClick={() => setModal(null)} className="p-1.5 hover:bg-warm-border/40">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-3">
                  <label className="form-label">Category Name *</label>
                  <input
                    className="input-luxury"
                    value={modal.draft.name}
                    onChange={(e) =>
                      setModal({
                        ...modal,
                        draft: {
                          ...modal.draft,
                          name: e.target.value,
                          slug: modal.mode === "add" ? slugify(e.target.value) : modal.draft.slug,
                        },
                      })
                    }
                    placeholder="Living Room"
                  />
                </div>
                <div>
                  <label className="form-label">Icon</label>
                  <input
                    className="input-luxury text-center"
                    value={modal.draft.icon}
                    onChange={(e) =>
                      setModal({ ...modal, draft: { ...modal.draft, icon: e.target.value } })
                    }
                    placeholder="🛋️"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">URL Slug</label>
                <input
                  className="input-luxury font-mono text-xs"
                  value={modal.draft.slug}
                  onChange={(e) =>
                    setModal({ ...modal, draft: { ...modal.draft, slug: e.target.value } })
                  }
                />
              </div>

              <div>
                <label className="form-label">Cover Image (Cloudinary Upload or URL)</label>
                <div className="flex gap-2">
                  <input
                    className="input-luxury flex-1 text-xs"
                    value={modal.draft.imageUrl}
                    onChange={(e) =>
                      setModal({ ...modal, draft: { ...modal.draft, imageUrl: e.target.value } })
                    }
                    placeholder="https://res.cloudinary.com/..."
                  />
                  <label className="btn-outline-champagne px-3 py-2 text-xs cursor-pointer flex items-center gap-1.5">
                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleImageUpload(f);
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea
                  rows={2}
                  className="input-luxury resize-none"
                  value={modal.draft.description}
                  onChange={(e) =>
                    setModal({ ...modal, draft: { ...modal.draft, description: e.target.value } })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-warm-border bg-alabaster">
              <button onClick={() => setModal(null)} className="btn-ghost text-xs">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !modal.draft.name.trim()}
                className="btn-primary py-2.5 px-5 text-xs"
              >
                <Check size={14} /> {saving ? "Saving…" : "Save Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
