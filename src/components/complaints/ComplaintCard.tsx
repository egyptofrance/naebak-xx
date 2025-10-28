"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { archiveComplaint, deleteComplaint, forceComplaintPublic } from "@/data/complaints/complaints";
import { toast } from "sonner";
import { Archive, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { statusLabels, priorityLabels, categoryLabels } from "@/lib/translations";

interface ComplaintCardProps {
  complaint: any;
  userRole?: string;
}

export function ComplaintCard({ complaint, userRole }: ComplaintCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [publicLoading, setPublicLoading] = useState(false);

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    if (!confirm("هل أنت متأكد من أرشفة هذه الشكوى؟")) return;
    
    setLoading(true);
    try {
      const result = await archiveComplaint({ complaintId: complaint.id });
      
      if (result?.data?.success) {
        toast.success("تم أرشفة الشكوى بنجاح");
        router.refresh();
      } else {
        toast.error(result?.data?.error || "فشل أرشفة الشكوى");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء الأرشفة");
    } finally {
      setLoading(false);
    }
  };  const handleTogglePublic = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    const makePublic = !(complaint.is_public && complaint.admin_approved_public);
    setPublicLoading(true);
    try {
      const result = await forceComplaintPublic({ 
        complaintId: complaint.id, 
        makePublic 
      });
      
      if (result?.data?.success) {
        toast.success(makePublic ? "تم نشر الشكوى للعامة" : "تم إلغاء النشر العام");
        router.refresh();
      } else {
        toast.error(result?.data?.error || "فشل تحديث حالة النشر");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث حالة النشر");
    } finally {
      setPublicLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    if (!confirm("هل أنت متأكد من حذف هذه الشكوى نهائياً؟ لا يمكن التراجع عن هذا الإجراء!")) return;
    
    setLoading(true);
    try {
      const result = await deleteComplaint({ complaintId: complaint.id });
      
      if (result?.data?.success) {
        toast.success("تم حذف الشكوى نهائياً");
        router.refresh();
      } else {
        toast.error(result?.data?.error || "فشل حذف الشكوى");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء الحذف");
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = () => {
    router.push(`/manager-complaints/${complaint.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex gap-4">
        {/* Main content - takes most of the space */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-lg">{complaint.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                رقم الشكوى: {complaint.id.slice(0, 8)}
              </p>
              {complaint.user_profiles && (
                <p className="text-xs text-muted-foreground mt-1">
                  مقدم الشكوى: {complaint.user_profiles.full_name || complaint.user_profiles.email}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-secondary">
                {statusLabels[complaint.status] || complaint.status}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                complaint.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                complaint.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                complaint.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {priorityLabels[complaint.priority] || complaint.priority}
              </span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {complaint.description}
          </p>
          
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>الفئة: {categoryLabels[complaint.category] || complaint.category}</span>
            <span>
              {complaint.assigned_deputy_id ? '✓ مسندة' : '⚠ غير مسندة'}
            </span>
            <span>{new Date(complaint.created_at).toLocaleDateString("ar-EG")}</span>
          </div>
        </div>

        {/* Action buttons - on the right side, stacked vertically */}
        <div className="flex flex-col gap-2 justify-center">
          <Button
            variant="default"
            size="sm"
            onClick={handleTogglePublic}
            disabled={publicLoading}
            className={`min-w-[100px] ${
              complaint.is_public && complaint.admin_approved_public
                ? "bg-green-600 hover:bg-green-700"
                : "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            {complaint.is_public && complaint.admin_approved_public ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                إلغاء النشر
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                نشر عام
              </>
            )}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleArchive}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]"
          >
            <Archive className="h-4 w-4 mr-2" />
            أرشفة
          </Button>
          {userRole === 'admin' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={loading}
              className="min-w-[100px]"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              حذف
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

