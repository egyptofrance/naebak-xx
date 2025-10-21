import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCachedDeputyProfile } from "@/rsc-data/user/deputy";
import { redirect } from "next/navigation";
import { ElectoralProgramManager } from "./ElectoralProgramManager";

export default async function ElectoralProgramPage() {
  const deputyProfile = await getCachedDeputyProfile();

  // Redirect if not a deputy
  if (!deputyProfile) {
    redirect("/user/settings");
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">البرنامج الانتخابي</h1>
        <p className="text-muted-foreground mt-2">
          قم بإدارة بنود برنامجك الانتخابي وإضافة العناصر الجديدة
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إدارة البرنامج الانتخابي</CardTitle>
          <CardDescription>
            أضف وعدل وحذف بنود برنامجك الانتخابي مع إمكانية رفع الصور
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ElectoralProgramManager deputyId={deputyProfile.id} />
        </CardContent>
      </Card>
    </div>
  );
}

