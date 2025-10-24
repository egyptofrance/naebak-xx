import { Link } from "@/components/intl-link";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getIsAppAdmin } from "@/data/user/user";
import {
  Book,
  Building2,
  FileLineChart,
  Flag,
  HelpCircle,
  Map,
  MessageSquareWarning,
  PenTool,
  Tags,
  UserCheck,
  UserPen,
  Users,
} from "lucide-react";
import { Suspense } from "react";

const adminLinks = [
  {
    label: "لوحة التحكم",
    href: `/app_admin`,
    icon: <FileLineChart className="h-5 w-5" />,
  },
  {
    label: "بيانات النواب",
    href: `/app_admin/deputies`,
    icon: <UserCheck className="h-5 w-5" />,
  },
  {
    label: "قائمة النواب (عامة)",
    href: `/deputies`,
    icon: <UserCheck className="h-5 w-5" />,
  },
  {
    label: "بيانات المواطنين",
    href: `/app_admin/users`,
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: "بيانات المديرين",
    href: `/app_admin/managers`,
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: "إدارة الشكاوى",
    href: `/manager-complaints`,
    icon: <MessageSquareWarning className="h-5 w-5" />,
  },
  {
    label: "إدارة الأحزاب",
    href: `/app_admin/parties`,
    icon: <Flag className="h-5 w-5" />,
  },
  {
    label: "إدارة المجالس",
    href: `/app_admin/councils`,
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    label: "الكُتّاب",
    href: `/app_admin/marketing/authors`,
    icon: <UserPen className="h-5 w-5" />,
  },
  {
    label: "التصنيفات",
    href: `/app_admin/marketing/tags`,
    icon: <Tags className="h-5 w-5" />,
  },
  {
    label: "أخبار ومقالات",
    href: `/app_admin/marketing/blog`,
    icon: <PenTool className="h-5 w-5" />,
  },
  {
    label: "اقتراحات المستخدمين",
    href: `/feedback`,
    icon: <HelpCircle className="h-5 w-5" />,
  },
  {
    label: "سجل التحديثات",
    href: `/app_admin/marketing/changelog`,
    icon: <Book className="h-5 w-5" />,
  },
  {
    label: "خارطة الطريق",
    href: "/roadmap",
    icon: <Map className="h-5 w-5" />,
  },
];

async function AdminPanelSidebar() {
  const isAdmin = await getIsAppAdmin();
  if (!isAdmin) return null;
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel data-testid="admin-panel-label">
        لوحة الأدمن
      </SidebarGroupLabel>
      <SidebarMenu>
        {adminLinks.map((link) => (
          <SidebarMenuItem key={link.href}>
            <SidebarMenuButton asChild tooltip={link.label}>
              <Link href={link.href}>
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

export async function SidebarAdminPanelNav() {
  return (
    <Suspense fallback={null}>
      <AdminPanelSidebar />
    </Suspense>
  );
}

