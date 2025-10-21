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
import { createPartyAction } from "@/data/admin/party";
import { useAction } from "next-safe-action/hooks";
import { useRef, useState } from "react";
import { toast } from "sonner";

export function CreatePartyDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [abbreviation, setAbbreviation] = useState("");
  const toastRef = useRef<string | number | undefined>(undefined);

  const { execute: createParty, isPending } = useAction(createPartyAction, {
    onExecute: () => {
      toastRef.current = toast.loading("Creating party...");
    },
    onSuccess: () => {
      toast.success("Party created successfully!", {
        id: toastRef.current,
      });
      toastRef.current = undefined;
      setOpen(false);
      setNameAr("");
      setNameEn("");
      setAbbreviation("");
      // Refresh the page to show updated list
      window.location.reload();
    },
    onError: ({ error }) => {
      const errorMessage = error.serverError ?? "Failed to create party";
      toast.error(errorMessage, {
        id: toastRef.current,
      });
      toastRef.current = undefined;
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createParty({
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
            <DialogTitle>إضافة حزب جديد</DialogTitle>
            <DialogDescription>
              أدخل بيانات الحزب الجديد. سيتم إضافته في نهاية القائمة.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name_ar">الاسم بالعربية *</Label>
              <Input
                id="name_ar"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="مثال: حزب الوفد"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name_en">الاسم بالإنجليزية *</Label>
              <Input
                id="name_en"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="Example: Wafd Party"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="abbreviation">الاختصار (اختياري)</Label>
              <Input
                id="abbreviation"
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
              {isPending ? "جاري الإضافة..." : "إضافة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

