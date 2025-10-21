import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCachedDeputyProfile } from "@/rsc-data/user/deputy";
import { redirect } from "next/navigation";
import { DeputyDataForm } from "./DeputyDataForm";

export default async function DeputyDataPage() {
  const deputyProfile = await getCachedDeputyProfile();

  // Redirect if not a deputy
  if (!deputyProfile) {
    redirect("/user/settings");
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">البيانات الإضافية</h1>
        <p className="text-muted-foreground mt-2">
          قم بإدارة بياناتك الانتخابية والمعلومات الإضافية الخاصة بك كنائب
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>البيانات الإضافية</CardTitle>
          <CardDescription>
            حالة النائب، المجلس، الرقم الانتخابي، الرمز الانتخابي
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeputyDataForm deputyProfile={deputyProfile} />
        </CardContent>
      </Card>
    </div>
  );
}

