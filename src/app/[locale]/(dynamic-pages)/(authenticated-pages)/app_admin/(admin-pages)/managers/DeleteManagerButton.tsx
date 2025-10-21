"use client";

import { Button } from "@/components/ui/button";
import { deleteManagerAction } from "@/data/admin/managers";
import { Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function DeleteManagerButton({
  userId,
  managerName,
}: {
  userId: string;
  managerName: string;
}) {
  const router = useRouter();
  const { execute, isExecuting } = useAction(deleteManagerAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(data.message || "تم حذف المدير بنجاح");
        router.refresh();
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "فشل حذف المدير");
    },
  });

  const handleDelete = () => {
    if (
      confirm(
        `هل أنت متأكد من حذف المدير "${managerName}"؟ سيتم حذف جميع بياناته نهائياً.`
      )
    ) {
      execute({ userId });
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={isExecuting}
      className="text-destructive hover:text-destructive"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}

