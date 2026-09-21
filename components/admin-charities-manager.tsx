"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Loader2, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import type { Charity, Profile } from "@/lib/types";

export function AdminCharitiesManager({
  initialCharities,
  profiles
}: {
  initialCharities: Charity[];
  profiles: Profile[];
}) {
  const [charities, setCharities] = useState<Charity[]>(initialCharities);
  const [editingCharity, setEditingCharity] = useState<Charity | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Youth sport");
  const [description, setDescription] = useState("");
  const [impactMetric, setImpactMetric] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  function openAddModal() {
    setName("");
    setCategory("Youth sport");
    setDescription("");
    setImpactMetric("");
    setImageUrl("https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80");
    setIsFeatured(false);
    setError("");
    setEditingCharity(null);
    setIsAdding(true);
  }

  function openEditModal(c: Charity) {
    setName(c.name);
    setCategory(c.category);
    setDescription(c.description);
    setImpactMetric(c.impactMetric);
    setImageUrl(c.imageUrl);
    setIsFeatured(c.isFeatured);
    setError("");
    setIsAdding(false);
    setEditingCharity(c);
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isAdding) {
        const response = await fetch("/api/charities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, category, description, impactMetric, imageUrl, isFeatured })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to create charity");
        setCharities([data.charity, ...charities]);
        setIsAdding(false);
      } else if (editingCharity) {
        const response = await fetch(`/api/charities/${editingCharity.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, category, description, impactMetric, imageUrl, isFeatured })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to update charity");
        setCharities(charities.map((c) => (c.id === editingCharity.id ? data.charity : c)));
        setEditingCharity(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to remove this charity partner?")) return;
    try {
      const response = await fetch(`/api/charities/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete charity");
      setCharities(charities.filter((c) => c.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  }

  async function toggleFeatured(charity: Charity) {
    try {
      const updated = !charity.isFeatured;
      const response = await fetch(`/api/charities/${charity.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: updated })
      });
      const data = await response.json();
      if (response.ok) {
        setCharities(charities.map((c) => (c.id === charity.id ? data.charity : c)));
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-forest">
            <span>Non-Profit Directory</span>
          </div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Charity Partners & Spotlights
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Configure designated giving causes, review member supporter counts, and toggle homepage featured spotlights.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg bg-forest px-4 text-xs font-semibold text-white hover:bg-forest-800 transition-colors shadow-soft"
        >
          <Plus className="h-3.5 w-3.5 text-gold-light" />
          Add Giving Partner
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {charities.map((charity) => {
          const supporterCount = profiles.filter((profile) => profile.charityId === charity.id).length;
          return (
            <article
              key={charity.id}
              className="grid overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-soft transition-all duration-200 hover:border-slate-300 hover:shadow-card sm:grid-cols-[180px_1fr]"
            >
              <div className="relative min-h-48 bg-slate-100">
                <Image
                  src={charity.imageUrl || "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80"}
                  alt=""
                  fill
                  sizes="180px"
                  className="object-cover"
                />
              </div>
              <div className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {charity.category}
                      </span>
                      <h2 className="mt-0.5 text-base font-bold text-slate-900">{charity.name}</h2>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleFeatured(charity)}
                        title={charity.isFeatured ? "Unmark featured" : "Mark as featured on Homepage"}
                        className={`flex h-7 w-7 items-center justify-center rounded-md border text-xs transition-colors ${
                          charity.isFeatured
                            ? "border-gold/40 bg-gold-light text-gold-dark"
                            : "border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                        }`}
                      >
                        <Star className={`h-3.5 w-3.5 ${charity.isFeatured ? "fill-current" : ""}`} />
                      </button>
                      <button
                        onClick={() => openEditModal(charity)}
                        className="focus-ring flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                        title="Edit partner"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(charity.id)}
                        className="focus-ring flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete partner"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-2">{charity.description}</p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                  <span className="font-semibold text-forest text-[11px]">{charity.impactMetric}</span>
                  <span className="text-slate-500 text-[11px]">
                    {supporterCount} supporters · {charity.isFeatured ? "featured" : "standard"}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isAdding || editingCharity ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian-950/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSave}
            className="w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {isAdding ? "Add Non-Profit Partner" : `Edit ${editingCharity?.name}`}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingCharity(null);
                }}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Charity Name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Fairway Futures"
                  className="focus-ring mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Category</label>
                  <input
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Youth sport, Environment, etc."
                    className="focus-ring mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Impact Metric</label>
                  <input
                    required
                    value={impactMetric}
                    onChange={(e) => setImpactMetric(e.target.value)}
                    placeholder="e.g. 150 juniors coached"
                    className="focus-ring mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Description</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mission statement and how donor allocations are utilized..."
                  className="focus-ring mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Image URL</label>
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="focus-ring mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 rounded accent-forest"
                />
                <label htmlFor="featuredCheck" className="text-xs font-medium text-slate-700">
                  Feature this partner in the Homepage spotlight
                </label>
              </div>

              {error ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800">
                  {error}
                </div>
              ) : null}

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingCharity(null);
                  }}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-forest px-4 py-1.5 text-xs font-semibold text-white hover:bg-forest-800 disabled:opacity-50 transition-colors shadow-soft"
                >
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  Save Partner
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
