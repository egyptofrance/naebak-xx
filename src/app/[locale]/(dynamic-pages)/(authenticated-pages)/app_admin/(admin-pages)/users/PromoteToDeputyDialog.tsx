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
import { createDeputyAction } from "@/data/admin/deputies";
import { UserPlus, Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface PromoteToDeputyDialogProps {
  userId: string;
  userName: string;
}

export function PromoteToDeputyDialog({ userId, userName }: PromoteToDeputyDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  
  const { execute, isExecuting } = useAction(createDeputyAction, {
    onSuccess: ({ data }) => {
      toast.success(data?.message || `تم ترقية ${userName} إلى نائب بنجاح`);
      setOpen(false);
      setTimeout(() => {
        router.refresh();
      }, 1000);
    },
    onError: ({ error }) => {
      console.error("Error promoting to deputy:", error);
      const errorMessage = error.serverError || "حدث خطأ أثناء الترقية";
      toast.error(errorMessage);
    },
  });

  const handlePromote = async () => {
    console.log("Promoting user to deputy:", { userId, userName });
    await execute({ userId, deputyStatus: "active" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          type="button"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          ترقية إلى نائب
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>تأكيد الترقية إلى نائب</DialogTitle>
          <DialogDescription>
            هل أنت متأكد من ترقية <strong>{userName}</strong> إلى نائب؟
            <br />
            سيتم إنشاء ملف نائب جديد لهذا المستخدم.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
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
            onClick={handlePromote}
            disabled={isExecuting}
          >
            {isExecuting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                جاري الترقية...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                تأكيد الترقية
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

