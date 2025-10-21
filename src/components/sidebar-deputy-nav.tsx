import { Link } from "@/components/intl-link";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getCachedDeputyProfile } from "@/rsc-data/user/deputy";
import { Award, Calendar, FileText, Info } from "lucide-react";

const deputyLinks = [
  {
    label: "البيانات الإضافية",
    href: "/home/deputy-data",
    icon: <Info className="h-5 w-5" />,
  },
  {
    label: "البرنامج الانتخابي",
    href: "/home/electoral-program",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: "الإنجازات",
    href: "/home/achievements",
    icon: <Award className="h-5 w-5" />,
  },
  {
    label: "المناسبات",
    href: "/home/events",
    icon: <Calendar className="h-5 w-5" />,
  },
];

export async function SidebarDeputyNav() {
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
              <Link href={link.href}>
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

