import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function CitizenLayout({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      {sidebar}
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}

