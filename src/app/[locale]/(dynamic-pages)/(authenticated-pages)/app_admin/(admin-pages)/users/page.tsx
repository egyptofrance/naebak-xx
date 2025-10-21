import { PageHeading } from "@/components/PageHeading";
import { Pagination } from "@/components/Pagination";
import { Search } from "@/components/Search";
import { Skeleton } from "@/components/ui/skeleton";
import { getUsersTotalPagesAction } from "@/data/admin/user";
import { Suspense } from "react";
import { AppAdminCreateUserDialog } from "./AppAdminCreateUserDialog";
import { UserList } from "./UsersList";
import { appAdminUserFiltersSchema } from "./schema";

export const metadata = {
  title: "User List | Admin Panel | نائبك",
};

export default async function AdminUsersListPage(props: {
  searchParams: Promise<unknown>;
}) {
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
          subTitle="عرض وإدارة بيانات جميع المواطنين المسجلين في المنصة. يمكنك إنشاء مواطنين جدد، إرسال روابط تسجيل الدخول، وإدارة حساباتهم بشكل كامل."
        ></PageHeading>
        <div className="flex justify-between space-x-3">
          <Search placeholder="البحث عن مواطنين..." />
          <AppAdminCreateUserDialog />
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
