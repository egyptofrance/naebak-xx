import { Link } from "@/components/intl-link";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Edit } from "lucide-react";
import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";

export default async function DeputiesPage() {
  const supabase = await createSupabaseUserServerComponentClient();

  // Fetch all deputies
  const { data: deputies } = await supabase
    .from("deputy_profiles")
    .select(
      `
      id,
      user_id,
      deputy_status,
      electoral_symbol,
      electoral_number,
      created_at,
      user_profiles (
        full_name,
        email,
        phone,
        governorate_id,
        party_id,
        governorates (
          name_ar,
          name_en
        ),
        parties (
          name_ar,
          name_en
        )
      )
    `
    )
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Typography.H1 className="text-3xl font-bold tracking-tight">
            إدارة النواب
          </Typography.H1>
          <Typography.P className="text-muted-foreground">
            إدارة ملفات النواب والمعلومات الانتخابية
          </Typography.P>
        </div>
        <Link href="/app_admin/deputies/add">
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            إضافة نائب جديد
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة النواب</CardTitle>
          <CardDescription>
            {deputies && deputies.length > 0
              ? `إجمالي ${deputies.length} نائب مسجل`
              : "لا يوجد نواب مسجلين حالياً"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deputies && deputies.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>الهاتف</TableHead>
                  <TableHead>المحافظة</TableHead>
                  <TableHead>الحزب</TableHead>
                  <TableHead>الرقم الانتخابي</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deputies.map((deputy) => {
                  const userProfile = Array.isArray(deputy.user_profiles)
                    ? deputy.user_profiles[0]
                    : deputy.user_profiles;

                  return (
                    <TableRow key={deputy.id}>
                      <TableCell className="font-medium">
                        {userProfile?.full_name || "غير محدد"}
                      </TableCell>
                      <TableCell>{userProfile?.email || "غير محدد"}</TableCell>
                      <TableCell>{userProfile?.phone || "غير محدد"}</TableCell>
                      <TableCell>
                        {userProfile?.governorates?.name_ar || "غير محدد"}
                      </TableCell>
                      <TableCell>
                        {userProfile?.parties?.name_ar || "غير محدد"}
                      </TableCell>
                      <TableCell>
                        {deputy.electoral_number || "غير محدد"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            deputy.deputy_status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {deputy.deputy_status === "active" ? "نشط" : "غير نشط"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link href={`/app_admin/deputies/${deputy.id}`}>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            تعديل
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">لا يوجد نواب مسجلين حالياً</p>
              <Link href="/app_admin/deputies/add">
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  إضافة نائب جديد
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

