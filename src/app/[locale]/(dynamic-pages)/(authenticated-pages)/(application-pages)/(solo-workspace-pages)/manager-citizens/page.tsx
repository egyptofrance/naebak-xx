import { getManagerProfile } from "@/rsc-data/user/manager";
import { redirect } from "next/navigation";
import { ManagerCitizensTable } from "./ManagerCitizensTable";

export default async function ManagerCitizensPage() {
  const managerProfile = await getManagerProfile();

  if (!managerProfile) {
    redirect("/home");
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">إدارة المواطنين</h1>
        <p className="text-muted-foreground mt-2">
          عرض وتعديل بيانات المواطنين المسجلين في المنصة
        </p>
      </div>

      <ManagerCitizensTable />
    </div>
  );
}

