"use client";

import { Button } from "@/components/ui/button";
import { promoteToManagerAction } from "@/data/admin/managers";
import { UserCog } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PromoteToManagerButtonProps {
  userId: string;
  userName: string;
}

export function PromoteToManagerButton({ userId, userName }: PromoteToManagerButtonProps) {
  const router = useRouter();
  
  const { execute, isExecuting } = useAction(promoteToManagerAction, {
    onSuccess: ({ data }) => {
      toast.success(data?.message || `تم ترقية ${userName} إلى مدير بنجاح`);
      router.refresh();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "حدث خطأ أثناء الترقية");
    },
  });

  const handlePromote = () => {
    if (confirm(`هل أنت متأكد من ترقية ${userName} إلى مدير؟\n\nسيتم منحه صلاحيات محددة يمكنك تخصيصها لاحقاً.`)) {
      execute({ userId });
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handlePromote}
      disabled={isExecuting}
      className="border-blue-500 text-blue-600 hover:bg-blue-50"
    >
      <UserCog className="h-4 w-4 mr-2" />
      {isExecuting ? "جاري الترقية..." : "ترقية إلى مدير"}
    </Button>
  );
}

