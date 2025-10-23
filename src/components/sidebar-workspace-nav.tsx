import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SlimWorkspace } from "@/types";
import { getWorkspaceSubPath } from "@/utils/workspaces";
import {
  DollarSign,
  FileBox,
  Home,
  Layers,
  Settings,
  Users,
  MessageSquare,
} from "lucide-react";
import { ProFeatureGateDialog } from "./ProFeatureGateDialog";
import { Link } from "./intl-link";
import { serverGetUserType } from "@/utils/server/serverGetUserType";
import { userRoles } from "@/utils/userTypes";

export async function SidebarWorkspaceNav({
  workspace,
  withLinkLabelPrefix = false,
}: {
  workspace: SlimWorkspace;
  withLinkLabelPrefix?: boolean;
}) {
  const userType = await serverGetUserType();
  const isAdmin = userType === userRoles.ADMIN;

  let sidebarLinks = [
    { label: "Home", href: "/home", icon: <Home className="h-5 w-5" /> },
    {
      label: "Projects",
      href: "/projects",
      icon: <Layers className="h-5 w-5" />,
    },
    {
      label: "شكاواي الشخصية",
      href: "/complaints",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  // Hide personal complaints from admin
  if (isAdmin) {
    sidebarLinks = sidebarLinks.filter(link => link.href !== "/complaints");
  }

  if (workspace.membershipType === "team") {
    // pop the last item
    const lastItem = sidebarLinks.pop();
    sidebarLinks.push({
      label: "Members",
      href: "/settings/members",
      icon: <Users className="h-5 w-5" />,
    });
    if (lastItem) {
      sidebarLinks.push(lastItem);
    }
  }

  if (withLinkLabelPrefix) {
    sidebarLinks = sidebarLinks.map((link) => ({
      ...link,
      label: `Workspace ${link.label}`,
    }));
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workspace</SidebarGroupLabel>
      <SidebarMenu>
        {sidebarLinks.map((link) => (
          <SidebarMenuItem key={link.label}>
            <SidebarMenuButton asChild>
              <Link href={getWorkspaceSubPath(workspace, link.href)}>
                {link.icon}
                <span>{link.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
