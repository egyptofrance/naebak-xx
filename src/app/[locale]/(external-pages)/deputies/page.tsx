import { getAllDeputies } from "@/app/actions/deputy/getAllDeputies";
import { getAllGovernorates } from "@/app/actions/governorate/getAllGovernorates";
import { getAllParties } from "@/app/actions/party/getAllParties";
import { getAllElectoralDistricts } from "@/app/actions/electoral-district/getAllElectoralDistricts";
import { getAllCouncils } from "@/app/actions/council/getAllCouncils";
import DeputiesGrid from "./DeputiesGrid";
import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";

// Force dynamic rendering - no caching
export const revalidate = 0;

export default async function DeputiesPage() {
  const deputies = await getAllDeputies();
  const governorates = await getAllGovernorates();
  const parties = await getAllParties();
  const electoralDistricts = await getAllElectoralDistricts();
  const councils = await getAllCouncils();
  
  // Check if user is authenticated and get user profile
  const supabase = await createSupabaseUserServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;
  
  // Get user's governorate if authenticated
  let userGovernorateId: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('governorate_id')
      .eq('id', user.id)
      .single();
    userGovernorateId = profile?.governorate_id || null;
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-right">قائمة النواب</h1>
          
          <DeputiesGrid 
            deputies={deputies} 
            governorates={governorates}
            parties={parties}
            electoralDistricts={electoralDistricts}
            councils={councils}
            isAuthenticated={isAuthenticated}
            userGovernorateId={userGovernorateId}
          />
        </div>
      </div>
    </div>
  );
}

