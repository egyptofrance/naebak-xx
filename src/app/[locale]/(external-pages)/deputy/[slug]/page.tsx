import { getDeputyBySlug } from "@/app/actions/deputy/getDeputyBySlug";
import { getUserRating } from "@/app/actions/deputy/getUserRating";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { BannerImage } from "./BannerImage";
import { DeputyRating } from "./DeputyRating";
import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";
import { formatDeputyName } from "@/utils/formatDeputyName";
import { 
  MapPin, 
  Users, 
  Building2, 
  Vote, 
  FileText, 
  Target, 
  Trophy, 
  Calendar,
  Phone,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Globe
} from "lucide-react";

interface PageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

// Default images for each section
const DEFAULT_IMAGES = {
  electoral_program: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=400&fit=crop", // Planning/Goals
  achievement: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop", // Success/Achievement
  event: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=400&fit=crop", // Events/Gatherings
};

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
  const isRTL = locale === "ar";

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      {/* Banner Image */}
      <BannerImage src={displayBanner} alt="Banner" />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header Card */}
          <div className="bg-card p-8 rounded-lg shadow-sm border">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name || "النائب"}
                  className="w-32 h-32 rounded-full object-cover border-4 border-primary/10"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20">
                  <span className="text-4xl font-bold text-primary">
                    {user.full_name?.charAt(0) || "؟"}
                  </span>
                </div>
              )}

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-3xl md:text-4xl font-bold">
                    {formatDeputyName(user.full_name, deputy.display_name)}
                  </h1>
                  <Badge variant={getStatusVariant(deputy.deputy_status)} className="text-sm">
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

                {/* Points Display */}
                {deputy.points !== undefined && deputy.points !== null && (
                  <div className="mt-3 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <span className="text-lg font-semibold text-foreground">
                      {deputy.points} نقطة
                    </span>
                    <span className="text-sm text-muted-foreground">
                      من حل الشكاوى
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Data Card */}
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">البيانات الأساسية</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block">المحافظة</span>
                    <span className="font-medium">
                      {governorate 
                        ? (locale === "ar" ? governorate.name_ar : governorate.name_en)
                        : <span className="text-sm italic text-muted-foreground">{noData}</span>
                      }
                    </span>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block">الحزب</span>
                    <span className="font-medium">
                      {party 
                        ? (locale === "ar" ? party.name_ar : party.name_en)
                        : <span className="text-sm italic text-muted-foreground">{noData}</span>
                      }
                    </span>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block">المجلس</span>
                    <span className="font-medium">
                      {council 
                        ? (locale === "ar" ? council.name_ar : council.name_en)
                        : <span className="text-sm italic text-muted-foreground">{noData}</span>
                      }
                    </span>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Vote className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block">الدائرة الانتخابية</span>
                    <span className="font-medium">
                      {electoral_district 
                        ? electoral_district.name
                        : <span className="text-sm italic text-muted-foreground">{noData}</span>
                      }
                    </span>
                  </div>
                </div>

                {deputy.electoral_symbol && (
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-muted-foreground block">الرمز الانتخابي</span>
                      <span className="font-medium">{deputy.electoral_symbol}</span>
                    </div>
                  </div>
                )}

                {deputy.electoral_number && (
                  <div className="flex items-start gap-3">
                    <Vote className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-muted-foreground block">الرقم الانتخابي</span>
                      <span className="font-medium">{deputy.electoral_number}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Info Card */}
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">معلومات الاتصال</h2>
              </div>
              <div className="space-y-3">
                {deputy.office_address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-muted-foreground block">عنوان المكتب</span>
                      <span className="font-medium">{deputy.office_address}</span>
                    </div>
                  </div>
                )}

                {deputy.office_phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-muted-foreground block">هاتف المكتب</span>
                      <a href={`tel:${deputy.office_phone}`} className="font-medium hover:text-primary transition-colors" dir="ltr">
                        {deputy.office_phone}
                      </a>
                    </div>
                  </div>
                )}

                {deputy.office_hours && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-muted-foreground block">ساعات العمل</span>
                      <span className="font-medium">{deputy.office_hours}</span>
                    </div>
                  </div>
                )}

                {/* Social Media Links */}
                {(deputy.social_media_facebook || deputy.social_media_twitter || deputy.social_media_instagram || deputy.social_media_youtube || deputy.website) && (
                  <div className="pt-3 border-t">
                    <span className="text-sm font-medium text-muted-foreground block mb-3">وسائل التواصل</span>
                    <div className="flex flex-wrap gap-2">
                      {deputy.social_media_facebook && (
                        <a href={deputy.social_media_facebook} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-primary/10 transition-colors">
                          <Facebook className="h-5 w-5 text-blue-600" />
                        </a>
                      )}
                      {deputy.social_media_twitter && (
                        <a href={deputy.social_media_twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-primary/10 transition-colors">
                          <Twitter className="h-5 w-5 text-sky-500" />
                        </a>
                      )}
                      {deputy.social_media_instagram && (
                        <a href={deputy.social_media_instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-primary/10 transition-colors">
                          <Instagram className="h-5 w-5 text-pink-600" />
                        </a>
                      )}
                      {deputy.social_media_youtube && (
                        <a href={deputy.social_media_youtube} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-primary/10 transition-colors">
                          <Youtube className="h-5 w-5 text-red-600" />
                        </a>
                      )}
                      {deputy.website && (
                        <a href={deputy.website} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-primary/10 transition-colors">
                          <Globe className="h-5 w-5 text-primary" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {!deputy.office_address && !deputy.office_phone && !deputy.office_hours && !deputy.social_media_facebook && !deputy.social_media_twitter && !deputy.social_media_instagram && !deputy.social_media_youtube && !deputy.website && (
                  <p className="text-sm italic text-muted-foreground text-center py-4">
                    {noData}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Bio Card */}
          {deputy.bio && (
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">السيرة الذاتية</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {deputy.bio}
              </p>
            </div>
          )}

          {/* Electoral Program Card */}
          {((electoralPrograms && electoralPrograms.length > 0) || deputy.electoral_program) && (
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-2 mb-6">
                <Target className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">البرنامج الانتخابي</h2>
              </div>
              {electoralPrograms && electoralPrograms.length > 0 ? (
                <div className="space-y-8">
                  {electoralPrograms.map((item: any, index: number) => (
                    <div key={item.id} className="border-b pb-8 last:border-b-0 last:pb-0">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Image - Default or Custom */}
                        <div className="flex-shrink-0">
                          <div className="relative group">
                            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                            <img
                              src={item.image_url || DEFAULT_IMAGES.electoral_program}
                              alt={item.title}
                              className="relative w-full md:w-48 h-48 rounded-2xl object-cover border-4 border-primary/10 shadow-lg group-hover:border-primary/30 group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300"
                            />
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-3 text-primary">{item.title}</h3>
                          {item.description && (
                            <p className="text-base leading-relaxed whitespace-pre-wrap">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : deputy.electoral_program ? (
                <div className="text-base leading-relaxed whitespace-pre-wrap">
                  {deputy.electoral_program}
                </div>
              ) : null}
            </div>
          )}

          {/* Achievements Card */}
          {((achievements && achievements.length > 0) || deputy.achievements) && (
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">الإنجازات</h2>
              </div>
              {achievements && achievements.length > 0 ? (
                <div className="space-y-8">
                  {achievements.map((item: any) => (
                    <div key={item.id} className="border-b pb-8 last:border-b-0 last:pb-0">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Image - Default or Custom */}
                        <div className="flex-shrink-0">
                          <div className="relative group">
                            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                            <img
                              src={item.image_url || DEFAULT_IMAGES.achievement}
                              alt={item.title}
                              className="relative w-full md:w-48 h-48 rounded-2xl object-cover border-4 border-primary/10 shadow-lg group-hover:border-primary/30 group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300"
                            />
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-3 text-primary">{item.title}</h3>
                          {item.description && (
                            <p className="text-base leading-relaxed whitespace-pre-wrap">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : deputy.achievements ? (
                <div className="text-base leading-relaxed whitespace-pre-wrap">
                  {deputy.achievements}
                </div>
              ) : null}
            </div>
          )}

          {/* Events Card */}
          {((events && events.length > 0) || deputy.events) && (
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">الفعاليات والمناسبات</h2>
              </div>
              {events && events.length > 0 ? (
                <div className="space-y-8">
                  {events.map((item: any) => (
                    <div key={item.id} className="border-b pb-8 last:border-b-0 last:pb-0">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Image - Default or Custom */}
                        <div className="flex-shrink-0">
                          <div className="relative group">
                            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                            <img
                              src={item.image_url || DEFAULT_IMAGES.event}
                              alt={item.title}
                              className="relative w-full md:w-48 h-48 rounded-2xl object-cover border-4 border-primary/10 shadow-lg group-hover:border-primary/30 group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300"
                            />
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2 text-primary">{item.title}</h3>
                          {item.event_date && (
                            <p className="text-sm font-medium text-muted-foreground mb-3">
                              📅 التاريخ: {new Date(item.event_date).toLocaleDateString('ar-EG', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          )}
                          {item.description && (
                            <p className="text-base leading-relaxed whitespace-pre-wrap">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : deputy.events ? (
                <div className="text-base leading-relaxed whitespace-pre-wrap">
                  {deputy.events}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

