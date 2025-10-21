import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getDeputyProfile } from "@/rsc-data/user/deputy";
import { redirect } from "next/navigation";

export default async function DeputyLayout({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  // Check if user is a deputy
  const deputyProfile = await getDeputyProfile();
  
  if (!deputyProfile) {
    // Not a deputy, redirect to home
    redirect("/home");
  }

  return (
    <SidebarProvider>
      {sidebar}
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}

