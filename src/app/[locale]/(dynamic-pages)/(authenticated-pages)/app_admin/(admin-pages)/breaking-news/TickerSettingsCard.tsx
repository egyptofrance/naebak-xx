"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { updateTickerSettingsAction } from "@/data/admin/breaking-news";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

interface TickerSettingsCardProps {
  initialSpeed: number;
}

export function TickerSettingsCard({ initialSpeed }: TickerSettingsCardProps) {
  const [scrollSpeed, setScrollSpeed] = useState(initialSpeed.toString());

  const { execute, isExecuting } = useAction(updateTickerSettingsAction, {
    onSuccess: () => {
      toast.success("تم تحديث إعدادات الشريط بنجاح");
      window.location.reload();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "حدث خطأ أثناء التحديث");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const speed = parseInt(scrollSpeed);
    if (isNaN(speed) || speed < 10 || speed > 200) {
      toast.error("السرعة يجب أن تكون بين 10 و 200");
      return;
    }

    execute({ scrollSpeed: speed });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          إعدادات الشريط الإخباري
        </CardTitle>
        <CardDescription>
          التحكم في سرعة حركة الشريط الإخباري
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scrollSpeed">سرعة التمرير (بكسل/ثانية)</Label>
            <div className="flex gap-2">
              <Input
                id="scrollSpeed"
                type="number"
                value={scrollSpeed}
                onChange={(e) => setScrollSpeed(e.target.value)}
                min="10"
                max="200"
                className="max-w-[200px]"
              />
              <Button type="submit" disabled={isExecuting}>
                {isExecuting ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              السرعة الموصى بها: 30-80 (القيمة الحالية: {initialSpeed})
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
