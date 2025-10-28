"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Loader2 } from "lucide-react";
import { updateComplaintDetails } from "@/data/complaints/complaints";
import { useRouter } from "next/navigation";

interface EditComplaintDialogProps {
  complaintId: string;
  currentTitle: string;
  currentDescription: string;
  currentCategory: string;
  currentGovernorate: string | null;
  currentDistrict: string | null;
  currentCreatedAt: string;
}

const categoryLabels: Record<string, string> = {
  infrastructure: "البنية التحتية",
  education: "التعليم",
  health: "الصحة",
  security: "الأمن",
  environment: "البيئة",
  transportation: "النقل",
  utilities: "المرافق",
  housing: "الإسكان",
  employment: "التوظيف",
  social_services: "الخدمات الاجتماعية",
  legal: "قانونية",
  corruption: "فساد",
  other: "أخرى",
};

const governorates = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحيرة", "الفيوم",
  "الغربية", "الإسماعيلية", "المنوفية", "المنيا", "القليوبية", "الوادي الجديد",
  "الشرقية", "سوهاج", "أسوان", "أسيوط", "بني سويف", "بورسعيد",
  "دمياط", "السويس", "الأقصر", "قنا", "البحر الأحمر", "شمال سيناء",
  "جنوب سيناء", "كفر الشيخ", "مطروح"
];

export function EditComplaintDialog({
  complaintId,
  currentTitle,
  currentDescription,
  currentCategory,
  currentGovernorate,
  currentDistrict,
  currentCreatedAt,
}: EditComplaintDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(currentTitle);
  const [description, setDescription] = useState(currentDescription);
  const [category, setCategory] = useState<string>(currentCategory);
  const [governorate, setGovernorate] = useState(currentGovernorate || "");
  const [district, setDistrict] = useState(currentDistrict || "");
  const [createdAt, setCreatedAt] = useState(
    new Date(currentCreatedAt).toISOString().slice(0, 16)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await updateComplaintDetails({
        complaintId,
        title: title.trim(),
        description: description.trim(),
        category: category as "infrastructure" | "education" | "health" | "security" | "environment" | "transportation" | "utilities" | "housing" | "employment" | "social_services" | "legal" | "corruption" | "other",
        governorate: governorate || null,
        district: district || null,
        createdAt: new Date(createdAt).toISOString(),
      });

      if (result?.data?.success) {
        setOpen(false);
        router.refresh();
      } else {
        setError(result?.data?.error || "فشل تحديث الشكوى");
      }
    } catch (err) {
      setError("حدث خطأ أثناء تحديث الشكوى");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      setOpen(newOpen);
      if (!newOpen) {
        // Reset form when closing
        setTitle(currentTitle);
        setDescription(currentDescription);
        setCategory(currentCategory);
        setGovernorate(currentGovernorate || "");
        setDistrict(currentDistrict || "");
        setCreatedAt(new Date(currentCreatedAt).toISOString().slice(0, 16));
        setError(null);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="h-4 w-4" />
          تعديل الشكوى
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" dir="rtl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>تعديل تفاصيل الشكوى</DialogTitle>
            <DialogDescription>
              يمكنك تعديل جميع تفاصيل الشكوى من هنا
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="title">عنوان الشكوى</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="أدخل عنوان الشكوى"
                required
                disabled={isLoading}
                className="text-right"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">وصف الشكوى</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="أدخل وصف الشكوى"
                required
                disabled={isLoading}
                rows={8}
                className="text-right resize-none"
              />
              <p className="text-xs text-muted-foreground">
                عدد الأحرف: {description.length}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">الفئة</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-3 py-2 border rounded-md bg-background text-center appearance-none"
                  style={{ backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", backgroundPosition: "left 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
                >
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="governorate">المحافظة</Label>
                <select
                  id="governorate"
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border rounded-md bg-background text-center appearance-none"
                  style={{ backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", backgroundPosition: "left 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
                >
                  <option value="">غير محدد</option>
                  {governorates.map((gov) => (
                    <option key={gov} value={gov}>
                      {gov}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="district">المنطقة/الدائرة</Label>
                <Input
                  id="district"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="أدخل المنطقة أو الدائرة"
                  disabled={isLoading}
                  className="text-right"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="createdAt">تاريخ الإنشاء</Label>
                <Input
                  id="createdAt"
                  type="datetime-local"
                  value={createdAt}
                  onChange={(e) => setCreatedAt(e.target.value)}
                  required
                  disabled={isLoading}
                  className="text-right"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                "حفظ التعديلات"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
