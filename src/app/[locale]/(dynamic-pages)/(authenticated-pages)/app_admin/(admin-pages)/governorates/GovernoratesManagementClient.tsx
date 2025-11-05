"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateGovernorateVisibility } from "@/app/actions/governorate/updateGovernorateVisibility";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Governorate {
  id: string;
  name_ar: string;
  name_en: string | null;
  is_visible?: boolean;
}

interface GovernoratesManagementClientProps {
  governorates: Governorate[];
}

export function GovernoratesManagementClient({
  governorates: initialGovernorates,
}: GovernoratesManagementClientProps) {
  const [governorates, setGovernorates] = useState(initialGovernorates);
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleToggle = async (governorateId: string, currentVisibility: boolean) => {
    setLoading(governorateId);

    try {
      const result = await updateGovernorateVisibility(governorateId, !currentVisibility);
      
      if (result.success) {
        setGovernorates((prev) =>
          prev.map((gov) =>
            gov.id === governorateId
              ? { ...gov, is_visible: !currentVisibility }
              : gov
          )
        );

        toast({
          title: "تم التحديث بنجاح",
          description: `تم ${!currentVisibility ? "تفعيل" : "إخفاء"} المحافظة`,
        });
      } else {
        toast({
          title: "خطأ",
          description: result.error || "فشل في تحديث حالة المحافظة",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const visibleCount = governorates.filter((g) => g.is_visible).length;
  const hiddenCount = governorates.length - visibleCount;

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">إجمالي المحافظات</div>
          <div className="text-3xl font-bold">{governorates.length}</div>
        </div>
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="text-sm text-green-700 dark:text-green-300 mb-1">
            المحافظات المفعلة
          </div>
          <div className="text-3xl font-bold text-green-700 dark:text-green-300">
            {visibleCount}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
            المحافظات المخفية
          </div>
          <div className="text-3xl font-bold text-gray-700 dark:text-gray-300">
            {hiddenCount}
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          كيفية الاستخدام:
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• اضغط على زر "تفعيل" لإظهار المحافظة للمستخدمين</li>
          <li>• اضغط على زر "إخفاء" لإخفاء المحافظة من المستخدمين</li>
          <li>• المحافظات المخفية لن تظهر في القوائم أو الفلاتر</li>
        </ul>
      </div>

      {/* Governorates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {governorates.map((governorate) => (
          <div
            key={governorate.id}
            className="bg-card border rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">{governorate.name_ar}</h3>
              <p className="text-sm text-muted-foreground">
                {governorate.name_en || "-"}
              </p>
              <div className="mt-2">
                {governorate.is_visible ? (
                  <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-3 w-3" />
                    مفعلة
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                    <XCircle className="h-3 w-3" />
                    مخفية
                  </span>
                )}
              </div>
            </div>
            <div>
              <Button
                onClick={() => handleToggle(governorate.id, governorate.is_visible || false)}
                disabled={loading === governorate.id}
                size="sm"
                variant={governorate.is_visible ? "outline" : "default"}
                className={
                  governorate.is_visible
                    ? "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }
              >
                {loading === governorate.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : governorate.is_visible ? (
                  "إخفاء"
                ) : (
                  "تفعيل"
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
