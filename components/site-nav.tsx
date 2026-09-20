import { getCurrentUser } from "@/lib/auth";
import { SiteNavClient } from "./site-nav-client";

export async function SiteNav() {
  const user = await getCurrentUser();
  return <SiteNavClient user={user} />;
}
