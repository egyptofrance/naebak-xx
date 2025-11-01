"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { updateGovernorateVisibility } from "@/app/actions/governorate/updateGovernorateVisibility";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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

  const handleToggleVisibility = async (governorateId: string, currentVisibility: boolean) => {
    setLoading(governorateId);

    try {
      const result = await updateGovernorateVisibility(governorateId, !currentVisibility);

      if (result.success) {
        // Update local state
        setGovernorates((prev) =>
          prev.map((gov) =>
            gov.id === governorateId
              ? { ...gov, is_visible: !currentVisibility }
              : gov
          )
        );

        toast({
          title: "تم التحديث بنجاح",
          description: `تم ${!currentVisibility ? "إظهار" : "إخفاء"} المحافظة`,
        });
      } else {
        toast({
          title: "خطأ",
          description: result.error || "فشل في تحديث حالة المحافظة",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error toggling visibility:", error);
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
            المحافظات المرئية
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

      {/* Governorates List */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-right p-4 font-semibold">المحافظة</th>
                <th className="text-right p-4 font-semibold">الاسم بالإنجليزية</th>
                <th className="text-center p-4 font-semibold">الحالة</th>
                <th className="text-center p-4 font-semibold">التحكم</th>
              </tr>
            </thead>
            <tbody>
              {governorates.map((governorate) => (
                <tr
                  key={governorate.id}
                  className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4">
                    <div className="font-semibold">{governorate.name_ar}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-muted-foreground">
                      {governorate.name_en || "-"}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    {governorate.is_visible ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300 text-sm font-medium">
                        <Eye className="h-3 w-3" />
                        مرئية
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-950/30 text-gray-700 dark:text-gray-300 text-sm font-medium">
                        <EyeOff className="h-3 w-3" />
                        مخفية
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Switch
                        checked={governorate.is_visible || false}
                        onCheckedChange={() =>
                          handleToggleVisibility(
                            governorate.id,
                            governorate.is_visible || false
                          )
                        }
                        disabled={loading === governorate.id}
                      />
                      {loading === governorate.id && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={async () => {
            for (const gov of governorates) {
              if (!gov.is_visible) {
                await handleToggleVisibility(gov.id, false);
              }
            }
          }}
          disabled={loading !== null}
        >
          إظهار الكل
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            for (const gov of governorates) {
              if (gov.is_visible) {
                await handleToggleVisibility(gov.id, true);
              }
            }
          }}
          disabled={loading !== null}
        >
          إخفاء الكل
        </Button>
      </div>
    </div>
  );
}
