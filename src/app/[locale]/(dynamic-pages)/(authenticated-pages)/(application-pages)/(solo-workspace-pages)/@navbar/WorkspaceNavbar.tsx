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

export async function WorkspaceNavbar() {
  return (
    <nav className="flex items-center gap-6" dir="rtl">
      <Link href="/deputies" className="text-sm font-medium hover:text-primary transition-colors">
        النواب
      </Link>
      <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
        من نحن
      </Link>
      <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">
        اتصل بنا
      </Link>
      <Link href="/public-complaints" className="text-sm font-medium hover:text-primary transition-colors">
        الشكاوى العامة
      </Link>
    </nav>
  );
}
