// Manager Sidebar (Server Component)

import { SwitcherAndToggle } from "@/components/sidebar-components/switcher-and-toggle";
import { SidebarFooterUserNav } from "@/components/sidebar-footer-user-nav";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Link } from "@/components/intl-link";
import {
  getCachedSlimWorkspaces,
} from "@/rsc-data/user/workspaces";
import { unstable_rethrow } from "next/navigation";
import { Home, FileCheck, BarChart3, Settings, Users } from "lucide-react";

const managerNavItems = [
  {
    label: "الرئيسية",
    href: "/app_manager",
    icon: <Home className="h-5 w-5" />,
  },
  {
    label: "إدارة المحتوى",
    href: "/app_manager/content",
    icon: <FileCheck className="h-5 w-5" />,
  },
  {
    label: "الموافقات",
    href: "/app_manager/approvals",
    icon: <FileCheck className="h-5 w-5" />,
  },
  {
    label: "التقارير",
    href: "/app_manager/reports",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    label: "المستخدمون",
    href: "/app_manager/users",
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: "الإعدادات",
    href: "/app_manager/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

export async function ManagerSidebar() {
  try {
    const slimWorkspaces = await getCachedSlimWorkspaces();
    return (
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <SwitcherAndToggle slimWorkspaces={slimWorkspaces} />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>لوحة تحكم المدير</SidebarGroupLabel>
            <SidebarMenu>
              {managerNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href}>
                      {item.icon}
                      {item.label}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
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

