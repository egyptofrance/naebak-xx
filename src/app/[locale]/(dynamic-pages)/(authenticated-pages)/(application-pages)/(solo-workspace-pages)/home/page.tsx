import { getAllDeputies } from "@/app/actions/deputy/getAllDeputies";
import { getAllVisibleGovernorates } from "@/app/actions/governorate/getAllVisibleGovernorates";
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

  // Check if user is a deputy
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  // If deputy, redirect to complaints page
  if (userRole?.role === 'deputy') {
    redirect('/deputy-complaints');
  }

  // Get user profile with governorate and electoral district
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('governorate_id, electoral_district_id, full_name')
    .eq('id', user.id)
    .single();

  // Fetch all data
  const [deputies, governorates, parties, electoralDistricts, councils] = await Promise.all([
    getAllDeputies(),
    getAllVisibleGovernorates(),
    getAllParties(),
    getAllElectoralDistricts(),
    getAllCouncils(),
  ]);



  // Filter deputies by user's electoral district
  const myDeputies = deputies.filter(deputy => {
    if (!deputy) return false; // Skip null deputies
    if (profile?.electoral_district_id) {
      return deputy.deputy.electoral_district_id === profile.electoral_district_id;
    }
    // Fallback to governorate if electoral district is not set
    if (profile?.governorate_id) {
      return deputy.electoral_district?.governorate_id === profile.governorate_id;
    }
    return false;
  });

  // Get user's governorate and electoral district names
  const userGovernorate = governorates.find(g => g.id === profile?.governorate_id);
  const userElectoralDistrict = electoralDistricts.find(d => d.id === profile?.electoral_district_id);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              مرحباً، {profile?.full_name || "مواطن"}
            </h1>
            <div className="space-y-2">
              <p className="text-muted-foreground">
                <span className="font-medium">المحافظة:</span>{" "}
                <span className="font-semibold text-foreground">
                  {userGovernorate ? userGovernorate.name_ar : "غير محددة"}
                </span>
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium">الدائرة الانتخابية:</span>{" "}
                <span className="font-semibold text-foreground">
                  {userElectoralDistrict ? userElectoralDistrict.name : "غير محددة"}
                </span>
              </p>
            </div>
          </div>

          {/* Statistics Card */}
          {myDeputies.length > 0 && (
            <div className="mb-6 bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">إحصائيات النواب</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-primary/10 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{myDeputies.length}</div>
                  <div className="text-sm text-muted-foreground">
                    {myDeputies.length === 1 ? "نائب" : myDeputies.length === 2 ? "نائبان" : "نواب"}
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold mb-1">{userGovernorate?.name_ar || "-"}</div>
                  <div className="text-sm text-muted-foreground">المحافظة</div>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <div className="text-lg font-bold mb-1">
                    {userElectoralDistrict ? userElectoralDistrict.name : "جميع الدوائر"}
                  </div>
                  <div className="text-sm text-muted-foreground">الدائرة الانتخابية</div>
                </div>
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

