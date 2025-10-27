import { getDeputyComplaints } from "@/data/complaints/complaints";
import Link from "next/link";
import { getStatusLabel, getPriorityLabel, getPriorityColor } from "@/utils/complaint-labels";

export default async function DeputyComplaintsPage() {
  const { data: complaints, error } = await getDeputyComplaints();

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">الشكاوى المسندة لي</h1>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {complaints && complaints.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>لا توجد شكاوى مسندة لك حالياً</p>
        </div>
      )}

      <div className="grid gap-4">
        {complaints && complaints.map((complaint: any) => (
          <Link
            key={complaint.id}
            href={`/deputy-complaints/${complaint.id}`}
            className="block border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{complaint.title}</h3>
              <div className="flex gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-secondary">
                  {getStatusLabel(complaint.status)}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(complaint.priority)}`}>
                  {getPriorityLabel(complaint.priority)}
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {complaint.description}
            </p>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>الفئة: {complaint.category}</span>
              <span>{new Date(complaint.created_at).toLocaleDateString("ar-EG")}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

