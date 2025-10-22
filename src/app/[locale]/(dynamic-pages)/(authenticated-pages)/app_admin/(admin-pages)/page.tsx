import { Link } from "@/components/intl-link";
import { Typography } from "@/components/ui/Typography";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Book,
  HelpCircle,
  Map,
  PenTool,
  Tags,
  UserCheck,
  Users,
  UserPen,
} from "lucide-react";

const adminLinks = [
  {
    title: "إدارة النواب",
    description: "إدارة ملفات النواب والمعلومات الانتخابية",
    href: "/app_admin/deputies",
    icon: <UserCheck className="h-8 w-8" />,
  },
  {
    title: "إدارة المستخدمين",
    description: "إدارة حسابات المستخدمين والصلاحيات",
    href: "/app_admin/users",
    icon: <Users className="h-8 w-8" />,
  },
  {
    title: "الكُتّاب",
    description: "إدارة ملفات كُتّاب المحتوى الإعلامي",
    href: "/app_admin/marketing/authors",
    icon: <UserPen className="h-8 w-8" />,
  },
  {
    title: "التصنيفات",
    description: "إدارة تصنيفات المحتوى والمواضيع",
    href: "/app_admin/marketing/tags",
    icon: <Tags className="h-8 w-8" />,
  },
  {
    title: "أخبار ومقالات",
    description: "إدارة ونشر الأخبار والمقالات",
    href: "/app_admin/marketing/blog",
    icon: <PenTool className="h-8 w-8" />,
  },
  {
    title: "اقتراحات المستخدمين",
    description: "عرض وإدارة اقتراحات وملاحظات المستخدمين",
    href: "/feedback",
    icon: <HelpCircle className="h-8 w-8" />,
  },
  {
    title: "سجل التحديثات",
    description: "إدارة ونشر سجل التحديثات والتغييرات",
    href: "/app_admin/marketing/changelog",
    icon: <Book className="h-8 w-8" />,
  },
  {
    title: "خارطة الطريق",
    description: "التخطيط وإدارة خارطة تطوير المنصة",
    href: "/roadmap",
    icon: <Map className="h-8 w-8" />,
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6" dir="rtl">
      <div className="space-y-2">
        <Typography.H1 className="text-3xl font-bold tracking-tight">
          لوحة تحكم الأدمن
        </Typography.H1>
        <Typography.P className="text-muted-foreground">
          مرحباً بك في لوحة تحكم الأدمن. يمكنك إدارة جميع جوانب المنصة من هنا.
        </Typography.P>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminLinks.map((link) => (
          <Link href={link.href} key={link.href} className="block">
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  {link.title}
                </CardTitle>
                {link.icon}
              </CardHeader>
              <CardContent>
                <CardDescription>{link.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

