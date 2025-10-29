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
import { Edit } from "lucide-react";
import { updateBreakingNewsAction } from "@/data/admin/breaking-news";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

interface EditNewsDialogProps {
  news: {
    id: string;
    content: string;
    display_order: number;
  };
}

export function EditNewsDialog({ news }: EditNewsDialogProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(news.content);
  const [displayOrder, setDisplayOrder] = useState(news.display_order.toString());

  const { execute, isExecuting } = useAction(updateBreakingNewsAction, {
    onSuccess: () => {
      toast.success("تم تحديث الخبر بنجاح");
      setOpen(false);
      window.location.reload();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "حدث خطأ أثناء تحديث الخبر");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error("يرجى إدخال محتوى الخبر");
      return;
    }

    execute({
      id: news.id,
      content: content.trim(),
      displayOrder: parseInt(displayOrder) || 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="تعديل">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>تعديل الخبر العاجل</DialogTitle>
            <DialogDescription>
              قم بتعديل محتوى الخبر أو ترتيب عرضه
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-content">محتوى الخبر *</Label>
              <Textarea
                id="edit-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="أدخل محتوى الخبر العاجل..."
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-displayOrder">ترتيب العرض</Label>
              <Input
                id="edit-displayOrder"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                min="0"
              />
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
              {isExecuting ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
