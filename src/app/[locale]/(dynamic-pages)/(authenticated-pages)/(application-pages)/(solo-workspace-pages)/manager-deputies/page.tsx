import { getManagerProfile } from "@/rsc-data/user/manager";
import { redirect } from "next/navigation";
import { ManagerDeputiesTable } from "./ManagerDeputiesTable";

export default async function ManagerDeputiesPage() {
  const managerProfile = await getManagerProfile();

  if (!managerProfile) {
    redirect("/home");
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">إدارة النواب</h1>
        <p className="text-muted-foreground mt-2">
          عرض وتعديل بيانات النواب المسجلين في المنصة
        </p>
      </div>

      <ManagerDeputiesTable />
    </div>
  );
}

