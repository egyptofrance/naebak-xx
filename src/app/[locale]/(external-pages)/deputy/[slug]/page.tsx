import { getDeputyBySlug } from "@/app/actions/deputy/getDeputyBySlug";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";

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

  const { deputy, user, governorate, party, council } = data;

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
                    {user.full_name || noData}
                  </h1>
                  <Badge variant={getStatusVariant(deputy.deputy_status)}>
                    {getStatusLabel(deputy.deputy_status)}
                  </Badge>
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
                <span className="font-semibold text-muted-foreground">الهاتف الشخصي:</span>
                {user.phone ? (
                  <span dir="ltr">{user.phone}</span>
                ) : (
                  <span className="text-sm italic text-muted-foreground">{noData}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-muted-foreground">هاتف المكتب:</span>
                {deputy.office_phone ? (
                  <span dir="ltr">{deputy.office_phone}</span>
                ) : (
                  <span className="text-sm italic text-muted-foreground">{noData}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-muted-foreground">عنوان المكتب:</span>
                {deputy.office_address ? (
                  <span>{deputy.office_address}</span>
                ) : (
                  <span className="text-sm italic text-muted-foreground">{noData}</span>
                )}
              </div>
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
            {deputy.electoral_program ? (
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
            {deputy.achievements ? (
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
            {deputy.events ? (
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

