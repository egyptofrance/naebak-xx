"use client";

import { Button } from "@/components/ui/button";
import { reorderAllCouncilsAction } from "@/data/admin/council";
import { ArrowUpDown } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRef } from "react";
import { toast } from "sonner";

export function ReorderCouncilsButton() {
  const toastRef = useRef<string | number | undefined>(undefined);

  const { execute: reorder, isPending } = useAction(reorderAllCouncilsAction, {
    onExecute: () => {
      toastRef.current = toast.loading("جاري إعادة الترتيب...");
    },
    onSuccess: () => {
      toast.success("تم إعادة ترتيب جميع المجالس بنجاح!", {
        id: toastRef.current,
      });
      toastRef.current = undefined;
      // Refresh the page
      window.location.reload();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "حدث خطأ أثناء إعادة الترتيب", {
        id: toastRef.current,
      });
      toastRef.current = undefined;
    },
  });

  return (
    <Button
      variant="outline"
      onClick={() => reorder({})}
      disabled={isPending}
    >
      <ArrowUpDown className="w-4 h-4 mr-2" />
      إعادة ترتيب الكل
    </Button>
  );
}

