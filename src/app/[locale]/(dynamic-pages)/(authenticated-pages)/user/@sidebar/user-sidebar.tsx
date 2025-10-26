// OrganizationSidebar.tsx (Server Component)

import { SidebarAdminPanelNav } from "@/components/sidebar-admin-panel-nav";
import { SidebarUserNav } from "@/components/sidebar-user-nav";
import { SidebarFooterUserNav } from "@/components/sidebar-footer-user-nav";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { unstable_rethrow } from "next/navigation";

export async function UserSidebar() {
  try {
    return (
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          {/* Workspace switcher removed */}
        </SidebarHeader>
        <SidebarContent>
          <SidebarUserNav />
          <SidebarAdminPanelNav />
        </SidebarContent>
        <SidebarFooter>
          <SidebarFooterUserNav />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    );
  } catch (e) {
    unstable_rethrow(e);
    console.error(e);
  }
}
