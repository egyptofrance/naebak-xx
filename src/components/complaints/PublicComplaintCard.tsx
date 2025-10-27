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

  // استخدام صيغ المواطن
  const statusLabels: Record<string, string> = {
    new: "تم استلام شكواك",
    accepted: "تم قبول شكواك",
    pending_review: "شكواك قيد الدراسة",
    rejected: "تم رفض شكواك",
    in_progress: "يتم العمل على حل شكواك",
    resolved: "تم حل شكواك",
    unable_to_resolve: "لم يتمكن النائب من حل شكواك",
  };

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-800",
    accepted: "bg-green-100 text-green-800",
    pending_review: "bg-yellow-100 text-yellow-800",
    rejected: "bg-red-100 text-red-800",
    in_progress: "bg-orange-100 text-orange-800",
    resolved: "bg-emerald-100 text-emerald-800",
    unable_to_resolve: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-card">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg flex-1">{complaint.title}</h3>
        <span className={`text-xs px-3 py-1 rounded-full ${statusColors[complaint.status] || 'bg-gray-100 text-gray-800'}`}>
          {statusLabels[complaint.status] || complaint.status}
        </span>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
        {complaint.description}
      </p>
      
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="font-medium">الفئة:</span>
          <span>{categoryLabels[complaint.category] || complaint.category}</span>
        </div>
        
        {complaint.governorate && (
          <div className="flex items-center gap-1">
            <span className="font-medium">المحافظة:</span>
            <span>{complaint.governorate}</span>
          </div>
        )}
        
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
        
        {complaint.resolved_at && (
          <div className="flex items-center gap-1">
            <span className="font-medium">تاريخ الحل:</span>
            <span>{new Date(complaint.resolved_at).toLocaleDateString("ar-EG")}</span>
          </div>
        )}
      </div>
    </div>
  );
}

