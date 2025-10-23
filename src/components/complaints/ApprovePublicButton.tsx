"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Eye, EyeOff } from "lucide-react";
import { approveComplaintForPublic } from "@/data/complaints/complaints";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ApprovePublicButtonProps {
  complaintId: string;
  isPublic: boolean;
  adminApprovedPublic: boolean;
}

export function ApprovePublicButton({ 
  complaintId, 
  isPublic, 
  adminApprovedPublic 
}: ApprovePublicButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleApprove = async (approved: boolean) => {
    setLoading(true);
    try {
      const result = await approveComplaintForPublic({ complaintId, approved });
      
      if (result?.data?.success) {
        toast.success(approved ? "تم الموافقة على عرض الشكوى للعامة" : "تم إلغاء الموافقة");
        router.refresh();
      } else {
        toast.error(result?.data?.error || "فشل تحديث الموافقة");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث الموافقة");
    } finally {
      setLoading(false);
    }
  };

  // If complaint is not marked as public by citizen, don't show button
  if (!isPublic) {
    return (
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <EyeOff className="h-4 w-4" />
        الشاكي لم يطلب عرض الشكوى على العامة
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">عرض الشكوى على العامة</div>
      <div className="flex gap-2 items-center">
        {adminApprovedPublic ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleApprove(false)}
              disabled={loading}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4 mr-2" />
              إلغاء الموافقة
            </Button>
            <div className="flex items-center text-sm text-green-600">
              <Eye className="h-4 w-4 mr-2" />
              معروضة للعامة
            </div>
          </>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={() => handleApprove(true)}
            disabled={loading}
          >
            <Check className="h-4 w-4 mr-2" />
            الموافقة على العرض للعامة
          </Button>
        )}
      </div>
      <div className="text-xs text-muted-foreground">
        الشاكي طلب عرض الشكوى على العامة
      </div>
    </div>
  );
}

