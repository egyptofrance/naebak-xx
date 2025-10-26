import { getDeputyBySlug } from "@/app/actions/deputy/getDeputyBySlug";
import { getUserRating } from "@/app/actions/deputy/getUserRating";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { BannerImage } from "./BannerImage";
import { DeputyRating } from "./DeputyRating";
import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";
import { formatDeputyName } from "@/utils/formatDeputyName";

interface PageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

export default async function DeputyPage({ params }: PageProps) {
  const { slug, locale } = await params;

  // Fetch deputy data
  const data = await getDeputyBySlug(slug);

  // If deputy not found, show 404
  if (!data) {
    notFound();
  }

  // Get user's rating for this deputy
  const userRating = await getUserRating(data.deputy.id);

  // Check if user is authenticated
  const supabase = await createSupabaseUserServerComponentClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  const isAuthenticated = !!authUser;

  const { deputy, user, governorate, party, council, electoral_district, bannerImage, electoralPrograms, achievements, events } = data;
  
  // Get Supabase URL for storage
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  // Use site-banner from Supabase Storage as default if no custom banner
  const defaultBanner = `${supabaseUrl}/storage/v1/object/public/public-user-assets/site-banner.jpg`;
  const displayBanner = bannerImage || defaultBanner;

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "current":
        return "نائب حالي";
      case "candidate":
        return "مرشح";
      case "former":
        return "نائب سابق";
      default:
        return status;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "outline" => {
    switch (status) {
      case "current":
        return "default";
      case "candidate":
        return "secondary";
      default:
        return "outline";
    }
  };

  const noData = "لا توجد بيانات متوفرة";

  return (
    <div className="min-h-screen bg-background">
      {/* Banner Image */}
      <BannerImage src={displayBanner} alt="Banner" />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Card */}
          <div className="bg-card p-8 rounded-lg shadow-sm border">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name || "النائب"}
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-4xl text-muted-foreground">
                    {user.full_name?.charAt(0) || "؟"}
                  </span>
                </div>
              )}

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold">
                    {formatDeputyName(user.full_name, deputy.display_name)}
                  </h1>
                  <Badge variant={getStatusVariant(deputy.deputy_status)}>
                    {getStatusLabel(deputy.deputy_status)}
                  </Badge>
                </div>
                
                {/* Rating Display - Interactive */}
                <div className="mt-3">
                  <DeputyRating
                    deputyId={deputy.id}
                    rating={deputy.rating_average || 0}
                    ratingCount={deputy.rating_count || 0}
                    userRating={userRating}
                    isAuthenticated={isAuthenticated}
                    compact={true}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info Card */}
          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <h2 className="text-2xl font-bold mb-4">البيانات الأساسية</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-muted-foreground">المحافظة:</span>
                {governorate 
                  ? (locale === "ar" ? governorate.name_ar : governorate.name_en)
                  : <span className="text-sm italic text-muted-foreground">{noData}</span>
                }
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-muted-foreground">الحزب:</span>
                {party 
                  ? (locale === "ar" ? party.name_ar : party.name_en)
                  : <span className="text-sm italic text-muted-foreground">{noData}</span>
                }
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-muted-foreground">المجلس:</span>
                {council 
                  ? (locale === "ar" ? council.name_ar : council.name_en)
                  : <span className="text-sm italic text-muted-foreground">{noData}</span>
                }
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-muted-foreground">الدائرة الانتخابية:</span>
                {electoral_district 
                  ? electoral_district.name
                  : <span className="text-sm italic text-muted-foreground">{noData}</span>
                }
              </div>
              {deputy.candidate_type && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-muted-foreground">نوع الترشح:</span>
                  <span>
                    {deputy.candidate_type === "individual" ? "فردي" : 
                     deputy.candidate_type === "list" ? "قائمة" : "كلاهما"}
                  </span>
                </div>
              )}

            </div>
          </div>

          {/* Bio Card */}
          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <h2 className="text-2xl font-bold mb-4">السيرة الذاتية</h2>
            {deputy.bio ? (
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {deputy.bio}
              </p>
            ) : (
              <p className="text-sm italic text-muted-foreground text-center py-4">
                {noData}
              </p>
            )}
          </div>

          {/* Electoral Program Card */}
          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <h2 className="text-2xl font-bold mb-4">البرنامج الانتخابي</h2>
            {electoralPrograms && electoralPrograms.length > 0 ? (
              <div className="space-y-6">
                {electoralPrograms.map((item: any) => (
                  <div key={item.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    {item.description && (
                      <p className="text-muted-foreground mb-3 whitespace-pre-wrap">
                        {item.description}
                      </p>
                    )}
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full max-w-2xl rounded-lg object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : deputy.electoral_program ? (
              <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {deputy.electoral_program}
              </div>
            ) : (
              <p className="text-sm italic text-muted-foreground text-center py-4">
                {noData}
              </p>
            )}
          </div>

          {/* Achievements Card */}
          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <h2 className="text-2xl font-bold mb-4">الإنجازات</h2>
            {achievements && achievements.length > 0 ? (
              <div className="space-y-6">
                {achievements.map((item: any) => (
                  <div key={item.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    {item.description && (
                      <p className="text-muted-foreground mb-3 whitespace-pre-wrap">
                        {item.description}
                      </p>
                    )}
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full max-w-2xl rounded-lg object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : deputy.achievements ? (
              <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {deputy.achievements}
              </div>
            ) : (
              <p className="text-sm italic text-muted-foreground text-center py-4">
                {noData}
              </p>
            )}
          </div>

          {/* Events Card */}
          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <h2 className="text-2xl font-bold mb-4">الفعاليات والمناسبات</h2>
            {events && events.length > 0 ? (
              <div className="space-y-6">
                {events.map((item: any) => (
                  <div key={item.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    {item.event_date && (
                      <p className="text-sm text-muted-foreground mb-2">
                        التاريخ: {new Date(item.event_date).toLocaleDateString('ar-EG')}
                      </p>
                    )}
                    {item.description && (
                      <p className="text-muted-foreground mb-3 whitespace-pre-wrap">
                        {item.description}
                      </p>
                    )}
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full max-w-2xl rounded-lg object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : deputy.events ? (
              <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {deputy.events}
              </div>
            ) : (
              <p className="text-sm italic text-muted-foreground text-center py-4">
                {noData}
              </p>
            )}
          </div>


        </div>
      </div>
    </div>
  );
}

