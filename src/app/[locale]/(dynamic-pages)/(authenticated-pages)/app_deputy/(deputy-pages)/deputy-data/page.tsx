import { getDeputyProfile } from "@/rsc-data/user/deputy";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

export default async function DeputyDataPage() {
  const deputyProfile = await getDeputyProfile();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">البيانات الإضافية</h1>
          <p className="text-muted-foreground mt-2">
            إدارة بياناتك الشخصية والمهنية
          </p>
        </div>
        <Button>
          <Edit className="h-4 w-4 mr-2" />
          تعديل
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>معلومات أساسية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">الحالة</p>
              <p className="text-lg">
                {deputyProfile?.deputy_status === "current" ? "نائب حالي" : "نائب سابق"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">السيرة الذاتية</p>
              <p className="text-lg">{deputyProfile?.bio || "لم يتم إضافة سيرة ذاتية"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">عنوان المكتب</p>
              <p className="text-lg">{deputyProfile?.office_address || "لم يتم إضافة عنوان"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>معلومات انتخابية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">الرمز الانتخابي</p>
              <p className="text-lg">{deputyProfile?.electoral_symbol || "لم يتم إضافة رمز"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">الرقم الانتخابي</p>
              <p className="text-lg">{deputyProfile?.electoral_number || "لم يتم إضافة رقم"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>معلومات الاتصال</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">هاتف المكتب</p>
              <p className="text-lg">{deputyProfile?.office_phone || "لم يتم إضافة هاتف"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ساعات العمل</p>
              <p className="text-lg">{deputyProfile?.office_hours || "لم يتم تحديد ساعات"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>وسائل التواصل الاجتماعي</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Facebook</p>
              <p className="text-lg">{deputyProfile?.social_media_facebook || "لم يتم إضافة"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Twitter</p>
              <p className="text-lg">{deputyProfile?.social_media_twitter || "لم يتم إضافة"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Instagram</p>
              <p className="text-lg">{deputyProfile?.social_media_instagram || "لم يتم إضافة"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

