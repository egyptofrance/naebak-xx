import { getDeputyProfile } from "@/rsc-data/user/deputy";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function EventsPage() {
  const deputyProfile = await getDeputyProfile();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">المناسبات</h1>
          <p className="text-muted-foreground mt-2">
            إدارة الفعاليات والمناسبات القادمة والسابقة
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          إضافة مناسبة جديدة
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>المناسبات القادمة</CardTitle>
            <CardDescription>
              الفعاليات والمناسبات المجدولة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                لا توجد مناسبات قادمة
              </p>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                إضافة مناسبة
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>المناسبات السابقة</CardTitle>
            <CardDescription>
              الفعاليات والمناسبات المنتهية
            </CardDescription>
          </CardHeader>
          <CardContent>
            {deputyProfile?.events ? (
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{deputyProfile.events}</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  لا توجد مناسبات سابقة
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

