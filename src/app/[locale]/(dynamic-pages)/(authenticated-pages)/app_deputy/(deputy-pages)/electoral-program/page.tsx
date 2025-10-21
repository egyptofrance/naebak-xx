import { getDeputyProfile } from "@/rsc-data/user/deputy";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Plus } from "lucide-react";

export default async function ElectoralProgramPage() {
  const deputyProfile = await getDeputyProfile();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">البرنامج الانتخابي</h1>
          <p className="text-muted-foreground mt-2">
            عرض وتحديث برنامجك الانتخابي ووعودك للناخبين
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            تعديل
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            إضافة بند جديد
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>البرنامج الانتخابي</CardTitle>
          <CardDescription>
            يمكنك إضافة وتحديث بنود برنامجك الانتخابي هنا
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deputyProfile?.electoral_program ? (
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{deputyProfile.electoral_program}</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                لم يتم إضافة برنامج انتخابي بعد
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                إضافة برنامج انتخابي
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

