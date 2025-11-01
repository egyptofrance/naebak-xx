import { getManagerProfile } from "@/rsc-data/user/manager";
import { redirect } from "next/navigation";
import { getManagerStats } from "@/data/manager/stats";
import { PageHeading } from "@/components/PageHeading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserCog, MapPin, UserPlus, Award } from "lucide-react";

export const metadata = {
  title: "التقارير والإحصائيات | لوحة المدير | نائبك",
};

export default async function ManagerReportsPage() {
  const managerProfile = await getManagerProfile();

  if (!managerProfile) {
    redirect("/home");
  }

  const stats = await getManagerStats();

  const statsCards = [
    {
      title: "إجمالي المواطنين",
      value: stats.citizensCount,
      icon: Users,
      description: "عدد المواطنين المسجلين",
      color: "text-brand-green",
      bgColor: "bg-brand-green-light/20",
    },
    {
      title: "إجمالي النواب",
      value: stats.deputiesCount,
      icon: UserCheck,
      description: "عدد النواب المسجلين",
      color: "text-brand-green-dark",
      bgColor: "bg-brand-green/20",
    },
    {
      title: "النواب الحاليون",
      value: stats.currentDeputiesCount,
      icon: Award,
      description: "النواب في المجالس الحالية",
      color: "text-brand-green",
      bgColor: "bg-brand-green-light/20",
    },
    {
      title: "المرشحون",
      value: stats.candidatesCount,
      icon: UserPlus,
      description: "المرشحون للانتخابات",
      color: "text-brand-green-dark",
      bgColor: "bg-brand-green/20",
    },
    {
      title: "المديرون",
      value: stats.managersCount,
      icon: UserCog,
      description: "عدد المديرين في النظام",
      color: "text-brand-green",
      bgColor: "bg-brand-green-light/20",
    },
    {
      title: "المحافظات",
      value: stats.governoratesCount,
      icon: MapPin,
      description: "عدد المحافظات المسجلة",
      color: "text-brand-green-dark",
      bgColor: "bg-brand-green/20",
    },
  ];

  return (
    <div className="space-y-6 max-w-[1296px]">
      <PageHeading
        title="التقارير والإحصائيات"
        subTitle="نظرة عامة على إحصائيات المنصة"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

