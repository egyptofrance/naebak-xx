"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { closeComplaint } from "@/data/complaints/complaints";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CloseComplaintButtonProps {
  complaintId: string;
  status: string;
  hasAssignedDeputy: boolean;
}

export function CloseComplaintButton({ 
  complaintId, 
  status,
  hasAssignedDeputy 
}: CloseComplaintButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Only show for resolved complaints with assigned deputy
  if (status !== "resolved" || !hasAssignedDeputy) {
    return null;
  }

  const handleClose = async () => {
    if (!confirm("هل أنت متأكد من إغلاق هذه الشكوى؟\n\nسيتم منح النائب 10 نقاط عند الإغلاق.")) {
      return;
    }

    setLoading(true);
    try {
      const result = await closeComplaint({ complaintId });
      
      if (result?.data?.success) {
        toast.success(result.data.message || "تم إغلاق الشكوى ومنح النائب 10 نقاط");
        if (result.data.warning) {
          toast.warning(result.data.warning);
        }
        router.refresh();
      } else {
        toast.error(result?.data?.error || "فشل إغلاق الشكوى");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء إغلاق الشكوى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm">إغلاق الشكوى</h3>
      <p className="text-xs text-muted-foreground mb-3">
        الشكوى في حالة "محلولة". راجع الحل وإذا كان مرضياً، أغلق الشكوى لمنح النائب 10 نقاط.
      </p>
      <Button
        onClick={handleClose}
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        <CheckCircle2 className="h-4 w-4 mr-2" />
        {loading ? "جاري الإغلاق..." : "إغلاق الشكوى ومنح النقاط"}
      </Button>
    </div>
  );
}

