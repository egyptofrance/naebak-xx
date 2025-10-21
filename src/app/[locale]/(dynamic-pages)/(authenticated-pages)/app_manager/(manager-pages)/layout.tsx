import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getManagerPermissions } from "@/rsc-data/user/manager";
import { redirect } from "next/navigation";

export default async function ManagerLayout({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  // Check if user is a manager
  const managerPermissions = await getManagerPermissions();
  
  if (!managerPermissions) {
    // Not a manager, redirect to home
    redirect("/home");
  }

  return (
    <SidebarProvider>
      {sidebar}
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}

