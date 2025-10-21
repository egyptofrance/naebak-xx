import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCachedDeputyProfile } from "@/rsc-data/user/deputy";
import { redirect } from "next/navigation";
import { EventsManager } from "./EventsManager";

export default async function EventsPage() {
  const deputyProfile = await getCachedDeputyProfile();

  // Redirect if not a deputy
  if (!deputyProfile) {
    redirect("/user/settings");
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">المناسبات</h1>
        <p className="text-muted-foreground mt-2">
          قم بإدارة المناسبات والفعاليات الخاصة بك
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إدارة المناسبات</CardTitle>
          <CardDescription>
            أضف وعدل وحذف المناسبات والفعاليات مع إمكانية رفع الصور
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EventsManager deputyId={deputyProfile.id} />
        </CardContent>
      </Card>
    </div>
  );
}

