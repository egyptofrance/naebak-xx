"use client";

import { useState } from "react";
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
import { Trash2 } from "lucide-react";
import { deleteBreakingNewsAction } from "@/data/admin/breaking-news";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

interface DeleteNewsDialogProps {
  newsId: string;
  newsContent: string;
}

export function DeleteNewsDialog({ newsId, newsContent }: DeleteNewsDialogProps) {
  const [open, setOpen] = useState(false);

  const { execute, isExecuting } = useAction(deleteBreakingNewsAction, {
    onSuccess: () => {
      toast.success("تم حذف الخبر بنجاح");
      setOpen(false);
      window.location.reload();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "حدث خطأ أثناء حذف الخبر");
    },
  });

  const handleDelete = () => {
    execute({ id: newsId });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="حذف">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="space-y-3">
          <div className="mx-auto p-3 w-fit bg-destructive/10 rounded-lg">
            <Trash2 className="w-6 h-6 text-destructive" />
          </div>
          <div className="text-center space-y-2">
            <DialogTitle>حذف الخبر العاجل</DialogTitle>
            <DialogDescription className="text-base">
              هل أنت متأكد من حذف هذا الخبر؟
              <br />
              <strong className="text-foreground">{newsContent}</strong>
              <br />
              لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isExecuting}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isExecuting}
          >
            {isExecuting ? "جاري الحذف..." : "حذف"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
