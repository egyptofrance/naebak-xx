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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { updateDeputyAction } from "@/data/admin/deputies";

interface SetInitialRatingDialogProps {
  deputyId: string;
  deputyName: string;
  currentRating?: number;
  currentCount?: number;
}

export function SetInitialRatingDialog({
  deputyId,
  deputyName,
  currentRating = 0,
  currentCount = 0,
}: SetInitialRatingDialogProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(currentRating.toString());
  const [count, setCount] = useState(currentCount.toString());

  const { execute, isExecuting } = useAction(updateDeputyAction, {
    onSuccess: () => {
      toast.success("تم تعيين التقييم المبدئي بنجاح");
      setOpen(false);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "حدث خطأ أثناء تعيين التقييم");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const ratingNum = parseFloat(rating);
    const countNum = parseInt(count);

    if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
      toast.error("التقييم يجب أن يكون بين 0 و 5");
      return;
    }

    if (isNaN(countNum) || countNum < 0) {
      toast.error("عدد المقيّمين يجب أن يكون رقماً موجباً");
      return;
    }

    execute({
      deputyId,
      initialRatingAverage: rating,
      initialRatingCount: count,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Star className="h-4 w-4 mr-1" />
          تقييم
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>تعيين التقييم المبدئي</DialogTitle>
            <DialogDescription>
              تعيين التقييم المبدئي للنائب: <strong>{deputyName}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rating">
                التقييم المبدئي (0-5)
              </Label>
              <Input
                id="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="0.0"
                required
              />
              <p className="text-xs text-muted-foreground">
                متوسط التقييم من 0 إلى 5 نجوم
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="count">
                عدد المقيّمين الابتدائي
              </Label>
              <Input
                id="count"
                type="number"
                min="0"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                placeholder="0"
                required
              />
              <p className="text-xs text-muted-foreground">
                عدد التقييمات الابتدائية
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isExecuting}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isExecuting}>
              {isExecuting ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
