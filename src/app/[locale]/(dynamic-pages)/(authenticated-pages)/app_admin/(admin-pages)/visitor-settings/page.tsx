"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Users, Loader2 } from "lucide-react";

export default function VisitorSettingsPage() {
  const [min, setMin] = useState<number>(150);
  const [max, setMax] = useState<number>(450);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Fetch current settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch("/api/settings/visitor-counter");
        if (response.ok) {
          const data = await response.json();
          setMin(data.min);
          setMax(data.max);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("فشل في جلب الإعدادات");
      } finally {
        setFetching(false);
      }
    }

    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (min >= max) {
      toast.error("الحد الأدنى يجب أن يكون أقل من الحد الأقصى");
      return;
    }

    if (min < 0 || max < 0) {
      toast.error("الأرقام يجب أن تكون موجبة");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/settings/visitor-counter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ min, max }),
      });

      if (response.ok) {
        toast.success("تم تحديث الإعدادات بنجاح");
      } else {
        const error = await response.json();
        toast.error(error.error || "فشل في تحديث الإعدادات");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("حدث خطأ أثناء التحديث");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            <CardTitle>إعدادات عداد الزوار</CardTitle>
          </div>
          <CardDescription>
            حدد نطاق عدد الزوار المتواجدين. سيتم عرض رقم عشوائي بين الحد الأدنى والحد الأقصى، ويتغير كل 45 ثانية.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min">الحد الأدنى</Label>
                <Input
                  id="min"
                  type="number"
                  value={min}
                  onChange={(e) => setMin(parseInt(e.target.value) || 0)}
                  min="0"
                  required
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max">الحد الأقصى</Label>
                <Input
                  id="max"
                  type="number"
                  value={max}
                  onChange={(e) => setMax(parseInt(e.target.value) || 0)}
                  min="0"
                  required
                  dir="ltr"
                />
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">معاينة:</p>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-sm">عدد الزائرين المتواجدون الآن:</span>
                <span className="font-semibold">
                  {Math.floor(Math.random() * (max - min + 1)) + min}
                </span>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                "حفظ الإعدادات"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

