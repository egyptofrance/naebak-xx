import { getUserRoleAndDashboard } from "@/lib/role-routing";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Dashboard",
    description: "Your personal dashboard",
  };
}

/**
 * Home page - redirects to role-based dashboard
 */
export default async function HomePage() {
  const { dashboardUrl } = await getUserRoleAndDashboard();
  redirect(dashboardUrl);
}

