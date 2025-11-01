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
  Briefcase,
  Building2,
  FileLineChart,
  Flag,
  HelpCircle,
  Image as ImageIcon,
  Map,
  MessageSquareWarning,
  Newspaper,
  PenTool,
  Tags,
  UserCheck,
  UserPen,
  Users,
  Settings,
  Copy,
} from "lucide-react";
import { Suspense } from "react";

const adminSections = [
  {
    title: "القائمة الرئيسية",
    links: [
      {
        label: "لوحة التحكم",
        href: `/app_admin`,
        icon: <FileLineChart className="h-5 w-5" />,
      },
      {
        label: "قائمة النواب",
        href: `/deputies`,
        icon: <UserCheck className="h-5 w-5" />,
      },
    ],
  },
  {
    title: "إدارة النظام",
    links: [
      {
        label: "بيانات النواب",
        href: `/app_admin/deputies`,
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
    ],
  },
  {
    title: "إدارة المحتوى",
    links: [
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
        label: "إدارة المحافظات",
        href: `/app_admin/governorates`,
        icon: <Map className="h-5 w-5" />,
      },
      {
        label: "إدارة البانر",
        href: `/app_admin/banner`,
        icon: <ImageIcon className="h-5 w-5" />,
      },
      {
        label: "صورة المشاركة",
        href: `/app_admin/og-image`,
        icon: <ImageIcon className="h-5 w-5" />,
      },
      {
        label: "الأخبار العاجلة",
        href: `/app_admin/breaking-news`,
        icon: <Newspaper className="h-5 w-5" />,
      },
      {
        label: "إدارة الشكاوى",
        href: `/manager-complaints`,
        icon: <MessageSquareWarning className="h-5 w-5" />,
      },
      {
        label: "إدارة التكرارات",
        href: `/app_admin/duplicates`,
        icon: <Copy className="h-5 w-5" />,
      },
      {
        label: "إدارة الوظائف",
        href: `/app_admin/jobs`,
        icon: <Briefcase className="h-5 w-5" />,
      },
    ],
  },
  {
    title: "التسويق والمحتوى",
    links: [
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
    ],
  },
  {
    title: "الإعدادات",
    links: [
      {
        label: "إعدادات عداد الزوار",
        href: `/app_admin/visitor-settings`,
        icon: <Settings className="h-5 w-5" />,
      },
    ],
  },
  {
    title: "التطوير",
    links: [
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
    ],
  },
];

async function AdminPanelSidebar() {
  const isAdmin = await getIsAppAdmin();
  if (!isAdmin) return null;

  return (
    <>
      {adminSections.map((section, index) => (
        <SidebarGroup key={index} className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel data-testid={`admin-section-${index}`}>
            {section.title}
          </SidebarGroupLabel>
          <SidebarMenu>
            {section.links.map((link) => (
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
      ))}
    </>
  );
}

export async function SidebarAdminPanelNav() {
  return (
    <Suspense fallback={null}>
      <AdminPanelSidebar />
    </Suspense>
  );
}
