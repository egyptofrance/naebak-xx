import { getArchivedComplaints } from "@/data/complaints/complaints";
import { ArchivedComplaintCard } from "@/components/complaints/ArchivedComplaintCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ArchivedComplaintsPage() {
  const { data: complaints, error } = await getArchivedComplaints();

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href="/manager-complaints"
          className="text-primary hover:underline flex items-center gap-2"
        >
          <ArrowRight className="h-4 w-4" />
          العودة إلى الشكاوى
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">أرشيف الشكاوى</h1>
          <p className="text-sm text-muted-foreground mt-1">
            إجمالي الشكاوى المؤرشفة: {complaints?.length || 0}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {complaints && complaints.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>لا توجد شكاوى مؤرشفة</p>
        </div>
      )}

      <div className="grid gap-4">
        {complaints && complaints.map((complaint: any) => (
          <ArchivedComplaintCard key={complaint.id} complaint={complaint} />
        ))}
      </div>
    </div>
  );
}

