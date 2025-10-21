import { getManagerPermissions } from "@/rsc-data/user/manager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck, BarChart3, Users, Settings, AlertCircle, CheckCircle } from "lucide-react";
import { Link } from "@/components/intl-link";

export default async function ManagerDashboard() {
  const managerPermissions = await getManagerPermissions();

  const dashboardCards = [
    {
      title: "إدارة المحتوى",
      description: "مراجعة وإدارة المحتوى المنشور",
      icon: <FileCheck className="h-8 w-8 text-blue-500" />,
      href: "/app_manager/content",
      color: "bg-blue-50",
    },
    {
      title: "الموافقات",
      description: "الموافقة على الطلبات والمحتوى",
      icon: <CheckCircle className="h-8 w-8 text-green-500" />,
      href: "/app_manager/approvals",
      color: "bg-green-50",
    },
    {
      title: "التقارير",
      description: "عرض التقارير والإحصائيات",
      icon: <BarChart3 className="h-8 w-8 text-purple-500" />,
      href: "/app_manager/reports",
      color: "bg-purple-50",
    },
    {
      title: "المستخدمون",
      description: "إدارة المستخدمين والصلاحيات",
      icon: <Users className="h-8 w-8 text-yellow-500" />,
      href: "/app_manager/users",
      color: "bg-yellow-50",
    },
    {
      title: "الإعدادات",
      description: "إعدادات النظام والتخصيص",
      icon: <Settings className="h-8 w-8 text-gray-500" />,
      href: "/app_manager/settings",
      color: "bg-gray-50",
    },
  ];

  const stats = [
    {
      title: "طلبات معلقة",
      value: "0",
      icon: <AlertCircle className="h-6 w-6 text-orange-500" />,
      color: "bg-orange-50",
    },
    {
      title: "تمت الموافقة",
      value: "0",
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      color: "bg-green-50",
    },
    {
      title: "المستخدمون النشطون",
      value: "0",
      icon: <Users className="h-6 w-6 text-blue-500" />,
      color: "bg-blue-50",
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">مرحباً، المدير</h1>
          <p className="text-muted-foreground mt-2">
            لوحة التحكم الخاصة بك لإدارة المحتوى والمستخدمين
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dashboardCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className={`w-16 h-16 rounded-lg ${card.color} flex items-center justify-center mb-4`}>
                  {card.icon}
                </div>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>الصلاحيات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">إدارة المحتوى</p>
              <p className="text-lg font-semibold">
                {managerPermissions?.can_manage_content ? "✅ مفعل" : "❌ غير مفعل"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">إدارة المستخدمين</p>
              <p className="text-lg font-semibold">
                {managerPermissions?.can_manage_users ? "✅ مفعل" : "❌ غير مفعل"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">عرض التقارير</p>
              <p className="text-lg font-semibold">
                {managerPermissions?.can_view_reports ? "✅ مفعل" : "❌ غير مفعل"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">الموافقة على المحتوى</p>
              <p className="text-lg font-semibold">
                {managerPermissions?.can_approve_content ? "✅ مفعل" : "❌ غير مفعل"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

