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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { createBreakingNewsAction } from "@/data/admin/breaking-news";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

export function CreateNewsDialog() {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);

  const { execute, isExecuting } = useAction(createBreakingNewsAction, {
    onSuccess: () => {
      toast.success("تم إضافة الخبر بنجاح");
      setOpen(false);
      setContent("");
      setDisplayOrder("0");
      setIsActive(true);
      window.location.reload();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "حدث خطأ أثناء إضافة الخبر");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error("يرجى إدخال محتوى الخبر");
      return;
    }

    execute({
      content: content.trim(),
      displayOrder: parseInt(displayOrder) || 0,
      isActive,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          إضافة خبر جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>إضافة خبر عاجل جديد</DialogTitle>
            <DialogDescription>
              أضف خبراً جديداً ليظهر في الشريط الإخباري أعلى الصفحة الرئيسية
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="content">محتوى الخبر *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="أدخل محتوى الخبر العاجل..."
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayOrder">ترتيب العرض</Label>
              <Input
                id="displayOrder"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                min="0"
              />
              <p className="text-xs text-muted-foreground">
                الأخبار ذات الترتيب الأقل تظهر أولاً
              </p>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(checked as boolean)}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                نشط (يظهر في الشريط الإخباري)
              </Label>
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
              {isExecuting ? "جاري الإضافة..." : "إضافة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
