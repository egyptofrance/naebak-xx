import { Link } from "@/components/intl-link";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { truncateText } from "@/lib/textUtils";

interface PublicComplaintCardProps {
  complaint: {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    governorate: string | null;
    district: string | null;
    created_at: string;
    resolved_at: string | null;
  };
}

export function PublicComplaintCard({ complaint }: PublicComplaintCardProps) {
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
    new: "bg-blue-100 text-blue-800",
    under_review: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-orange-100 text-orange-800",
    resolved: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-800",
  };

  return (
    <article 
      className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-card" 
      dir="rtl"
      aria-label={`شكوى: ${complaint.title}`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg flex-1" id={`complaint-title-${complaint.id}`}>{complaint.title}</h3>
        <span 
          className={`text-xs px-3 py-1 rounded-full ${statusColors[complaint.status] || 'bg-gray-100 text-gray-800'}`}
          role="status"
          aria-label={`حالة الشكوى: ${statusLabels[complaint.status] || complaint.status}`}
        >
          {statusLabels[complaint.status] || complaint.status}
        </span>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        {truncateText(complaint.description, 150)}
      </p>
      
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="font-medium">الفئة:</span>
          <span>{categoryLabels[complaint.category] || complaint.category}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <span className="font-medium">المحافظة:</span>
          <span className="flex items-center gap-1">
            {complaint.governorate ? (
              complaint.governorate
            ) : (
              <>
                <span>🌍</span>
                <span className="font-medium text-primary">شكوى عامة</span>
              </>
            )}
          </span>
        </div>
        
        {complaint.district && (
          <div className="flex items-center gap-1">
            <span className="font-medium">المنطقة:</span>
            <span>{complaint.district}</span>
          </div>
        )}
        
        <div className="flex items-center gap-1">
          <span className="font-medium">تاريخ الإنشاء:</span>
          <span>{new Date(complaint.created_at).toLocaleDateString("ar-EG")}</span>
        </div>
        
        {complaint.resolved_at && (complaint.status === 'resolved' || complaint.status === 'closed') && (
          <div className="flex items-center gap-1">
            <span className="font-medium">تاريخ الحل:</span>
            <span>{new Date(complaint.resolved_at).toLocaleDateString("ar-EG")}</span>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t flex justify-end">
        <Link href={`/public-complaints/${complaint.id}`}>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            aria-label={`عرض تفاصيل الشكوى: ${complaint.title}`}
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            عرض التفاصيل
          </Button>
        </Link>
      </div>
    </article>
  );
}

