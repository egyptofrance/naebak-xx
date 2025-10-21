import { getUserRoleAndDashboard } from "@/lib/role-routing";
import { redirect } from "next/navigation";

/**
 * Dashboard redirect page
 * Automatically redirects users to their role-specific dashboard
 */
export default async function DashboardRedirect() {
  const { dashboardUrl } = await getUserRoleAndDashboard();
  redirect(dashboardUrl);
}

