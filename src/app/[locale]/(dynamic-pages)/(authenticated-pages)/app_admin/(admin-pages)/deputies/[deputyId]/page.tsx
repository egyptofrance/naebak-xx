import { Link } from "@/components/intl-link";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trash2 } from "lucide-react";
import { DeputyEditForm } from "./DeputyEditForm";
import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";
import { notFound } from "next/navigation";

interface DeputyPageProps {
  params: Promise<{
    deputyId: string;
  }>;
}

export default async function DeputyPage({ params }: DeputyPageProps) {
  const { deputyId } = await params;
  const supabase = await createSupabaseUserServerComponentClient();

  // Fetch deputy data
  const { data: deputy, error: deputyError } = await supabase
    .from("deputy_profiles")
    .select(
      `
      *,
      user_profiles (
        full_name,
        email,
        phone,
        governorate_id,
        party_id,
        electoral_district,
        governorates (
          name_ar,
          name_en
        ),
        parties (
          name_ar,
          name_en
        )
      ),
      councils (
        name_ar,
        name_en
      )
    `
    )
    .eq("id", deputyId)
    .single();

  if (deputyError || !deputy) {
    notFound();
  }

  // Fetch councils for dropdown
  const { data: councils } = await supabase
    .from("councils")
    .select("id, name_ar, name_en, code")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  // Fetch governorates for dropdown
  const { data: governorates } = await supabase
    .from("governorates")
    .select("id, name_ar, name_en")
    .order("name_ar", { ascending: true });

  const userProfile = Array.isArray(deputy.user_profiles)
    ? deputy.user_profiles[0]
    : deputy.user_profiles;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/app_admin/deputies">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <Typography.H1 className="text-3xl font-bold tracking-tight">
              {userProfile?.full_name || "غير محدد"}
            </Typography.H1>
            <Badge variant={deputy.deputy_status === "current" ? "default" : "secondary"}>
              {deputy.deputy_status === "current" ? "نائب حالي" : "مرشح"}
            </Badge>
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            {userProfile?.email && <span>📧 {userProfile.email}</span>}
            {userProfile?.phone && <span>📱 {userProfile.phone}</span>}
            {userProfile?.governorates?.name_ar && (
              <span>📍 {userProfile.governorates.name_ar}</span>
            )}
            {userProfile?.parties?.name_ar && (
              <span>🏛️ {userProfile.parties.name_ar}</span>
            )}
          </div>
        </div>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          حذف ملف النائب
        </Button>
      </div>

      <DeputyEditForm deputy={deputy} councils={councils || []} governorates={governorates || []} />
    </div>
  );
}

