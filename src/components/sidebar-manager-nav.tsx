import { Link } from "@/components/intl-link";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getCachedManagerProfile } from "@/rsc-data/user/manager";
import { SlimWorkspace } from "@/types";
import { getWorkspaceSubPath } from "@/utils/workspaces";
import { BarChart3, Users, UserCheck, MessageSquare } from "lucide-react";

const managerLinks = [
  {
    label: "إدارة الشكاوى",
    href: "/manager-complaints",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    label: "إدارة المواطنين",
    href: "/manager-citizens",
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: "إدارة النواب",
    href: "/manager-deputies",
    icon: <UserCheck className="h-5 w-5" />,
  },
  {
    label: "التقارير والإحصائيات",
    href: "/manager-reports",
    icon: <BarChart3 className="h-5 w-5" />,
  },
];

export async function SidebarManagerNav({ workspace }: { workspace: SlimWorkspace }) {
  const managerProfile = await getCachedManagerProfile();

  console.log("[SidebarManagerNav] Manager profile:", managerProfile);

  // Only show for managers
  if (!managerProfile) {
    console.log("[SidebarManagerNav] No manager profile found, returning null");
    return null;
  }

  console.log("[SidebarManagerNav] Rendering manager navigation");

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>إدارة المدير</SidebarGroupLabel>
      <SidebarMenu>
        {managerLinks.map((link) => (
          <SidebarMenuItem key={link.href}>
            <SidebarMenuButton asChild>
              <Link href={getWorkspaceSubPath(workspace, link.href)}>
                {link.icon}
                {link.label}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

