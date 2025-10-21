import { getManagerProfile } from "@/rsc-data/user/manager";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ManagerReportsPage() {
  const managerProfile = await getManagerProfile();

  if (!managerProfile) {
    redirect("/home");
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">التقارير والإحصائيات</h1>
        <p className="text-muted-foreground mt-2">
          عرض الإحصائيات والتقارير الخاصة بالمنصة
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>إجمالي المواطنين</CardTitle>
            <CardDescription>عدد المواطنين المسجلين</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">-</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>إجمالي النواب</CardTitle>
            <CardDescription>عدد النواب المسجلين</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">-</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>إجمالي الأحزاب</CardTitle>
            <CardDescription>عدد الأحزاب المسجلة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">-</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

