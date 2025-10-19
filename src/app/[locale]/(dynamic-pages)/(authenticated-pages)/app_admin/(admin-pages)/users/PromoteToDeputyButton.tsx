"use client";

import { Button } from "@/components/ui/button";
import { createDeputyAction } from "@/data/admin/deputies";
import { UserPlus } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PromoteToDeputyButtonProps {
  userId: string;
  userName: string;
}

export function PromoteToDeputyButton({ userId, userName }: PromoteToDeputyButtonProps) {
  const router = useRouter();
  
  const { execute, isExecuting } = useAction(createDeputyAction, {
    onSuccess: ({ data }) => {
      toast.success(data?.message || `تم ترقية ${userName} إلى نائب بنجاح`);
      router.refresh();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "حدث خطأ أثناء الترقية");
    },
  });

  const handlePromote = () => {
    if (confirm(`هل أنت متأكد من ترقية ${userName} إلى نائب؟`)) {
      execute({ userId, deputyStatus: "active" });
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handlePromote}
      disabled={isExecuting}
    >
      <UserPlus className="h-4 w-4 mr-2" />
      {isExecuting ? "جاري الترقية..." : "ترقية إلى نائب"}
    </Button>
  );
}

