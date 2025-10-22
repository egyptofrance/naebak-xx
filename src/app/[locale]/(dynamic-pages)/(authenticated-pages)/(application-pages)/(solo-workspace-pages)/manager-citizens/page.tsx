import { PageHeading } from "@/components/PageHeading";
import { Pagination } from "@/components/Pagination";
import { Search } from "@/components/Search";
import { Skeleton } from "@/components/ui/skeleton";
import { getUsersTotalPagesAction, getPaginatedUserListAction } from "@/data/admin/user";
import { Suspense } from "react";
import { appAdminUserFiltersSchema } from "@/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/users/schema";
import { UsersListForManager } from "./UsersListForManager";
import { getManagerProfile } from "@/rsc-data/user/manager";
import { redirect } from "next/navigation";

export const metadata = {
  title: "إدارة المواطنين | لوحة المدير | نائبك",
};

async function UserList({
  filters,
}: {
  filters: any;
}) {
  const usersActionResult = await getPaginatedUserListAction(filters);
  if (usersActionResult?.data) {
    const users = usersActionResult.data;
    return <UsersListForManager users={users} />;
  } else {
    if (usersActionResult?.serverError) {
      return <div>{usersActionResult.serverError}</div>;
    } else {
      console.error(usersActionResult);
      return <div>Failed to load users</div>;
    }
  }
}

export default async function ManagerCitizensPage(props: {
  searchParams: Promise<unknown>;
}) {
  const managerProfile = await getManagerProfile();

  if (!managerProfile) {
    redirect("/home");
  }

  const searchParams = await props.searchParams;
  const validatedSearchParams = appAdminUserFiltersSchema.parse(searchParams);
  const suspenseKey = JSON.stringify(validatedSearchParams);
  const totalPagesActionResult = await getUsersTotalPagesAction(
    validatedSearchParams,
  );
  if (typeof totalPagesActionResult?.data !== "undefined") {
    const totalPages = totalPagesActionResult.data;
    return (
      <div className="space-y-4 max-w-[1296px]">
        <PageHeading
          title="بيانات المواطنين"
          subTitle="عرض وإدارة بيانات جميع المواطنين المسجلين في المنصة. يمكنك إرسال روابط تسجيل الدخول، وإدارة حساباتهم."
        ></PageHeading>
        <div className="flex justify-between space-x-3">
          <Search placeholder="البحث عن مواطنين..." />
        </div>
        <Suspense
          key={suspenseKey}
          fallback={<Skeleton className="w-full h-6" />}
        >
          <UserList filters={validatedSearchParams} />
        </Suspense>
        <Pagination totalPages={totalPages} />
      </div>
    );
  } else {
    if (totalPagesActionResult?.serverError) {
      return <div>{totalPagesActionResult.serverError}</div>;
    } else {
      return <div>Failed to load total pages</div>;
    }
  }
}

