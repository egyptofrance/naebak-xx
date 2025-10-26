"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreateNewsDialog } from "./CreateNewsDialog";
import { EditNewsDialog } from "./EditNewsDialog";
import { DeleteNewsDialog } from "./DeleteNewsDialog";
import { updateBreakingNewsAction } from "@/data/admin/breaking-news";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

interface BreakingNewsItem {
  id: string;
  content: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface BreakingNewsListProps {
  initialNews: BreakingNewsItem[];
}

export function BreakingNewsList({ initialNews }: BreakingNewsListProps) {
  const [news, setNews] = useState(initialNews);

  const { execute: toggleActive } = useAction(updateBreakingNewsAction, {
    onSuccess: () => {
      toast.success("تم تحديث حالة الخبر");
      window.location.reload();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "حدث خطأ");
    },
  });

  const handleToggleActive = (id: string, currentState: boolean) => {
    toggleActive({ id, isActive: !currentState });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">
            عدد الأخبار: {news.length}
          </p>
        </div>
        <CreateNewsDialog />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">الترتيب</TableHead>
              <TableHead>المحتوى</TableHead>
              <TableHead className="w-24 text-center">الحالة</TableHead>
              <TableHead className="w-32 text-center">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {news.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  لا توجد أخبار عاجلة. اضغط على "إضافة خبر جديد" لإضافة أول خبر.
                </TableCell>
              </TableRow>
            ) : (
              news.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.display_order}</TableCell>
                  <TableCell className="max-w-md">
                    <p className="truncate">{item.content}</p>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={item.is_active ? "default" : "secondary"}>
                      {item.is_active ? "نشط" : "غير نشط"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(item.id, item.is_active)}
                        title={item.is_active ? "إخفاء" : "إظهار"}
                      >
                        {item.is_active ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <EditNewsDialog news={item} />
                      <DeleteNewsDialog newsId={item.id} newsContent={item.content} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
