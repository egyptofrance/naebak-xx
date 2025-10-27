import { ApplicationLayoutShell } from "@/components/ApplicationLayoutShell";
import { InternalNavbar } from "@/components/NavigationMenu/InternalNavbar";

export default async function Layout({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <ApplicationLayoutShell sidebar={sidebar}>
      <div className="h-full overflow-y-auto" data-testid="admin-panel-layout">
        <InternalNavbar>
          <div
            data-testid="admin-panel-title"
            className="flex items-center justify-start w-full"
          >
            Admin panel
          </div>
        </InternalNavbar>
        <div className="relative flex-1 h-auto mt-8 w-full" dir="rtl">
          <div className="pl-6 pr-12 space-y-6 pb-10 text-right">
            {children}
          </div>
        </div>
      </div>
    </ApplicationLayoutShell>
  );
}
