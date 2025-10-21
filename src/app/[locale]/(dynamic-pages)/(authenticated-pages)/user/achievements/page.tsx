import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCachedDeputyProfile } from "@/rsc-data/user/deputy";
import { redirect } from "next/navigation";
import { AchievementsManager } from "./AchievementsManager";

export default async function AchievementsPage() {
  const deputyProfile = await getCachedDeputyProfile();

  // Redirect if not a deputy
  if (!deputyProfile) {
    redirect("/user/settings");
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">الإنجازات</h1>
        <p className="text-muted-foreground mt-2">
          قم بإدارة إنجازاتك وإضافة الإنجازات الجديدة
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إدارة الإنجازات</CardTitle>
          <CardDescription>
            أضف وعدل وحذف إنجازاتك كنائب مع إمكانية رفع الصور
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AchievementsManager deputyId={deputyProfile.id} />
        </CardContent>
      </Card>
    </div>
  );
}

