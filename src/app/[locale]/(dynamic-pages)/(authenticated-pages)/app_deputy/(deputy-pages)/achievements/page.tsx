import { getDeputyProfile } from "@/rsc-data/user/deputy";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function AchievementsPage() {
  const deputyProfile = await getDeputyProfile();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">الإنجازات</h1>
          <p className="text-muted-foreground mt-2">
            توثيق إنجازاتك ومشاريعك المنجزة
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          إضافة إنجاز جديد
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الإنجازات</CardTitle>
          <CardDescription>
            جميع الإنجازات والمشاريع التي تم إنجازها
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deputyProfile?.achievements ? (
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{deputyProfile.achievements}</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                لم يتم إضافة إنجازات بعد
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                إضافة إنجاز
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

