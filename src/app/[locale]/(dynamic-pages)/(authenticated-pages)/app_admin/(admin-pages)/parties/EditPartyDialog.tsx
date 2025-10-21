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
import { updatePartyAction } from "@/data/admin/party";
import { useAction } from "next-safe-action/hooks";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Party } from "./types";

export function EditPartyDialog({
  party,
  children,
}: {
  party: Party;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [nameAr, setNameAr] = useState(party.name_ar);
  const [nameEn, setNameEn] = useState(party.name_en || "");
  const [abbreviation, setAbbreviation] = useState(party.abbreviation || "");
  const toastRef = useRef<string | number | undefined>(undefined);

  const { execute: updateParty, isPending } = useAction(updatePartyAction, {
    onExecute: () => {
      toastRef.current = toast.loading("جاري التحديث...");
    },
    onSuccess: () => {
      toast.success("تم تحديث الحزب بنجاح!", {
        id: toastRef.current,
      });
      toastRef.current = undefined;
      setOpen(false);
      // Refresh the page to show updated list
      window.location.reload();
    },
    onError: ({ error }) => {
      const errorMessage = error.serverError ?? "فشل تحديث الحزب";
      toast.error(errorMessage, {
        id: toastRef.current,
      });
      toastRef.current = undefined;
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParty({
      id: party.id,
      name_ar: nameAr,
      name_en: nameEn,
      abbreviation: abbreviation || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>تعديل بيانات الحزب</DialogTitle>
            <DialogDescription>
              قم بتعديل بيانات الحزب وحفظ التغييرات.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit_name_ar">الاسم بالعربية *</Label>
              <Input
                id="edit_name_ar"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="مثال: حزب الوفد"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_name_en">الاسم بالإنجليزية *</Label>
              <Input
                id="edit_name_en"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="Example: Wafd Party"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_abbreviation">الاختصار (اختياري)</Label>
              <Input
                id="edit_abbreviation"
                value={abbreviation}
                onChange={(e) => setAbbreviation(e.target.value)}
                placeholder="مثال: الوفد"
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

