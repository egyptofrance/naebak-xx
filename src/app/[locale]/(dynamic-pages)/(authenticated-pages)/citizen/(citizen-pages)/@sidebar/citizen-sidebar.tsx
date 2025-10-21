// Citizen Sidebar (Server Component)

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
import { Home, User, Settings, Heart, MessageSquare } from "lucide-react";

const citizenNavItems = [
  {
    label: "الرئيسية",
    href: "/citizen",
    icon: <Home className="h-5 w-5" />,
  },
  {
    label: "الملف الشخصي",
    href: "/citizen/profile",
    icon: <User className="h-5 w-5" />,
  },
  {
    label: "النواب المفضلون",
    href: "/citizen/favorites",
    icon: <Heart className="h-5 w-5" />,
  },
  {
    label: "الرسائل",
    href: "/citizen/messages",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    label: "الإعدادات",
    href: "/citizen/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

export async function CitizenSidebar() {
  try {
    const slimWorkspaces = await getCachedSlimWorkspaces();
    return (
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <SwitcherAndToggle slimWorkspaces={slimWorkspaces} />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>لوحة تحكم المواطن</SidebarGroupLabel>
            <SidebarMenu>
              {citizenNavItems.map((item) => (
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

