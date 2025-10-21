import { PageHeading } from "@/components/PageHeading";
import { Pagination } from "@/components/Pagination";
import { Search } from "@/components/Search";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { ManagersList } from "./ManagersList";
import { appAdminManagerFiltersSchema } from "./schema";

export const metadata = {
  title: "Managers List | Admin Panel | نائبك",
};

export default async function AdminManagersListPage(props: {
  searchParams: Promise<unknown>;
}) {
  const searchParams = await props.searchParams;
  const validatedSearchParams = appAdminManagerFiltersSchema.parse(searchParams);
  const suspenseKey = JSON.stringify(validatedSearchParams);

  return (
    <div className="space-y-4 max-w-[1296px]">
      <PageHeading
        title="بيانات المديرين"
        subTitle="عرض جميع المديرين في النظام. يمكنك البحث عن المديرين وإدارة بياناتهم."
      ></PageHeading>
      <div className="flex justify-between space-x-3">
        <Search placeholder="البحث عن مدير... " />
      </div>
      <Suspense
        key={suspenseKey}
        fallback={<Skeleton className="w-full h-6" />}
      >
        <ManagersList filters={validatedSearchParams} />
      </Suspense>
      <Pagination totalPages={1} />
    </div>
  );
}

