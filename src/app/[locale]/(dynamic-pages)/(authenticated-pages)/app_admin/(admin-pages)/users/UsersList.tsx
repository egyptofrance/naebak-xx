"use server";

import { getPaginatedUserListAction } from "@/data/admin/user";
import { AppAdminUserFiltersSchema } from "./schema";
import { UsersListWithBulkDelete } from "./UsersListWithBulkDelete";

export async function UserList({
  filters,
}: {
  filters: AppAdminUserFiltersSchema;
}) {
  const usersActionResult = await getPaginatedUserListAction(filters);
  if (usersActionResult?.data) {
    const users = usersActionResult.data;
    return <UsersListWithBulkDelete users={users} />;
  } else {
    if (usersActionResult?.serverError) {
      return <div>{usersActionResult.serverError}</div>;
    } else {
      console.error(usersActionResult);
      return <div>Failed to load users</div>;
    }
  }
}
