import { getPublicComplaintById } from "@/data/complaints/complaints";
import { notFound } from "next/navigation";
import { Link } from "@/components/intl-link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, MapPin, Tag, AlertCircle } from "lucide-react";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{
    complaintId: string;
    locale: string;
  }>;
}

const categoryLabels: Record<string, string> = {
  infrastructure: "البنية التحتية",
  education: "التعليم",
  health: "الصحة",
  security: "الأمن",
  environment: "البيئة",
  transportation: "النقل",
  utilities: "المرافق",
  housing: "الإسكان",
  employment: "التوظيف",
  social_services: "الخدمات الاجتماعية",
  legal: "قانونية",
  corruption: "فساد",
  other: "أخرى",
};

const statusLabels: Record<string, string> = {
  new: "جديدة",
  under_review: "قيد المراجعة",
  in_progress: "قيد المعالجة",
  resolved: "محلولة",
  closed: "مغلقة",
};

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 border-blue-200",
  under_review: "bg-yellow-100 text-yellow-800 border-yellow-200",
  in_progress: "bg-orange-100 text-orange-800 border-orange-200",
  resolved: "bg-green-100 text-green-800 border-green-200",
  closed: "bg-gray-100 text-gray-800 border-gray-200",
};

const priorityLabels: Record<string, string> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
  urgent: "عاجلة",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

export default async function PublicComplaintDetailPage({ params }: PageProps) {
  const { complaintId } = await params;
  const { data: complaint, error } = await getPublicComplaintById(complaintId);

  if (error || !complaint) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl" dir="rtl">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/public-complaints">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowRight className="h-4 w-4" />
            العودة إلى قائمة الشكاوى
          </Button>
        </Link>
      </div>

      {/* Main Card */}
      <div className="bg-card border rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-l from-green-600 to-green-700 text-white p-6">
          <div className="flex justify-between items-start gap-4 mb-4">
            <h1 className="text-2xl md:text-3xl font-bold flex-1">
              {complaint.title}
            </h1>
            <span className={`text-sm px-4 py-2 rounded-full border ${statusColors[complaint.status] || 'bg-gray-100 text-gray-800'}`}>
              {statusLabels[complaint.status] || complaint.status}
            </span>
          </div>
          
          {complaint.priority && (
            <div className="inline-flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span className={`text-xs px-3 py-1 rounded-full ${priorityColors[complaint.priority] || 'bg-gray-100 text-gray-800'}`}>
                الأولوية: {priorityLabels[complaint.priority] || complaint.priority}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Tag className="h-5 w-5 text-green-600" />
              وصف الشكوى
            </h2>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-base leading-relaxed whitespace-pre-wrap">
                {complaint.description}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div>
            <h2 className="text-lg font-semibold mb-3">التفاصيل</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div className="bg-muted/30 rounded-lg p-4 border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Tag className="h-4 w-4" />
                  <span className="text-sm font-medium">الفئة</span>
                </div>
                <p className="text-base font-semibold">
                  {categoryLabels[complaint.category] || complaint.category}
                </p>
              </div>

              {/* Governorate */}
              {complaint.governorate && (
                <div className="bg-muted/30 rounded-lg p-4 border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">المحافظة</span>
                  </div>
                  <p className="text-base font-semibold">{complaint.governorate}</p>
                </div>
              )}

              {/* District */}
              {complaint.district && (
                <div className="bg-muted/30 rounded-lg p-4 border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">المنطقة</span>
                  </div>
                  <p className="text-base font-semibold">{complaint.district}</p>
                </div>
              )}

              {/* Created Date */}
              <div className="bg-muted/30 rounded-lg p-4 border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">تاريخ الإنشاء</span>
                </div>
                <p className="text-base font-semibold">
                  {new Date(complaint.created_at).toLocaleDateString("ar-EG", {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {/* Resolved Date */}
              {complaint.resolved_at && (complaint.status === 'resolved' || complaint.status === 'closed') && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 text-green-700 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">تاريخ الحل</span>
                  </div>
                  <p className="text-base font-semibold text-green-800">
                    {new Date(complaint.resolved_at).toLocaleDateString("ar-EG", {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Status Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>ملاحظة:</strong> هذه الشكوى متاحة للعرض العام بموافقة المواطن والإدارة. 
              يتم تحديث الحالة بشكل دوري حسب تقدم المعالجة.
            </p>
          </div>
        </div>
      </div>

      {/* Back Button Bottom */}
      <div className="mt-6 flex justify-center">
        <Link href="/public-complaints">
          <Button variant="outline" className="gap-2">
            <ArrowRight className="h-4 w-4" />
            العودة إلى قائمة الشكاوى
          </Button>
        </Link>
      </div>
    </div>
  );
}
