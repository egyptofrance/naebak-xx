"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { unarchiveComplaint, deleteComplaint } from "@/data/complaints/complaints";
import { toast } from "sonner";
import { ArchiveRestore, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ArchivedComplaintCardProps {
  complaint: any;
}

export function ArchivedComplaintCard({ complaint }: ArchivedComplaintCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUnarchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("هل تريد استعادة هذه الشكوى من الأرشيف؟")) return;
    
    setLoading(true);
    try {
      const result = await unarchiveComplaint({ complaintId: complaint.id });
      
      if (result?.data?.success) {
        toast.success("تم استعادة الشكوى من الأرشيف");
        router.refresh();
      } else {
        toast.error(result?.data?.error || "فشل استعادة الشكوى");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء الاستعادة");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
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
      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-muted/30"
    >
      <div className="flex gap-4">
        {/* Main content */}
        <div className="flex-1">
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
            <span>
              أُرشفت: {complaint.archived_at ? new Date(complaint.archived_at).toLocaleDateString("ar-EG") : "غير محدد"}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 justify-center">
          <Button
            variant="default"
            size="sm"
            onClick={handleUnarchive}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white min-w-[100px]"
          >
            <ArchiveRestore className="h-4 w-4 mr-2" />
            استعادة
          </Button>
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
        </div>
      </div>
    </div>
  );
}

