// OrganizationSidebar.tsx (Server Component)

import { SidebarAdminPanelNav } from "@/components/sidebar-admin-panel-nav";
import { SidebarDeputyNav } from "@/components/sidebar-deputy-nav";
import { SidebarManagerNav } from "@/components/sidebar-manager-nav";
import { SidebarUserNav } from "@/components/sidebar-user-nav";
import { SidebarFooterUserNav } from "@/components/sidebar-footer-user-nav";

import { SidebarWorkspaceNav } from "@/components/sidebar-workspace-nav";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { SubscriptionData } from "@/payments/AbstractPaymentGateway";
import { StripePaymentGateway } from "@/payments/StripePaymentGateway";
import {
  getCachedSoloWorkspace,
} from "@/rsc-data/user/workspaces";
import { toLower } from "lodash";

function getHasProSubscription(subscriptions: SubscriptionData[]) {
  return subscriptions.some(
    (subscription) =>
      toLower(subscription.billing_products?.name).includes("pro") &&
      subscription.billing_products?.active,
  );
}

export async function SoloWorkspaceSidebar() {
  try {
    // Step 1: Get workspace
    const workspace = await getCachedSoloWorkspace();
    
    if (!workspace) {
      throw new Error("No workspace found");
    }

    // Step 2: Get subscriptions (non-critical, can fail silently)
    let subscriptions: SubscriptionData[] = [];
    try {
      const paymentGateway = new StripePaymentGateway();
      subscriptions = await paymentGateway.db.getSubscriptionsByWorkspaceId(
        workspace.id,
      );
    } catch (e) {
      console.error("Failed to load subscriptions:", e);
      // Continue with empty subscriptions
    }

    const hasProSubscription = getHasProSubscription(subscriptions);

    return (
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          {/* Workspace switcher removed */}
        </SidebarHeader>
        <SidebarContent>
          <SidebarUserNav />
          <SidebarDeputyNav workspace={workspace} />
          <SidebarManagerNav workspace={workspace} />
          <SidebarAdminPanelNav />
        </SidebarContent>
        <SidebarFooter>
          <SidebarFooterUserNav />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    );
  } catch (e) {
    // Only reach here if workspace loading fails
    console.error("Critical error loading workspace sidebar:", e);
    return (
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <div className="p-4 text-sm font-medium">Workspace Error</div>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              Unable to load your workspace.
            </p>
            <p className="text-xs text-muted-foreground">
              Error: {e instanceof Error ? e.message : "Unknown error"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-xs text-primary hover:underline"
            >
              Refresh Page
            </button>
          </div>
        </SidebarContent>
        <SidebarFooter>
          <SidebarFooterUserNav />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    );
  }
}

