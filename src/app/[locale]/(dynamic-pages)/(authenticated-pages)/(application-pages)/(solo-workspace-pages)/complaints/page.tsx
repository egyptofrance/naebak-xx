import { getMyComplaints } from "@/data/complaints/complaints";
import Link from "next/link";

export default async function ComplaintsPage() {
  const { data: complaints, error } = await getMyComplaints();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">شكاواي</h1>
        <Link
          href="/complaints/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          إضافة شكوى جديدة
        </Link>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {complaints && complaints.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>لا توجد شكاوى حالياً</p>
          <p className="text-sm mt-2">ابدأ بإضافة شكوى جديدة</p>
        </div>
      )}

      <div className="grid gap-4">
        {complaints && complaints.map((complaint: any) => (
          <div
            key={complaint.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{complaint.title}</h3>
              <span className="text-xs px-2 py-1 rounded-full bg-secondary">
                {complaint.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {complaint.description}
            </p>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>الفئة: {complaint.category}</span>
              <span>الأولوية: {complaint.priority}</span>
              <span>{new Date(complaint.created_at).toLocaleDateString("ar-EG")}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

