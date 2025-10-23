import { getAllComplaints } from "@/data/complaints/complaints";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ManagerComplaintsPage() {
  const { data: complaints, error } = await getAllComplaints();

  // Count complaints by status
  const statusCounts = complaints?.reduce((acc: any, complaint: any) => {
    acc[complaint.status] = (acc[complaint.status] || 0) + 1;
    return acc;
  }, {}) || {};

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">إدارة الشكاوى</h1>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">إجمالي الشكاوى</p>
          <p className="text-2xl font-bold">{complaints?.length || 0}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">جديدة</p>
          <p className="text-2xl font-bold">{statusCounts.new || 0}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">قيد المعالجة</p>
          <p className="text-2xl font-bold">{statusCounts.in_progress || 0}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">تم الحل</p>
          <p className="text-2xl font-bold">{statusCounts.resolved || 0}</p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {complaints && complaints.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>لا توجد شكاوى حالياً</p>
        </div>
      )}

      <div className="grid gap-4">
        {complaints && complaints.map((complaint: any) => (
          <div
            key={complaint.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-lg">{complaint.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  رقم الشكوى: {complaint.id.slice(0, 8)}
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-secondary">
                  {complaint.status}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  complaint.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                  complaint.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  complaint.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {complaint.priority}
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {complaint.description}
            </p>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>الفئة: {complaint.category}</span>
              <span>
                {complaint.assigned_deputy_id ? '✓ مسندة' : '⚠ غير مسندة'}
              </span>
              <span>{new Date(complaint.created_at).toLocaleDateString("ar-EG")}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

