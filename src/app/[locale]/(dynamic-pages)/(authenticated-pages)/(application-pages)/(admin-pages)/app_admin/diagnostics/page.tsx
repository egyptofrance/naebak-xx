import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";

type DiagnosticResult = {
  category: string;
  name: string;
  status: "success" | "error" | "warning" | "info";
  message: string;
  details?: string;
  data?: any;
};

async function runDiagnostics(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];
  const supabase = await createSupabaseUserServerComponentClient();

  // 1. التحقق من المستخدمين
  try {
    const { data: usersWithoutWorkspace, error } = await supabase
      .from("user_profiles")
      .select("id, full_name")
      .not("id", "in", supabase.from("workspace_members").select("workspace_member_id"));

    if (error) throw error;

    results.push({
      category: "Users",
      name: "Users Without Workspace",
      status: usersWithoutWorkspace && usersWithoutWorkspace.length > 0 ? "error" : "success",
      message: usersWithoutWorkspace && usersWithoutWorkspace.length > 0
        ? `Found ${usersWithoutWorkspace.length} users without workspace`
        : "All users have workspaces",
      data: usersWithoutWorkspace,
    });
  } catch (e: any) {
    results.push({
      category: "Users",
      name: "Users Without Workspace",
      status: "error",
      message: "Failed to check users",
      details: e.message,
    });
  }

  // 2. التحقق من Workspaces بدون Settings
  try {
    const { data: workspacesWithoutSettings, error } = await supabase.rpc(
      "get_workspaces_without_settings"
    );

    if (error) {
      // إذا لم تكن الـ function موجودة، نستخدم query عادي
      const { data: allWorkspaces } = await supabase.from("workspaces").select("id, name, slug");
      const { data: workspaceSettings } = await supabase
        .from("workspace_application_settings")
        .select("workspace_id");

      const settingsIds = new Set(workspaceSettings?.map((s) => s.workspace_id) || []);
      const missingSettings = allWorkspaces?.filter((w) => !settingsIds.has(w.id)) || [];

      results.push({
        category: "Workspaces",
        name: "Workspaces Without Settings",
        status: missingSettings.length > 0 ? "error" : "success",
        message: missingSettings.length > 0
          ? `Found ${missingSettings.length} workspaces without settings`
          : "All workspaces have settings",
        data: missingSettings,
      });
    } else {
      results.push({
        category: "Workspaces",
        name: "Workspaces Without Settings",
        status: workspacesWithoutSettings && workspacesWithoutSettings.length > 0 ? "error" : "success",
        message: workspacesWithoutSettings && workspacesWithoutSettings.length > 0
          ? `Found ${workspacesWithoutSettings.length} workspaces without settings`
          : "All workspaces have settings",
        data: workspacesWithoutSettings,
      });
    }
  } catch (e: any) {
    results.push({
      category: "Workspaces",
      name: "Workspaces Without Settings",
      status: "error",
      message: "Failed to check workspaces",
      details: e.message,
    });
  }

  // 3. إحصائيات عامة
  try {
    const { count: userCount } = await supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true });

    const { count: workspaceCount } = await supabase
      .from("workspaces")
      .select("*", { count: "exact", head: true });

    const { count: memberCount } = await supabase
      .from("workspace_members")
      .select("*", { count: "exact", head: true });

    const { count: settingsCount } = await supabase
      .from("workspace_application_settings")
      .select("*", { count: "exact", head: true });

    results.push({
      category: "Statistics",
      name: "Database Statistics",
      status: "info",
      message: "Database statistics retrieved successfully",
      data: {
        users: userCount,
        workspaces: workspaceCount,
        members: memberCount,
        settings: settingsCount,
      },
    });
  } catch (e: any) {
    results.push({
      category: "Statistics",
      name: "Database Statistics",
      status: "error",
      message: "Failed to get statistics",
      details: e.message,
    });
  }

  // 4. التحقق من User Profiles بدون Avatar
  try {
    const { data: usersWithoutAvatar, error } = await supabase
      .from("user_profiles")
      .select("id, full_name, avatar_url")
      .is("avatar_url", null);

    if (error) throw error;

    results.push({
      category: "Users",
      name: "Users Without Avatar",
      status: usersWithoutAvatar && usersWithoutAvatar.length > 0 ? "warning" : "success",
      message: usersWithoutAvatar && usersWithoutAvatar.length > 0
        ? `Found ${usersWithoutAvatar.length} users without avatar`
        : "All users have avatars",
      data: usersWithoutAvatar,
    });
  } catch (e: any) {
    results.push({
      category: "Users",
      name: "Users Without Avatar",
      status: "error",
      message: "Failed to check avatars",
      details: e.message,
    });
  }

  // 5. التحقق من Workspace Members بدون Permissions
  try {
    const { data: membersWithoutPermissions, error } = await supabase
      .from("workspace_members")
      .select("workspace_id, workspace_member_id, workspace_member_role, permissions")
      .is("permissions", null);

    if (error) throw error;

    results.push({
      category: "Workspaces",
      name: "Members Without Permissions",
      status: membersWithoutPermissions && membersWithoutPermissions.length > 0 ? "warning" : "success",
      message: membersWithoutPermissions && membersWithoutPermissions.length > 0
        ? `Found ${membersWithoutPermissions.length} members without permissions`
        : "All members have permissions",
      data: membersWithoutPermissions,
    });
  } catch (e: any) {
    results.push({
      category: "Workspaces",
      name: "Members Without Permissions",
      status: "error",
      message: "Failed to check permissions",
      details: e.message,
    });
  }

  // 6. التحقق من Workspace Owners
  try {
    const { data: workspaces } = await supabase.from("workspaces").select("id, name");
    const { data: members } = await supabase
      .from("workspace_members")
      .select("workspace_id, workspace_member_role")
      .eq("workspace_member_role", "owner");

    const workspaceIds = new Set(workspaces?.map((w) => w.id) || []);
    const ownerWorkspaceIds = new Set(members?.map((m) => m.workspace_id) || []);
    const workspacesWithoutOwner = Array.from(workspaceIds).filter((id) => !ownerWorkspaceIds.has(id));

    results.push({
      category: "Workspaces",
      name: "Workspaces Without Owner",
      status: workspacesWithoutOwner.length > 0 ? "error" : "success",
      message: workspacesWithoutOwner.length > 0
        ? `Found ${workspacesWithoutOwner.length} workspaces without owner`
        : "All workspaces have owners",
      data: workspacesWithoutOwner,
    });
  } catch (e: any) {
    results.push({
      category: "Workspaces",
      name: "Workspaces Without Owner",
      status: "error",
      message: "Failed to check owners",
      details: e.message,
    });
  }

  // 7. التحقق من User Roles (Admin)
  try {
    const { data: adminUsers, error } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .eq("role", "admin");

    if (error) throw error;

    results.push({
      category: "Users",
      name: "Admin Users",
      status: "info",
      message: `Found ${adminUsers?.length || 0} admin users`,
      data: adminUsers,
    });
  } catch (e: any) {
    results.push({
      category: "Users",
      name: "Admin Users",
      status: "error",
      message: "Failed to check admin users",
      details: e.message,
    });
  }

  return results;
}

function getStatusIcon(status: DiagnosticResult["status"]) {
  switch (status) {
    case "success":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case "error":
      return <XCircle className="h-5 w-5 text-red-500" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case "info":
      return <Info className="h-5 w-5 text-blue-500" />;
  }
}

function getStatusBadge(status: DiagnosticResult["status"]) {
  switch (status) {
    case "success":
      return <Badge className="bg-green-500">Success</Badge>;
    case "error":
      return <Badge variant="destructive">Error</Badge>;
    case "warning":
      return <Badge className="bg-yellow-500">Warning</Badge>;
    case "info":
      return <Badge variant="secondary">Info</Badge>;
  }
}

export default async function DiagnosticsPage() {
  const results = await runDiagnostics();

  const errorCount = results.filter((r) => r.status === "error").length;
  const warningCount = results.filter((r) => r.status === "warning").length;
  const successCount = results.filter((r) => r.status === "success").length;

  const categories = Array.from(new Set(results.map((r) => r.category)));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Diagnostics</h1>
          <p className="text-muted-foreground">
            Comprehensive system health check and error detection
          </p>
        </div>
        <div className="flex gap-2">
          {errorCount > 0 && (
            <Badge variant="destructive" className="text-lg px-4 py-2">
              {errorCount} Errors
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge className="bg-yellow-500 text-lg px-4 py-2">
              {warningCount} Warnings
            </Badge>
          )}
          {errorCount === 0 && warningCount === 0 && (
            <Badge className="bg-green-500 text-lg px-4 py-2">
              All Clear ✓
            </Badge>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Passed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{successCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Issues Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{errorCount + warningCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Results by Category */}
      {categories.map((category) => {
        const categoryResults = results.filter((r) => r.category === category);
        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{category}</CardTitle>
              <CardDescription>
                {categoryResults.length} checks in this category
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {categoryResults.map((result, index) => (
                <Alert key={index} className="relative">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <AlertTitle className="mb-0">{result.name}</AlertTitle>
                        {getStatusBadge(result.status)}
                      </div>
                      <AlertDescription>{result.message}</AlertDescription>
                      {result.details && (
                        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                          <strong>Details:</strong> {result.details}
                        </div>
                      )}
                      {result.data && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                            View Data ({Array.isArray(result.data) ? result.data.length : "object"})
                          </summary>
                          <pre className="mt-2 bg-muted p-2 rounded overflow-auto max-h-40">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </Alert>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {/* Footer */}
      <Card>
        <CardHeader>
          <CardTitle>Diagnostic Information</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Last Run:</strong> {new Date().toLocaleString()}
          </p>
          <p>
            <strong>Total Checks:</strong> {results.length}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            {errorCount === 0 && warningCount === 0
              ? "✅ System is healthy"
              : `⚠️ Found ${errorCount} errors and ${warningCount} warnings`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

