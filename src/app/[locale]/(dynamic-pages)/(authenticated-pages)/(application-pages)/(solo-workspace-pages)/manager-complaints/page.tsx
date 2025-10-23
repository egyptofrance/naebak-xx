import { getAllComplaints } from "@/data/complaints/complaints";
import { RefreshComplaintsButton } from "@/components/complaints/RefreshComplaintsButton";
import { ComplaintCard } from "@/components/complaints/ComplaintCard";
import Link from "next/link";
import { Archive } from "lucide-react";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ManagerComplaintsPage() {
  const { data: allComplaints, error } = await getAllComplaints();
  
  // Filter out archived complaints
  const complaints = allComplaints?.filter(c => !c.is_archived) || [];

  // Count complaints by status
  const statusCounts = complaints?.reduce((acc: any, complaint: any) => {
    acc[complaint.status] = (acc[complaint.status] || 0) + 1;
    return acc;
  }, {}) || {};

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">إدارة الشكاوى</h1>
        <div className="flex gap-3">
          <Link
            href="/manager-complaints/archived"
            className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-secondary text-sm"
          >
            <Archive className="h-4 w-4" />
            الأرشيف
          </Link>
          <RefreshComplaintsButton />
        </div>
      </div>

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
          <ComplaintCard key={complaint.id} complaint={complaint} />
        ))}
      </div>
    </div>
  );
}

