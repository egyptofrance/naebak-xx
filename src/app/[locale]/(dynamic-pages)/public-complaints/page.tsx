import { getPublicComplaints } from "@/data/complaints/complaints";
import { PublicComplaintCard } from "@/components/complaints/PublicComplaintCard";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PublicComplaintsPage() {
  const { data: complaints, error } = await getPublicComplaints();

  // Count by status
  const statusCounts = complaints?.reduce((acc: any, complaint: any) => {
    acc[complaint.status] = (acc[complaint.status] || 0) + 1;
    return acc;
  }, {}) || {};

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">الشكاوى العامة</h1>
        <p className="text-muted-foreground">
          شكاوى المواطنين التي تم الموافقة على نشرها للعامة من قبل الإدارة
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">إجمالي الشكاوى</p>
          <p className="text-2xl font-bold">{complaints?.length || 0}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">جديدة</p>
          <p className="text-2xl font-bold text-blue-600">{statusCounts.new || 0}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">قيد المراجعة</p>
          <p className="text-2xl font-bold text-yellow-600">{statusCounts.under_review || 0}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">قيد المعالجة</p>
          <p className="text-2xl font-bold text-orange-600">{statusCounts.in_progress || 0}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">محلولة</p>
          <p className="text-2xl font-bold text-green-600">{statusCounts.resolved || 0}</p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {complaints && complaints.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">لا توجد شكاوى عامة حالياً</p>
          <p className="text-sm mt-2">
            الشكاوى التي يوافق عليها المواطن والإدارة للنشر ستظهر هنا
          </p>
        </div>
      )}

      <div className="grid gap-4">
        {complaints && complaints.map((complaint: any) => (
          <PublicComplaintCard key={complaint.id} complaint={complaint} />
        ))}
      </div>
    </div>
  );
}
