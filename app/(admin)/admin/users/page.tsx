import { AdminUsersManager } from "@/components/admin-users-manager";
import { getProfiles, getSubscriptions } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const [profiles, subscriptions] = await Promise.all([
    getProfiles(),
    getSubscriptions()
  ]);

  const enrichedUsers = profiles.map((profile) => ({
    ...profile,
    subscription: subscriptions.find((s) => s.userId === profile.id)
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl font-semibold text-ink">User Management</h1>
          <p className="mt-2 text-ink/65">
            Manage subscriber and admin roles, toggle subscription statuses (active / lapsed / cancelled), and adjust charity allocations.
          </p>
        </div>
        <span className="rounded-md bg-skyglass px-3 py-1 text-xs font-semibold text-ink">
          {profiles.length} registered users
        </span>
      </div>

      <div className="mt-8">
        <AdminUsersManager initialUsers={enrichedUsers} />
      </div>
    </div>
  );
}
