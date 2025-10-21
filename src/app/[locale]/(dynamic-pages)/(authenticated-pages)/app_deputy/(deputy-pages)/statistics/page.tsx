import { getDeputyProfile } from "@/rsc-data/user/deputy";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Heart, MessageSquare, Users } from "lucide-react";

export default async function StatisticsPage() {
  const deputyProfile = await getDeputyProfile();

  const stats = [
    {
      title: "مشاهدات الصفحة",
      value: "0",
      icon: <Eye className="h-6 w-6 text-blue-500" />,
      change: "+0%",
      color: "bg-blue-50",
    },
    {
      title: "المتابعون",
      value: "0",
      icon: <Users className="h-6 w-6 text-green-500" />,
      change: "+0%",
      color: "bg-green-50",
    },
    {
      title: "التفاعلات",
      value: "0",
      icon: <Heart className="h-6 w-6 text-red-500" />,
      change: "+0%",
      color: "bg-red-50",
    },
    {
      title: "الرسائل",
      value: "0",
      icon: <MessageSquare className="h-6 w-6 text-purple-500" />,
      change: "+0%",
      color: "bg-purple-50",
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <h1 className="text-3xl font-bold">الإحصائيات</h1>
        <p className="text-muted-foreground mt-2">
          عرض إحصائيات صفحتك والتفاعل مع المواطنين
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              <p className="text-xs text-muted-foreground">
                {stat.change} عن الشهر الماضي
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>التقييم</CardTitle>
            <CardDescription>
              متوسط تقييم المواطنين
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-4xl font-bold mb-2">
                {deputyProfile?.initial_rating_avg || 0}
              </div>
              <p className="text-sm text-muted-foreground">
                من {deputyProfile?.initial_rating_count || 0} تقييم
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>النشاط الأخير</CardTitle>
            <CardDescription>
              آخر التحديثات والأنشطة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                لا توجد أنشطة حديثة
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

