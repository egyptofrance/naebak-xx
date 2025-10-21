"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { demoteManagerAction } from "@/data/admin/managers";
import { UserMinus } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRef, useState } from "react";
import { toast } from "sonner";

type DemoteManagerButtonProps = {
  userId: string;
  managerName: string;
};

export function DemoteManagerButton({
  userId,
  managerName,
}: DemoteManagerButtonProps) {
  const [open, setOpen] = useState(false);
  const toastRef = useRef<string | number | undefined>(undefined);

  const { execute: demoteManager, isPending } = useAction(demoteManagerAction, {
    onExecute: () => {
      toastRef.current = toast.loading("جاري إزالة المدير...");
    },
    onSuccess: ({ data }) => {
      toast.success(data?.message ?? "تم إزالة المدير بنجاح!", {
        id: toastRef.current,
      });
      toastRef.current = undefined;
      setOpen(false);
      // Refresh the page to show updated list
      window.location.reload();
    },
    onError: ({ error }) => {
      const errorMessage = error.serverError ?? "فشل إزالة المدير";
      toast.error(errorMessage, {
        id: toastRef.current,
      });
      toastRef.current = undefined;
    },
  });

  const handleDemote = () => {
    demoteManager({ userId });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <UserMinus className="w-4 h-4 text-destructive" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="space-y-3">
          <div className="mx-auto p-3 w-fit bg-destructive/10 rounded-lg">
            <UserMinus className="w-6 h-6 text-destructive" />
          </div>
          <div className="text-center space-y-2">
            <DialogTitle className="text-lg">إزالة المدير</DialogTitle>
            <DialogDescription className="text-base">
              هل أنت متأكد من إزالة <strong>{managerName}</strong> من قائمة المديرين؟
              <br />
              <br />
              سيتم:
              <ul className="list-disc list-inside text-right mt-2">
                <li>إزالة دور المدير</li>
                <li>حذف صلاحيات المدير</li>
                <li>إعادته إلى قائمة المواطنين</li>
              </ul>
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 min-w-[120px]"
            disabled={isPending}
            onClick={() => setOpen(false)}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="flex-1 min-w-[120px]"
            disabled={isPending}
            onClick={handleDemote}
          >
            {isPending ? "جاري الإزالة..." : "إزالة المدير"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

