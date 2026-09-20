import { AdminCharitiesManager } from "@/components/admin-charities-manager";
import { getCharities, getProfiles } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminCharitiesPage() {
  const [charities, profiles] = await Promise.all([
    getCharities(),
    getProfiles()
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <AdminCharitiesManager initialCharities={charities} profiles={profiles} />
    </div>
  );
}
