"use client";

import { createComplaintAction } from "@/data/complaints/complaints";
import { useState } from "react";
import { useRouter } from "next/navigation";

type ComplaintCategory =
  | "infrastructure"
  | "education"
  | "health"
  | "security"
  | "environment"
  | "transportation"
  | "utilities"
  | "housing"
  | "employment"
  | "social_services"
  | "legal"
  | "corruption"
  | "other";

export default function NewComplaintPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as ComplaintCategory,
      governorate: formData.get("governorate") as string || undefined,
      district: formData.get("district") as string || undefined,
      address: formData.get("address") as string || undefined,
      citizen_phone: formData.get("citizen_phone") as string || undefined,
      citizen_email: formData.get("citizen_email") as string || undefined,
      is_public: formData.get("is_public") === "on",
    };

    const result = await createComplaintAction(data);

    if (result?.serverError || result?.validationErrors) {
      setError(result.serverError || "حدث خطأ في التحقق من البيانات");
      setLoading(false);
    } else {
      router.push("/complaints");
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">إضافة شكوى جديدة</h1>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            عنوان الشكوى *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            minLength={5}
            maxLength={255}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="مثال: مشكلة في الإنارة العامة"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            الفئة *
          </label>
          <select
            id="category"
            name="category"
            required
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">اختر الفئة</option>
            <option value="infrastructure">البنية التحتية</option>
            <option value="education">التعليم</option>
            <option value="health">الصحة</option>
            <option value="security">الأمن</option>
            <option value="environment">البيئة</option>
            <option value="transportation">النقل</option>
            <option value="utilities">المرافق</option>
            <option value="housing">الإسكان</option>
            <option value="employment">التوظيف</option>
            <option value="social_services">الخدمات الاجتماعية</option>
            <option value="legal">قانونية</option>
            <option value="corruption">فساد</option>
            <option value="other">أخرى</option>
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            وصف الشكوى *
          </label>
          <textarea
            id="description"
            name="description"
            required
            minLength={20}
            maxLength={5000}
            rows={6}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="اشرح المشكلة بالتفصيل..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="governorate" className="block text-sm font-medium mb-1">
              المحافظة
            </label>
            <select
              id="governorate"
              name="governorate"
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">اختر المحافظة</option>
              <option value="القاهرة">القاهرة</option>
              <option value="الجيزة">الجيزة</option>
              <option value="الإسكندرية">الإسكندرية</option>
              <option value="الدقهلية">الدقهلية</option>
              <option value="البحيرة">البحيرة</option>
              <option value="الفيوم">الفيوم</option>
              <option value="الغربية">الغربية</option>
              <option value="الإسماعيلية">الإسماعيلية</option>
              <option value="المنوفية">المنوفية</option>
              <option value="المنيا">المنيا</option>
              <option value="القليوبية">القليوبية</option>
              <option value="الوادي الجديد">الوادي الجديد</option>
              <option value="الشرقية">الشرقية</option>
              <option value="سوهاج">سوهاج</option>
              <option value="أسوان">أسوان</option>
              <option value="أسيوط">أسيوط</option>
              <option value="بني سويف">بني سويف</option>
              <option value="بورسعيد">بورسعيد</option>
              <option value="دمياط">دمياط</option>
              <option value="السويس">السويس</option>
              <option value="الأقصر">الأقصر</option>
              <option value="قنا">قنا</option>
              <option value="البحر الأحمر">البحر الأحمر</option>
              <option value="شمال سيناء">شمال سيناء</option>
              <option value="جنوب سيناء">جنوب سيناء</option>
              <option value="كفر الشيخ">كفر الشيخ</option>
              <option value="مطروح">مطروح</option>
            </select>
          </div>

          <div>
            <label htmlFor="district" className="block text-sm font-medium mb-1">
              المنطقة
            </label>
            <input
              type="text"
              id="district"
              name="district"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium mb-1">
            العنوان التفصيلي
          </label>
          <input
            type="text"
            id="address"
            name="address"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="citizen_phone" className="block text-sm font-medium mb-1">
              رقم الهاتف
            </label>
            <input
              type="tel"
              id="citizen_phone"
              name="citizen_phone"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label htmlFor="citizen_email" className="block text-sm font-medium mb-1">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              id="citizen_email"
              name="citizen_email"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <div className="flex items-start gap-3 p-4 bg-secondary/30 rounded-md">
            <input
              type="checkbox"
              id="is_public"
              name="is_public"
              className="mt-1 h-4 w-4"
            />
            <div>
              <label htmlFor="is_public" className="block text-sm font-medium cursor-pointer">
                السماح بعرض هذه الشكوى للجمهور
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                إذا وافقت، سيتم عرض شكواك في صفحة الشكاوى العامة ليراها الجميع. هذا يساعد في زيادة الشفافية والضغط لحل المشكلة.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "جاري الإرسال..." : "إرسال الشكوى"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border rounded-md hover:bg-secondary"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}

