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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUserProfileAction } from "@/data/admin/user";
import { Edit } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRef, useState } from "react";
import { toast } from "sonner";

type EditUserDialogProps = {
  userId: string;
  currentFullName: string | null;
  currentPhone: string | null;
};

export function EditUserDialog({
  userId,
  currentFullName,
  currentPhone,
}: EditUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState(currentFullName || "");
  const [phone, setPhone] = useState(currentPhone || "");
  const toastRef = useRef<string | number | undefined>(undefined);

  const { execute: updateUser, isPending } = useAction(updateUserProfileAction, {
    onExecute: () => {
      toastRef.current = toast.loading("جاري تحديث البيانات...");
    },
    onSuccess: () => {
      toast.success("تم تحديث بيانات المستخدم بنجاح!", {
        id: toastRef.current,
      });
      toastRef.current = undefined;
      setOpen(false);
      // Refresh the page to show updated data
      window.location.reload();
    },
    onError: ({ error }) => {
      const errorMessage = error.serverError ?? "فشل تحديث البيانات";
      toast.error(errorMessage, {
        id: toastRef.current,
      });
      toastRef.current = undefined;
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      userId,
      fullName: fullName.trim() || null,
      phone: phone.trim() || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="تعديل">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>تعديل بيانات المستخدم</DialogTitle>
            <DialogDescription>
              قم بتعديل الاسم الكامل ورقم الهاتف للمستخدم.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">الاسم الكامل</Label>
              <Input
                id="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="أدخل الاسم الكامل"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="أدخل رقم الهاتف"
                dir="ltr"
              />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 min-w-[120px]"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              className="flex-1 min-w-[120px]"
              disabled={isPending}
            >
              {isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

