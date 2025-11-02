import { getPublicComplaintById, getComplaintComments, getComplaintVotesCount } from "@/data/complaints/complaints";
import { getComplaintAttachments } from "@/data/complaints/getComplaintAttachments";
import { hasUserVoted } from "@/app/actions/complaints/hasUserVoted";
import { notFound } from "next/navigation";
import { Link } from "@/components/intl-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AttachmentsGallery } from "@/components/complaints/AttachmentsGallery";
import { UpvoteButton } from "@/components/complaints/UpvoteButton";
import { ComplaintCommentsList } from "@/components/complaints/ComplaintCommentsList";
import { ArrowRight, Calendar, MapPin, Tag, AlertCircle, FileText, MessageSquare, ThumbsUp } from "lucide-react";

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
  investment: "استثمار",
  other: "أخرى",
};

const statusLabels: Record<string, string> = {
  new: "جديدة",
  under_review: "قيد المراجعة",
  assigned_to_deputy: "محالة للنائب",
  accepted: "مقبولة",
  in_progress: "قيد المعالجة",
  on_hold: "معلقة",
  rejected: "مرفوضة",
  resolved: "محلولة",
  closed: "مغلقة",
  archived: "مؤرشفة",
};

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 border-blue-200",
  under_review: "bg-yellow-100 text-yellow-800 border-yellow-200",
  assigned_to_deputy: "bg-purple-100 text-purple-800 border-purple-200",
  accepted: "bg-green-100 text-green-800 border-green-200",
  in_progress: "bg-orange-100 text-orange-800 border-orange-200",
  on_hold: "bg-gray-100 text-gray-800 border-gray-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  resolved: "bg-green-500 text-white border-green-600",
  closed: "bg-gray-500 text-white border-gray-600",
  archived: "bg-gray-400 text-white border-gray-500",
};

const priorityLabels: Record<string, string> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
  urgent: "عاجلة",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-700 border-gray-300",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
  high: "bg-orange-100 text-orange-700 border-orange-300",
  urgent: "bg-red-100 text-red-700 border-red-300",
};

export default async function PublicComplaintDetailPage({ params }: PageProps) {
  const { complaintId } = await params;
  
  // Fetch complaint data
  const { data: complaint, error } = await getPublicComplaintById(complaintId);

  if (error || !complaint) {
    notFound();
  }

  // Fetch additional data in parallel
  const [
    { data: attachments },
    { data: comments },
    hasVoted,
    votesCount
  ] = await Promise.all([
    getComplaintAttachments(complaintId),
    getComplaintComments(complaintId),
    hasUserVoted(complaintId),
    getComplaintVotesCount(complaintId)
  ]);

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl" dir="rtl">
      {/* Back Button */}
      <div className="mb-4">
        <Link href="/public-complaints">
          <Button variant="ghost" size="sm" className="gap-2 hover:bg-gray-100">
            <ArrowRight className="h-4 w-4" />
            العودة إلى قائمة الشكاوى
          </Button>
        </Link>
      </div>

      {/* Main Card */}
      <Card className="shadow-lg border-t-4 border-t-primary">
        {/* Header */}
        <CardHeader className="bg-gradient-to-b from-gray-50 to-white border-b">
          <div className="space-y-4">
            {/* Title, Status, and Upvote */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div className="flex gap-4 flex-1">
                {/* Upvote Button */}
                <div className="flex-shrink-0">
                  <UpvoteButton
                    complaintId={complaint.id}
                    initialVotesCount={votesCount}
                    initialHasVoted={hasVoted}
                    variant="default"
                  />
                </div>
                
                {/* Title */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex-1">
                  {complaint.title}
                </h1>
              </div>
              
              {/* Status Badge */}
              <Badge 
                variant="outline" 
                className={`text-sm px-4 py-2 font-medium border-2 ${statusColors[complaint.status] || 'bg-gray-100 text-gray-800'}`}
              >
                {statusLabels[complaint.status] || complaint.status}
              </Badge>
            </div>
            
            {/* Priority */}
            {complaint.priority && (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-gray-600" />
                <Badge 
                  variant="outline" 
                  className={`text-xs px-3 py-1 font-medium border ${priorityColors[complaint.priority] || 'bg-gray-100 text-gray-800'}`}
                >
                  الأولوية: {priorityLabels[complaint.priority] || complaint.priority}
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-900">
              <FileText className="h-5 w-5 text-primary" />
              وصف الشكوى
            </h2>
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-4">
                <p className="text-base leading-relaxed whitespace-pre-wrap text-gray-800">
                  {complaint.description}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Details Grid */}
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-900">التفاصيل</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <Card className="border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Tag className="h-4 w-4" />
                    <span className="text-sm font-medium">الفئة</span>
                  </div>
                  <p className="text-base font-semibold text-gray-900">
                    {categoryLabels[complaint.category] || complaint.category}
                  </p>
                </CardContent>
              </Card>

              {/* Governorate */}
              {complaint.governorate && (
                <Card className="border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm font-medium">المحافظة</span>
                    </div>
                    <p className="text-base font-semibold text-gray-900">{complaint.governorate}</p>
                  </CardContent>
                </Card>
              )}

              {/* District */}
              {complaint.district && (
                <Card className="border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm font-medium">المنطقة</span>
                    </div>
                    <p className="text-base font-semibold text-gray-900">{complaint.district}</p>
                  </CardContent>
                </Card>
              )}

              {/* Created Date */}
              <Card className="border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">تاريخ الإنشاء</span>
                  </div>
                  <p className="text-base font-semibold text-gray-900">
                    {new Date(complaint.created_at).toLocaleDateString("ar-EG", {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </CardContent>
              </Card>

              {/* Resolved Date */}
              {complaint.resolved_at && (complaint.status === 'resolved' || complaint.status === 'closed') && (
                <Card className="border-green-300 bg-green-50 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
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
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Attachments */}
          {attachments && attachments.length > 0 && (
            <div>
              <AttachmentsGallery attachments={attachments} />
            </div>
          )}

          {/* Comments Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
              <MessageSquare className="h-5 w-5 text-primary" />
              التعليقات ({comments?.length || 0})
            </h2>
            <ComplaintCommentsList comments={comments || []} />
          </div>

          {/* Info Notice */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <p className="text-sm text-blue-800">
                <strong>ملاحظة:</strong> هذه الشكوى متاحة للعرض العام بموافقة المواطن والإدارة. 
                يتم تحديث الحالة بشكل دوري حسب تقدم المعالجة.
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

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
