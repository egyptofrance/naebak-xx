import { getManagerProfile } from "@/rsc-data/user/manager";
import { redirect } from "next/navigation";
import DeputiesListForManager from "./DeputiesListForManager";

export const metadata = {
  title: "إدارة النواب | لوحة المدير | نائبك",
};

// ✅ Enable caching for 60 seconds to improve performance
export const revalidate = 60;

export default async function ManagerDeputiesPage() {
  const managerProfile = await getManagerProfile();

  if (!managerProfile) {
    redirect("/home");
  }

  return <DeputiesListForManager />;
}

