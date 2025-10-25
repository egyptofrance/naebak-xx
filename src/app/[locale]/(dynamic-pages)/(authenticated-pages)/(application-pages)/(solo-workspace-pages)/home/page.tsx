import { getAllDeputies } from "@/app/actions/deputy/getAllDeputies";
import { getAllGovernorates } from "@/app/actions/governorate/getAllGovernorates";
import { getAllParties } from "@/app/actions/party/getAllParties";
import { getAllElectoralDistricts } from "@/app/actions/electoral-district/getAllElectoralDistricts";
import { getAllCouncils } from "@/app/actions/council/getAllCouncils";
import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";
import { redirect } from "next/navigation";
import DeputiesGrid from "@/app/[locale]/(external-pages)/deputies/DeputiesGrid";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "نوابي | الصفحة الرئيسية",
    description: "تصفح نواب دائرتك الانتخابية",
  };
}

export default async function CitizenHomePage() {
  // Get authenticated user
  const supabase = await createSupabaseUserServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  // Get user profile with governorate and electoral district
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('governorate_id, electoral_district, full_name')
    .eq('id', user.id)
    .single();

  // Fetch all data
  const [deputies, governorates, parties, electoralDistricts, councils] = await Promise.all([
    getAllDeputies(),
    getAllGovernorates(),
    getAllParties(),
    getAllElectoralDistricts(),
    getAllCouncils(),
  ]);

  // Debug logging
  console.log('[Home] Profile electoral_district:', profile?.electoral_district);
  console.log('[Home] Total deputies:', deputies.length);
  if (deputies.length > 0) {
    console.log('[Home] First deputy electoral_district_id:', deputies[0].deputy.electoral_district_id);
    console.log('[Home] First 5 deputies electoral_district_ids:');
    deputies.slice(0, 5).forEach((d, i) => {
      console.log(`  [${i}] electoral_district_id:`, d.deputy.electoral_district_id, 'Type:', typeof d.deputy.electoral_district_id);
    });
  }

  // Filter deputies by user's electoral district
  const myDeputies = deputies.filter(deputy => {
    if (profile?.electoral_district) {
      return deputy.deputy.electoral_district_id === profile.electoral_district;
    }
    // Fallback to governorate if electoral district is not set
    if (profile?.governorate_id) {
      return deputy.user?.governorate_id === profile.governorate_id;
    }
    return false;
  });

  // Get user's governorate and electoral district names
  const userGovernorate = governorates.find(g => g.id === profile?.governorate_id);
  const userElectoralDistrict = electoralDistricts.find(d => d.id === profile?.electoral_district);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              مرحباً، {profile?.full_name || "مواطن"}
            </h1>
            <p className="text-muted-foreground">
              {userElectoralDistrict ? (
                <>
                  نواب دائرتك الانتخابية: <span className="font-semibold text-foreground">{userElectoralDistrict.name}</span>
                  {userGovernorate && (
                    <> - <span className="font-semibold text-foreground">{userGovernorate.name_ar}</span></>
                  )}
                </>
              ) : userGovernorate ? (
                <>
                  نواب محافظتك: <span className="font-semibold text-foreground">{userGovernorate.name_ar}</span>
                </>
              ) : (
                "يرجى تحديث بياناتك في الإعدادات لعرض نواب دائرتك"
              )}
            </p>
          </div>

          {/* Debug Info */}
          <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded text-sm">
            <p><strong>Debug Info:</strong></p>
            <p>Profile electoral_district: {profile?.electoral_district || 'null'}</p>
            <p>Profile governorate_id: {profile?.governorate_id || 'null'}</p>
            <p>Total deputies: {deputies.length}</p>
            <p>Filtered deputies: {myDeputies.length}</p>
            {deputies.length > 0 && (
              <>
                <p>First deputy district ID: {deputies[0].deputy.electoral_district_id || 'null'}</p>
                <p>Comparison: {deputies[0].deputy.electoral_district_id === profile?.electoral_district ? 'MATCH ✓' : 'NO MATCH ✗'}</p>
                <p className="mt-2"><strong>First 3 deputies:</strong></p>
                {deputies.slice(0, 3).map((d, i) => (
                  <p key={i} className="ml-4 text-xs">
                    [{i}] {d.user?.full_name} - District: {d.deputy.electoral_district_id || 'null'}
                  </p>
                ))}
              </>
            )}
          </div>

          {/* Deputies Count */}
          {myDeputies.length > 0 && (
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg">
                <span className="text-2xl font-bold">{myDeputies.length}</span>
                <span className="text-sm">
                  {myDeputies.length === 1 ? "نائب" : myDeputies.length === 2 ? "نائبان" : "نواب"}
                </span>
              </div>
            </div>
          )}

          {/* No Deputies Message */}
          {myDeputies.length === 0 && (
            <div className="bg-muted/50 border border-border rounded-lg p-8 text-center">
              <p className="text-lg text-muted-foreground mb-4">
                {!profile?.electoral_district && !profile?.governorate_id ? (
                  <>
                    لم تقم بتحديد دائرتك الانتخابية بعد
                    <br />
                    <span className="text-sm">يرجى تحديث بياناتك في الإعدادات لعرض نواب دائرتك</span>
                  </>
                ) : (
                  <>
                    لا يوجد نواب مسجلين في دائرتك حالياً
                    <br />
                    <span className="text-sm">سيتم تحديث القائمة عند إضافة نواب جدد</span>
                  </>
                )}
              </p>
              <a 
                href="/settings" 
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                تحديث البيانات
              </a>
            </div>
          )}

          {/* Deputies Grid */}
          {myDeputies.length > 0 && (
            <DeputiesGrid 
              deputies={myDeputies}
              governorates={governorates}
              parties={parties}
              electoralDistricts={electoralDistricts}
              councils={councils}
              isAuthenticated={true}
              userGovernorateId={profile?.governorate_id || null}
              hideFilters={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}

