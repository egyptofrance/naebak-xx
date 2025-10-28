"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, AlertTriangle, Check, X } from "lucide-react";
import { forceComplaintPublic } from "@/data/complaints/complaints";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PublicDisplayManagerProps {
  complaintId: string;
  isPublic: boolean;
  adminApprovedPublic: boolean;
}

export function PublicDisplayManager({ 
  complaintId, 
  isPublic,
  adminApprovedPublic
}: PublicDisplayManagerProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleTogglePublic = async (makePublic: boolean) => {
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

  // Determine current state
  const isCurrentlyPublic = isPublic && adminApprovedPublic;
  const citizenRequested = isPublic;

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">عرض الشكوى على العامة</h3>
        {isCurrentlyPublic && (
          <div className="flex items-center text-sm text-green-600 bg-green-50 dark:bg-green-950/20 px-3 py-1 rounded-full">
            <Eye className="h-4 w-4 ml-2" />
            منشورة للعامة
          </div>
        )}
      </div>

      {/* Status Information */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">طلب المواطن:</span>
          {citizenRequested ? (
            <span className="flex items-center text-green-600">
              <Check className="h-4 w-4 ml-1" />
              طلب النشر للعامة
            </span>
          ) : (
            <span className="flex items-center text-amber-600">
              <AlertTriangle className="h-4 w-4 ml-1" />
              لم يطلب النشر
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">موافقة الإدارة:</span>
          {adminApprovedPublic ? (
            <span className="flex items-center text-green-600">
              <Check className="h-4 w-4 ml-1" />
              تمت الموافقة
            </span>
          ) : (
            <span className="flex items-center text-gray-600">
              <X className="h-4 w-4 ml-1" />
              لم تتم الموافقة
            </span>
          )}
        </div>
      </div>

      {/* Warning if citizen didn't request */}
      {!citizenRequested && !isCurrentlyPublic && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <div className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium">تنويه هام</div>
              <div className="text-xs mt-1">
                المواطن لم يطلب نشر هذه الشكوى للعامة. يمكنك نشرها بقرار إداري إذا رأيت ذلك مناسباً.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {isCurrentlyPublic ? (
          <Button
            variant="outline"
            onClick={() => handleTogglePublic(false)}
            disabled={loading}
            className="flex-1 text-destructive hover:text-destructive"
          >
            <EyeOff className="h-4 w-4 ml-2" />
            إلغاء النشر العام
          </Button>
        ) : (
          <Button
            variant="default"
            onClick={() => handleTogglePublic(true)}
            disabled={loading}
            className={`flex-1 ${
              !citizenRequested 
                ? "bg-amber-600 hover:bg-amber-700" 
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            <Eye className="h-4 w-4 ml-2" />
            {citizenRequested ? "الموافقة على النشر" : "نشر إداري للشكوى"}
          </Button>
        )}
      </div>

      {/* Help Text */}
      <div className="text-xs text-muted-foreground">
        {isCurrentlyPublic 
          ? "الشكوى معروضة حالياً في صفحة الشكاوى العامة"
          : citizenRequested
          ? "المواطن طلب عرض الشكوى للعامة وينتظر موافقتك"
          : "يمكنك نشر الشكوى للعامة حتى بدون طلب من المواطن"
        }
      </div>
    </div>
  );
}
