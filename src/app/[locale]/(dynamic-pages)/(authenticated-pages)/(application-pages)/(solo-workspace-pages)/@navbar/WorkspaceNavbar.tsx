// https://github.com/vercel/next.js/issues/58272
import { Link } from "@/components/intl-link";
import { Skeleton } from "@/components/ui/skeleton";
import { T } from "@/components/ui/Typography";
import { getCachedSoloWorkspace } from "@/rsc-data/user/workspaces";
import { WorkspaceWithMembershipType } from "@/types";
import { getWorkspaceSubPath } from "@/utils/workspaces";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export async function generateMetadata() {
  try {
    const workspace = await getCachedSoloWorkspace();

    return {
      title: `${workspace.name} | Workspace | نائبك`,
      description: "Workspace title",
    };
  } catch (error) {
    return {
      title: "Not found",
    };
  }
}

async function Title({
  workspace,
}: {
  workspace: WorkspaceWithMembershipType;
}) {
  return (
    <div className="capitalize flex items-center gap-2">
      <T.P> {workspace.name} Workspace</T.P>
    </div>
  );
}

// Main navigation menu for authenticated users
export async function WorkspaceNavbar() {
  return null;
}
