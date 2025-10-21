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
import { Textarea } from "@/components/ui/textarea";
import { updateCouncilAction } from "@/data/admin/council";
import { useAction } from "next-safe-action/hooks";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Council } from "./types";

export function EditCouncilDialog({
  council,
  children,
}: {
  council: Council;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [nameAr, setNameAr] = useState(council.name_ar);
  const [nameEn, setNameEn] = useState(council.name_en || "");
  const [code, setCode] = useState(council.code);
  const [descriptionAr, setDescriptionAr] = useState(council.description_ar || "");
  const [descriptionEn, setDescriptionEn] = useState(council.description_en || "");
  const toastRef = useRef<string | number | undefined>(undefined);

  const { execute: updateCouncil, isPending } = useAction(updateCouncilAction, {
    onExecute: () => {
      toastRef.current = toast.loading("جاري التحديث...");
    },
    onSuccess: () => {
      toast.success("تم تحديث المجلس بنجاح!", {
        id: toastRef.current,
      });
      toastRef.current = undefined;
      setOpen(false);
      // Refresh the page to show updated list
      window.location.reload();
    },
    onError: ({ error }) => {
      const errorMessage = error.serverError ?? "فشل تحديث المجلس";
      toast.error(errorMessage, {
        id: toastRef.current,
      });
      toastRef.current = undefined;
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCouncil({
      id: council.id,
      name_ar: nameAr,
      name_en: nameEn,
      code: code,
      description_ar: descriptionAr || undefined,
      description_en: descriptionEn || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>تعديل بيانات المجلس</DialogTitle>
            <DialogDescription>
              قم بتعديل بيانات المجلس وحفظ التغييرات.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="edit_name_ar">الاسم بالعربية *</Label>
              <Input
                id="edit_name_ar"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="مثال: مجلس النواب"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_name_en">الاسم بالإنجليزية *</Label>
              <Input
                id="edit_name_en"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="Example: House of Representatives"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_code">الكود *</Label>
              <Input
                id="edit_code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="مثال: parliament"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_description_ar">الوصف بالعربية (اختياري)</Label>
              <Textarea
                id="edit_description_ar"
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
                placeholder="وصف المجلس بالعربية"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_description_en">الوصف بالإنجليزية (اختياري)</Label>
              <Textarea
                id="edit_description_en"
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                placeholder="Council description in English"
                rows={3}
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

