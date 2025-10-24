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
                    {user.full_name || "غير محدد"}
                  </h1>
                  <Badge variant={getStatusVariant(deputy.deputy_status)}>
                    {getStatusLabel(deputy.deputy_status)}
                  </Badge>
                </div>

                <div className="space-y-2 text-muted-foreground">
                  {governorate && (
                    <p className="flex items-center gap-2">
                      <span className="font-semibold">المحافظة:</span>
                      {locale === "ar" ? governorate.name_ar : governorate.name_en}
                    </p>
                  )}
                  {party && (
                    <p className="flex items-center gap-2">
                      <span className="font-semibold">الحزب:</span>
                      {locale === "ar" ? party.name_ar : party.name_en}
                    </p>
                  )}
                  {council && (
                    <p className="flex items-center gap-2">
                      <span className="font-semibold">المجلس:</span>
                      {locale === "ar" ? council.name_ar : council.name_en}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info Card */}
          {(user.phone || deputy.office_phone || deputy.office_address) && (
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <h2 className="text-2xl font-bold mb-4">معلومات الاتصال</h2>
              <div className="space-y-3">
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-muted-foreground">الهاتف الشخصي:</span>
                    <span dir="ltr">{user.phone}</span>
                  </div>
                )}
                {deputy.office_phone && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-muted-foreground">هاتف المكتب:</span>
                    <span dir="ltr">{deputy.office_phone}</span>
                  </div>
                )}
                {deputy.office_address && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-muted-foreground">عنوان المكتب:</span>
                    <span>{deputy.office_address}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bio Card */}
          {deputy.bio && (
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <h2 className="text-2xl font-bold mb-4">السيرة الذاتية</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {deputy.bio}
              </p>
            </div>
          )}

          {/* Placeholder for more content */}
          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <p className="text-muted-foreground text-center">
              سيتم إضافة البرنامج الانتخابي والإنجازات والفعاليات قريباً...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

