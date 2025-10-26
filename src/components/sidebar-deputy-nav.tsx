import { Link } from "@/components/intl-link";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getCachedDeputyProfile } from "@/rsc-data/user/deputy";
import { SlimWorkspace } from "@/types";
import { getWorkspaceSubPath } from "@/utils/workspaces";
import { Award, Calendar, FileText, ImageIcon, Info, MessageSquare, UserCheck } from "lucide-react";

const deputyLinks = [
  {
    label: "الشكاوى المسندة",
    href: "/deputy-complaints",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    label: "البيانات الإضافية",
    href: "/deputy-data",
    icon: <Info className="h-5 w-5" />,
  },
  {
    label: "البرنامج الانتخابي",
    href: "/electoral-program",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: "الإنجازات",
    href: "/achievements",
    icon: <Award className="h-5 w-5" />,
  },
  {
    label: "المناسبات",
    href: "/events",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    label: "قائمة النواب",
    href: "/deputies",
    icon: <UserCheck className="h-5 w-5" />,
  },
  {
    label: "إدارة البانر",
    href: "/deputy-banner",
    icon: <ImageIcon className="h-5 w-5" />,
  },
];

export async function SidebarDeputyNav({ workspace }: { workspace: SlimWorkspace }) {
  const deputyProfile = await getCachedDeputyProfile();

  // Only show for deputies
  if (!deputyProfile) {
    return null;
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>إدارة النائب</SidebarGroupLabel>
      <SidebarMenu>
        {deputyLinks.map((link) => (
          <SidebarMenuItem key={link.href}>
            <SidebarMenuButton asChild>
              <Link href={link.href === "/deputies" ? link.href : getWorkspaceSubPath(workspace, link.href)}>
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

