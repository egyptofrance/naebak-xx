"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";
import { forceComplaintPublic } from "@/data/complaints/complaints";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ForcePublicButtonProps {
  complaintId: string;
  isPublic: boolean;
  adminApprovedPublic: boolean;
  citizenRequestedPublic: boolean;
}

export function ForcePublicButton({ 
  complaintId, 
  isPublic,
  adminApprovedPublic,
  citizenRequestedPublic
}: ForcePublicButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleForcePublic = async (makePublic: boolean) => {
    setLoading(true);
    try {
      const result = await forceComplaintPublic({ complaintId, makePublic });
      
      if (result?.data?.success) {
        toast.success(makePublic ? "تم نشر الشكوى للعامة" : "تم إلغاء النشر العام");
        router.refresh();
      } else {
        toast.error(result?.data?.error || "فشل تحديث حالة النشر");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث حالة النشر");
    } finally {
      setLoading(false);
    }
  };

  // Show appropriate UI based on current state
  const isCurrentlyPublic = isPublic && adminApprovedPublic;

  return (
    <div className="space-y-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
      <div className="text-sm font-medium flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        نشر إداري للشكوى
      </div>
      
      <div className="flex gap-2 items-center">
        {isCurrentlyPublic ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleForcePublic(false)}
              disabled={loading}
              className="text-destructive hover:text-destructive"
            >
              <EyeOff className="h-4 w-4 mr-2" />
              إلغاء النشر العام
            </Button>
            <div className="flex items-center text-sm text-green-600">
              <Eye className="h-4 w-4 mr-2" />
              منشورة للعامة
            </div>
          </>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={() => handleForcePublic(true)}
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <Eye className="h-4 w-4 mr-2" />
            نشر للعامة (إداري)
          </Button>
        )}
      </div>
      
      {!citizenRequestedPublic && (
        <div className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          تنويه: المواطن لم يطلب نشر هذه الشكوى للعامة
        </div>
      )}
      
      <div className="text-xs text-muted-foreground">
        يمكنك نشر الشكوى للعامة حتى لو لم يطلب المواطن ذلك
      </div>
    </div>
  );
}
