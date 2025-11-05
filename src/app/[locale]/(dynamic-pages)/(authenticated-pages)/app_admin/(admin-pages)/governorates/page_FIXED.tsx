"use client";

import { getAllGovernorates } from "@/app/actions/governorate/getAllGovernorates";
import { updateGovernorateVisibility } from "@/app/actions/governorate/updateGovernorateVisibility";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function GovernoratesManagementPage() {
  const [governorates, setGovernorates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Load governorates on mount
  useEffect(() => {
    loadGovernorates();
  }, []);

  async function loadGovernorates() {
    try {
      setLoading(true);
      const data = await getAllGovernorates();
      setGovernorates(data);
    } catch (error) {
      console.error("Error loading governorates:", error);
      setMessage({ type: 'error', text: 'فشل في تحميل المحافظات' });
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(governorateId: string, currentVisibility: boolean, governorateName: string) {
    console.log("=== TOGGLE CLICKED ===");
    console.log("Governorate ID:", governorateId);
    console.log("Governorate Name:", governorateName);
    console.log("Current Visibility:", currentVisibility);
    console.log("New Visibility:", !currentVisibility);
    console.log("=====================");

    setUpdatingId(governorateId);
    setMessage(null);

    try {
      const result = await updateGovernorateVisibility(governorateId, !currentVisibility);
      
      console.log("Update Result:", result);

      if (result.success) {
        console.log("SUCCESS! Refreshing data...");
        setMessage({ type: 'success', text: `تم تحديث ${governorateName} بنجاح` });
        
        // Refresh the data
        await loadGovernorates();
        
        // Refresh the router to update server components
        startTransition(() => {
          router.refresh();
        });
      } else {
        console.error("FAILED:", result.error);
        setMessage({ type: 'error', text: result.error || 'فشل في التحديث' });
      }
    } catch (error) {
      console.error("Exception during update:", error);
      setMessage({ type: 'error', text: 'حدث خطأ أثناء التحديث' });
    } finally {
      setUpdatingId(null);
    }
  }

  const visibleCount = governorates.filter((g) => g.is_visible).length;
  const hiddenCount = governorates.length - visibleCount;

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl flex items-center justify-center min-h-[400px]" dir="rtl">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl" dir="rtl">
      {/* Success/Error Messages */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? '✅' : '❌'} {message.text}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">إدارة المحافظات</h1>
        <p className="text-muted-foreground">
          التحكم في المحافظات المرئية للمستخدمين - للنشر التدريجي للتطبيق
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              كيفية الاستخدام:
            </h3>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li>• قم بتفعيل المحافظات التي تريد إظهارها للمستخدمين</li>
              <li>• المحافظات المخفية لن تظهر في القوائم أو الفلاتر</li>
              <li>• النواب والمرشحين من المحافظات المخفية سيتم إخفاؤهم تلقائياً</li>
              <li>• يمكنك تفعيل/إخفاء المحافظات في أي وقت دون التأثير على البيانات</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

      {/* Governorates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {governorates.map((governorate) => {
          const isVisible = governorate.is_visible || false;
          const isUpdating = updatingId === governorate.id;
          
          return (
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
                  {isVisible ? (
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
                <button
                  type="button"
                  onClick={() => handleToggle(governorate.id, isVisible, governorate.name_ar)}
                  disabled={isUpdating || isPending}
                  className={`px-4 py-2 rounded-md font-medium text-sm transition-colors hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                    isVisible
                      ? "bg-gray-200 hover:bg-gray-300 text-gray-700 border border-gray-300"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isVisible ? "إخفاء" : "تفعيل"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
