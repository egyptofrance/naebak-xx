import { getAllGovernorates } from "@/app/actions/governorate/getAllGovernorates";
import { GovernoratesManagementClient } from "./GovernoratesManagementClient";

export const metadata = {
  title: "إدارة المحافظات | لوحة التحكم",
  description: "التحكم في المحافظات المرئية للنشر التدريجي",
};

export default async function GovernoratesManagementPage() {
  const governorates = await getAllGovernorates();

  return (
    <div className="container mx-auto p-6 max-w-6xl" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">إدارة المحافظات</h1>
        <p className="text-muted-foreground">
          التحكم في المحافظات المرئية للمستخدمين - للنشر التدريجي للتطبيق
        </p>
      </div>

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

      <GovernoratesManagementClient governorates={governorates} />
    </div>
  );
}
