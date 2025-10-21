import { getDeputyProfile } from "@/rsc-data/user/deputy";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Calendar, FileText, Info, Users, TrendingUp } from "lucide-react";
import { Link } from "@/components/intl-link";

export default async function DeputyDashboard() {
  const deputyProfile = await getDeputyProfile();

  const dashboardCards = [
    {
      title: "البيانات الإضافية",
      description: "إدارة بياناتك الشخصية والمهنية",
      icon: <Info className="h-8 w-8 text-blue-500" />,
      href: "/app_deputy/deputy-data",
      color: "bg-blue-50",
    },
    {
      title: "البرنامج الانتخابي",
      description: "عرض وتحديث برنامجك الانتخابي",
      icon: <FileText className="h-8 w-8 text-green-500" />,
      href: "/app_deputy/electoral-program",
      color: "bg-green-50",
    },
    {
      title: "الإنجازات",
      description: "توثيق إنجازاتك ومشاريعك",
      icon: <Award className="h-8 w-8 text-yellow-500" />,
      href: "/app_deputy/achievements",
      color: "bg-yellow-50",
    },
    {
      title: "المناسبات",
      description: "إدارة الفعاليات والمناسبات",
      icon: <Calendar className="h-8 w-8 text-purple-500" />,
      href: "/app_deputy/events",
      color: "bg-purple-50",
    },
    {
      title: "الإحصائيات",
      description: "عرض إحصائيات صفحتك والتفاعل",
      icon: <TrendingUp className="h-8 w-8 text-red-500" />,
      href: "/app_deputy/statistics",
      color: "bg-red-50",
    },
    {
      title: "المواطنون",
      description: "التواصل مع المواطنين والرسائل",
      icon: <Users className="h-8 w-8 text-indigo-500" />,
      href: "/app_deputy/citizens",
      color: "bg-indigo-50",
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">مرحباً، {deputyProfile?.bio || "النائب"}</h1>
          <p className="text-muted-foreground mt-2">
            لوحة التحكم الخاصة بك لإدارة صفحتك وبياناتك
          </p>
        </div>
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
          <CardTitle>معلومات سريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">الحالة</p>
              <p className="text-lg font-semibold">
                {deputyProfile?.deputy_status === "current" ? "نائب حالي" : "نائب سابق"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">تاريخ الإنشاء</p>
              <p className="text-lg font-semibold">
                {deputyProfile?.created_at ? new Date(deputyProfile.created_at).toLocaleDateString('ar-EG') : "غير متوفر"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

