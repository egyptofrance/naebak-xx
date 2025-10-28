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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Loader2 } from "lucide-react";
import { updateComplaintDetails } from "@/data/complaints/complaints";
import { useRouter } from "next/navigation";

interface EditComplaintDialogProps {
  complaintId: string;
  currentTitle: string;
  currentDescription: string;
}

export function EditComplaintDialog({
  complaintId,
  currentTitle,
  currentDescription,
}: EditComplaintDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(currentTitle);
  const [description, setDescription] = useState(currentDescription);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await updateComplaintDetails({
        complaintId,
        title: title.trim(),
        description: description.trim(),
      });

      if (result.success) {
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error || "فشل تحديث الشكوى");
      }
    } catch (err) {
      setError("حدث خطأ أثناء تحديث الشكوى");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      setOpen(newOpen);
      if (!newOpen) {
        // Reset form when closing
        setTitle(currentTitle);
        setDescription(currentDescription);
        setError(null);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="h-4 w-4" />
          تعديل الشكوى
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>تعديل تفاصيل الشكوى</DialogTitle>
            <DialogDescription>
              يمكنك تعديل عنوان ووصف الشكوى من هنا
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="title">عنوان الشكوى</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="أدخل عنوان الشكوى"
                required
                disabled={isLoading}
                className="text-right"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">وصف الشكوى</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="أدخل وصف الشكوى"
                required
                disabled={isLoading}
                rows={10}
                className="text-right resize-none"
              />
              <p className="text-xs text-muted-foreground">
                عدد الأحرف: {description.length}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                "حفظ التعديلات"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
