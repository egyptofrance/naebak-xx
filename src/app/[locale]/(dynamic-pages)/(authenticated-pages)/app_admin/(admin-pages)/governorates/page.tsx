import { getAllGovernorates } from "@/app/actions/governorate/getAllGovernorates";
import { updateGovernorateVisibility } from "@/app/actions/governorate/updateGovernorateVisibility";
import { revalidatePath } from "next/cache";
import { CheckCircle2, XCircle } from "lucide-react";

export const metadata = {
  title: "إدارة المحافظات | لوحة التحكم",
  description: "التحكم في المحافظات المرئية للنشر التدريجي",
};

export default async function GovernoratesManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const params = await searchParams;
  const governorates = await getAllGovernorates();
  
  const visibleCount = governorates.filter((g) => g.is_visible).length;
  const hiddenCount = governorates.length - visibleCount;

  // Server Action
  async function toggleVisibility(formData: FormData) {
    "use server";
    
    const governorateId = formData.get("governorateId") as string;
    const currentVisibility = formData.get("currentVisibility") === "true";
    const governorateName = formData.get("governorateName") as string;
    
    console.log("=== SERVER ACTION CALLED ===");
    console.log("Governorate ID:", governorateId);
    console.log("Governorate Name:", governorateName);
    console.log("Current Visibility:", currentVisibility);
    console.log("New Visibility:", !currentVisibility);
    console.log("===========================");
    
    try {
      const result = await updateGovernorateVisibility(governorateId, !currentVisibility);
      
      console.log("Update Result:", result);
      
      if (result.success) {
        console.log("SUCCESS! Revalidating paths...");
        revalidatePath("/ar/app_admin/governorates");
        revalidatePath("/");
        console.log("Paths revalidated");
      } else {
        console.error("FAILED:", result.error);
      }
      
      return result;
    } catch (error) {
      console.error("EXCEPTION in toggleVisibility:", error);
      return { success: false, error: String(error) };
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl" dir="rtl">
      {/* Success/Error Messages */}
      {params.success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          ✅ تم تحديث {params.success} بنجاح
        </div>
      )}
      {params.error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          ❌ خطأ: {params.error}
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
                <form action={toggleVisibility} method="POST">
                  <input type="hidden" name="governorateId" value={governorate.id} />
                  <input type="hidden" name="currentVisibility" value={String(isVisible)} />
                  <input type="hidden" name="governorateName" value={governorate.name_ar} />
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-md font-medium text-sm transition-colors hover:opacity-90 active:scale-95 ${
                      isVisible
                        ? "bg-gray-200 hover:bg-gray-300 text-gray-700 border border-gray-300"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  >
                    {isVisible ? "إخفاء" : "تفعيل"}
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
