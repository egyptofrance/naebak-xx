import { getComplaintDetails } from "@/data/complaints/complaints";
import Link from "next/link";
import { UpdateStatusForm } from "@/components/complaints/UpdateStatusForm";
import { AddCommentForm } from "@/components/complaints/AddCommentForm";
import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";

export default async function DeputyComplaintDetailsPage({
  params,
}: {
  params: Promise<{ complaintId: string }>;
}) {
  const { complaintId } = await params;
  const supabase = await createSupabaseUserServerComponentClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          يجب تسجيل الدخول لعرض هذه الصفحة
        </div>
      </div>
    );
  }

  const { data, error } = await getComplaintDetails(complaintId);

  if (error || !data) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error || "فشل تحميل بيانات الشكوى"}
        </div>
      </div>
    );
  }

  const { complaint, actions } = data;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/deputy-complaints" className="text-sm text-primary hover:underline">
          ← العودة إلى قائمة الشكاوى
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Complaint Details */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">{complaint.title}</h1>
                <p className="text-sm text-muted-foreground">
                  رقم الشكوى: {complaint.id.slice(0, 8)}
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-xs px-3 py-1 rounded-full bg-secondary">
                  {complaint.status}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full ${
                  complaint.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                  complaint.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  complaint.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {complaint.priority}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">الوصف</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {complaint.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">الفئة</p>
                  <p className="font-medium">{complaint.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">المحافظة</p>
                  <p className="font-medium">{complaint.governorate || "غير محدد"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">المنطقة</p>
                  <p className="font-medium">{complaint.district || "غير محدد"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ الإنشاء</p>
                  <p className="font-medium">
                    {new Date(complaint.created_at).toLocaleDateString("ar-EG")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions History */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold mb-4">سجل الإجراءات</h3>
            {actions && actions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                لا توجد إجراءات مسجلة بعد
              </p>
            ) : (
              <div className="space-y-3">
                {actions && actions.map((action: any) => (
                  <div
                    key={action.id}
                    className="border-l-2 border-primary/20 pl-4 py-2"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium">{action.action_type}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(action.created_at).toLocaleString("ar-EG")}
                      </span>
                    </div>
                    {action.comment && (
                      <p className="text-sm text-muted-foreground">{action.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Comment */}
          <AddCommentForm complaintId={complaint.id} userId={user.id} />
        </div>

        {/* Sidebar - Deputy Actions */}
        <div className="space-y-6">
          {/* Update Status */}
          <UpdateStatusForm
            complaintId={complaint.id}
            currentStatus={complaint.status}
            userId={user.id}
          />
        </div>
      </div>
    </div>
  );
}

