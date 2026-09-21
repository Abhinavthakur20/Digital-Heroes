import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, HeartHandshake, Search } from "lucide-react";
import { getCharities } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function CharitiesPage({
  searchParams
}: {
  searchParams?: Promise<{ q?: string; category?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const query = resolvedParams.q?.toLowerCase() ?? "";
  const category = resolvedParams.category ?? "all";

  const charities = await getCharities();
  const categories = ["all", ...Array.from(new Set(charities.map((charity) => charity.category)))];

  const filtered = charities.filter((charity) => {
    const matchesQuery = `${charity.name} ${charity.description}`.toLowerCase().includes(query);
    const matchesCategory = category === "all" || charity.category === category;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-16 sm:pt-32 sm:px-6 lg:px-8 space-y-10">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end border-b border-slate-200/80 pb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-forest">
            <HeartHandshake className="h-4 w-4" />
            <span>Vetted Giving Directory</span>
          </div>
          <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Charity Partners
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Explore grassroots and international programs supported by Digital Heroes members. Every subscriber commits 10% to 60% of their subscription directly to their chosen cause.
          </p>
        </div>

        <form className="flex w-full flex-wrap gap-2 md:w-auto" method="GET">
          <div className="relative flex-1 md:w-64">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              className="focus-ring h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400"
              name="q"
              defaultValue={resolvedParams.q}
              placeholder="Search partner or cause..."
            />
          </div>
          <select
            className="focus-ring h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700"
            name="category"
            defaultValue={category}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "all" ? "All Categories" : item}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="focus-ring h-9 rounded-lg bg-forest px-4 text-xs font-semibold text-white hover:bg-forest-800 transition-colors shadow-soft"
          >
            Filter
          </button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-500 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
            No giving partners match your query. Try clearing filters.
          </div>
        ) : (
          filtered.map((charity) => (
            <Link
              key={charity.id}
              href={`/charities/${charity.id}`}
              className="group flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-card"
            >
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <Image
                  src={charity.imageUrl}
                  alt={charity.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-slate-800 shadow-sm backdrop-blur-md">
                    {charity.category}
                  </span>
                </div>
                {charity.isFeatured && (
                  <div className="absolute top-3 right-3">
                    <span className="rounded-full bg-gold-light border border-gold-border px-2 py-0.5 text-[10px] font-bold text-gold-dark shadow-sm">
                      Spotlight
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 group-hover:text-forest transition-colors">
                    {charity.name}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-600">
                    {charity.description}
                  </p>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                  <span className="font-semibold text-forest text-[11px] flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-forest" />
                    {charity.impactMetric}
                  </span>
                  <span className="font-bold text-slate-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-[11px]">
                    Profile <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
