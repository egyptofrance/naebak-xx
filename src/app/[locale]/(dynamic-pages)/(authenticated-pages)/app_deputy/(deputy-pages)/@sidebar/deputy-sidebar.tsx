// Deputy Sidebar (Server Component)

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
import { Award, Calendar, FileText, Home, Info, BarChart3 } from "lucide-react";

const deputyNavItems = [
  {
    label: "الرئيسية",
    href: "/app_deputy",
    icon: <Home className="h-5 w-5" />,
  },
  {
    label: "البيانات الإضافية",
    href: "/app_deputy/deputy-data",
    icon: <Info className="h-5 w-5" />,
  },
  {
    label: "البرنامج الانتخابي",
    href: "/app_deputy/electoral-program",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: "الإنجازات",
    href: "/app_deputy/achievements",
    icon: <Award className="h-5 w-5" />,
  },
  {
    label: "المناسبات",
    href: "/app_deputy/events",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    label: "الإحصائيات",
    href: "/app_deputy/statistics",
    icon: <BarChart3 className="h-5 w-5" />,
  },
];

export async function DeputySidebar() {
  try {
    const slimWorkspaces = await getCachedSlimWorkspaces();
    return (
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <SwitcherAndToggle slimWorkspaces={slimWorkspaces} />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>لوحة تحكم النائب</SidebarGroupLabel>
            <SidebarMenu>
              {deputyNavItems.map((item) => (
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

