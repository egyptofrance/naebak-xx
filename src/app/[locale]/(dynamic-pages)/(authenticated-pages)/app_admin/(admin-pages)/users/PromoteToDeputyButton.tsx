"use client";

import { Button } from "@/components/ui/button";
import { createDeputyAction } from "@/data/admin/deputies";
import { UserPlus, Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface PromoteToDeputyButtonProps {
  userId: string;
  userName: string;
}

export function PromoteToDeputyButton({ userId, userName }: PromoteToDeputyButtonProps) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  
  const { execute, isExecuting } = useAction(createDeputyAction, {
    onSuccess: ({ data }) => {
      toast.success(data?.message || `تم ترقية ${userName} إلى نائب بنجاح`);
      setTimeout(() => {
        router.refresh();
      }, 1000);
    },
    onError: ({ error }) => {
      console.error("Error promoting to deputy:", error);
      toast.error(error.serverError || "حدث خطأ أثناء الترقية");
    },
  });

  const handlePromote = async () => {
    try {
      setIsConfirming(true);
      const confirmed = window.confirm(`هل أنت متأكد من ترقية ${userName} إلى نائب؟`);
      
      if (confirmed) {
        console.log("Promoting user to deputy:", userId);
        await execute({ userId, deputyStatus: "active" });
      }
    } catch (error) {
      console.error("Error in handlePromote:", error);
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handlePromote}
      disabled={isExecuting || isConfirming}
      type="button"
    >
      {isExecuting || isConfirming ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          جاري الترقية...
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          ترقية إلى نائب
        </>
      )}
    </Button>
  );
}

