import { getComplaintDetails, getAvailableDeputies } from "@/data/complaints/complaints";
import { AssignDeputyForm } from "@/components/complaints/AssignDeputyForm";
import { UpdateStatusForm } from "@/components/complaints/UpdateStatusForm";
import { UpdatePriorityForm } from "@/components/complaints/UpdatePriorityForm";
import { AddCommentForm } from "@/components/complaints/AddCommentForm";
import { ComplaintActionsHistory } from "@/components/complaints/ComplaintActionsHistory";
import Link from "next/link";
import { serverGetLoggedInUser } from "@/utils/server/serverGetLoggedInUser";

interface Props {
  params: Promise<{ complaintId: string }>;
}

export default async function ManagerComplaintDetailPage({ params }: Props) {
  const { complaintId } = await params;
  
  const user = await serverGetLoggedInUser();
  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          يجب تسجيل الدخول
        </div>
      </div>
    );
  }
  
  const { data, error } = await getComplaintDetails(complaintId);
  const { data: deputies } = await getAvailableDeputies();

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
        <Link href="/manager-complaints" className="text-sm text-primary hover:underline">
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

              {complaint.address && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-1">العنوان</p>
                  <p className="font-medium">{complaint.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions History */}
          <ComplaintActionsHistory actions={actions} />

          {/* Add Comment */}
          <AddCommentForm complaintId={complaint.id} userId={user.id} />
        </div>

        {/* Sidebar - Management Actions */}
        <div className="space-y-6">
          {/* Assign Deputy */}
          <AssignDeputyForm
            complaintId={complaint.id}
            currentDeputyId={complaint.assigned_deputy_id}
            deputies={deputies || []}
            userId={user.id}
          />

          {/* Update Status */}
          <UpdateStatusForm
            complaintId={complaint.id}
            currentStatus={complaint.status}
            userId={user.id}
          />

          {/* Update Priority */}
          <UpdatePriorityForm
            complaintId={complaint.id}
            currentPriority={complaint.priority}
            userId={user.id}
          />
        </div>
      </div>
    </div>
  );
}
