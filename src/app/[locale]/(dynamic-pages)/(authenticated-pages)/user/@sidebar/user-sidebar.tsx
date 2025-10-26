// OrganizationSidebar.tsx (Server Component)

import { SidebarAdminPanelNav } from "@/components/sidebar-admin-panel-nav";
import { SidebarDeputyNav } from "@/components/sidebar-deputy-nav";
import { SidebarUserNav } from "@/components/sidebar-user-nav";
import { SidebarFooterUserNav } from "@/components/sidebar-footer-user-nav";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { getCachedSoloWorkspace } from "@/rsc-data/user/workspaces";
import { unstable_rethrow } from "next/navigation";

export async function UserSidebar() {
  try {
    // Get workspace for deputy nav
    const workspace = await getCachedSoloWorkspace();

    return (
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          {/* Workspace switcher removed */}
        </SidebarHeader>
        <SidebarContent>
          <SidebarUserNav />
          {workspace && <SidebarDeputyNav workspace={workspace} />}
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

