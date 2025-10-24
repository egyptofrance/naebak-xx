import { getDeputyBySlug } from "@/app/actions/deputy/getDeputyBySlug";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

export default async function DeputyPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch deputy data
  const data = await getDeputyBySlug(slug);

  // If deputy not found, show 404
  if (!data) {
    notFound();
  }

  const { deputy, user } = data;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-card p-8 rounded-lg shadow-sm border mb-6">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name || "النائب"}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-3xl text-muted-foreground">
                    {user.full_name?.charAt(0) || "؟"}
                  </span>
                </div>
              )}

              {/* Name */}
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  {user.full_name || "غير محدد"}
                </h1>
                <p className="text-muted-foreground">
                  معرف الصفحة: <span className="font-mono">{slug}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Placeholder for more content */}
          <div className="bg-card p-8 rounded-lg shadow-sm border">
            <p className="text-muted-foreground text-center">
              سيتم إضافة المزيد من البيانات قريباً...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

