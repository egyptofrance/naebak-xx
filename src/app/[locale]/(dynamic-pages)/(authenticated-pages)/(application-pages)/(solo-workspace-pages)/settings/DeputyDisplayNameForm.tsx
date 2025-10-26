"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateDisplayNameAction } from "@/data/deputy/update-display-name";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { formatDeputyName } from "@/utils/formatDeputyName";

interface DeputyDisplayNameFormProps {
  currentDisplayName: string | null;
  fullName: string | null;
}

export function DeputyDisplayNameForm({ currentDisplayName, fullName }: DeputyDisplayNameFormProps) {
  const [displayName, setDisplayName] = useState(currentDisplayName || "");
  const [previewName, setPreviewName] = useState(displayName);

  const { execute, status } = useAction(updateDisplayNameAction, {
    onSuccess: () => {
      toast.success("تم تحديث اسم العرض بنجاح");
    },
    onError: (error) => {
      toast.error(error.error.serverError || "فشل تحديث اسم العرض");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    execute({ displayName: displayName.trim() || null });
  };

  const handleInputChange = (value: string) => {
    setDisplayName(value);
    setPreviewName(value);
  };

  const handleReset = () => {
    setDisplayName("");
    setPreviewName("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>اسم العرض المخصص</CardTitle>
        <CardDescription>
          اختر كيف تريد أن يظهر اسمك في جميع أنحاء الموقع (كروت النواب، الصفحة الشخصية، إلخ)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display-name">اسم العرض (اختياري)</Label>
            <Input
              id="display-name"
              type="text"
              placeholder="مثال: د. أحمد محمد، المهندس أحمد، أحمد محمد علي"
              value={displayName}
              onChange={(e) => handleInputChange(e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              إذا تركت هذا الحقل فارغاً، سيتم استخدام التنسيق التلقائي: الاسم الأول + اسم الأب
            </p>
          </div>

          {/* Preview */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <Label className="text-sm font-medium">معاينة:</Label>
            <div className="space-y-1">
              <p className="text-lg font-bold">
                {formatDeputyName(fullName, previewName || null)}
              </p>
              <p className="text-xs text-muted-foreground">
                {previewName 
                  ? "اسم العرض المخصص" 
                  : "التنسيق التلقائي (الاسم الأول + اسم الأب)"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={status === "executing"}
            >
              {status === "executing" ? "جاري الحفظ..." : "حفظ التعديلات"}
            </Button>
            {displayName && (
              <Button 
                type="button" 
                variant="outline"
                onClick={handleReset}
                disabled={status === "executing"}
              >
                استخدام التنسيق التلقائي
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

