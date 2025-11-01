"use client";

import { createComplaintAction } from "@/data/complaints/complaints";
import { uploadComplaintAttachmentAction } from "@/data/complaints/uploadComplaintAttachment";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { Upload, X, FileIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  | "investment"
  | "other";

interface AttachmentFile {
  file: File;
  preview?: string;
  base64?: string;
}

export default function NewComplaintPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Check file size (max 10MB per file)
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`الملف ${file.name} أكبر من 10 ميجابايت`);
        return false;
      }
      return true;
    });

    // Check total number of files
    if (attachments.length + validFiles.length > 5) {
      toast.error("يمكنك رفع 5 ملفات كحد أقصى");
      return;
    }

    // Convert files to base64
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const attachment: AttachmentFile = { 
          file,
          base64
        };
        
        // Create preview for images
        if (file.type.startsWith('image/')) {
          attachment.preview = base64;
        }
        
        setAttachments(prev => [...prev, attachment]);
      };
      reader.readAsDataURL(file);
    });

    setError("");
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setUploadProgress(0);

    try {
      const formData = new FormData(e.currentTarget);

      const data = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as ComplaintCategory,
        governorate: (formData.get("governorate") as string) || undefined,
        district: (formData.get("district") as string) || undefined,
        address: (formData.get("address") as string) || undefined,
        citizen_phone: (formData.get("citizen_phone") as string) || undefined,
        citizen_email: (formData.get("citizen_email") as string) || undefined,
        is_public: formData.get("is_public") === "on",
      };

      // Create complaint
      const result = await createComplaintAction(data);

      if (result?.serverError || result?.validationErrors) {
        setError(result.serverError || "حدث خطأ في التحقق من البيانات");
        setLoading(false);
        return;
      }

      // Check if complaint was created successfully
      if (result?.data?.status === "success" && result.data.data) {
        const complaintId = result.data.data.id;
        
        // Upload attachments if any
        if (attachments.length > 0) {
          toast.info(`جاري رفع ${attachments.length} ملف...`);
          
          for (let i = 0; i < attachments.length; i++) {
            const attachment = attachments[i];
            
            if (!attachment.base64) {
              toast.error(`فشل رفع ${attachment.file.name}: لم يتم تحويل الملف`);
              continue;
            }

            try {
              const uploadResult = await uploadComplaintAttachmentAction({
                complaintId,
                fileData: attachment.base64,
                fileName: attachment.file.name,
                fileType: attachment.file.type,
                fileSize: attachment.file.size,
              });

              if (uploadResult?.serverError) {
                toast.error(`فشل رفع ${attachment.file.name}: ${uploadResult.serverError}`);
              } else {
                setUploadProgress(Math.round(((i + 1) / attachments.length) * 100));
              }
            } catch (err: any) {
              toast.error(`فشل رفع ${attachment.file.name}: ${err.message}`);
            }
          }
          
          toast.success("تم رفع جميع المرفقات بنجاح");
        }

        toast.success("تم إنشاء الشكوى بنجاح");
        router.push("/complaints");
      } else {
        setError(result?.data?.message || "حدث خطأ أثناء إنشاء الشكوى");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء إنشاء الشكوى");
      setLoading(false);
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto py-8 px-4" dir="rtl">
      <h1 className="text-3xl font-bold mb-6">إضافة شكوى جديدة</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">
            عنوان الشكوى <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            required
            minLength={5}
            maxLength={255}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="مثال: مشكلة في قانون الضرائب"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-2">
            الفئة <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            required
            dir="rtl"
            className="w-full px-3 py-2 border rounded-md appearance-none bg-white text-center"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'left 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em'
            }}
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
            <option value="legal">القانونية</option>
            <option value="corruption">الفساد</option>
            <option value="investment">الاستثمار</option>
            <option value="other">أخرى</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">
            وصف الشكوى <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            required
            minLength={20}
            maxLength={5000}
            rows={6}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="اشرح المشكلة بالتفصيل..."
          />
        </div>

        {/* Governorate */}
        <div>
          <label className="block text-sm font-medium mb-2">المحافظة</label>
          <select
            name="governorate"
            dir="rtl"
            className="w-full px-3 py-2 border rounded-md appearance-none bg-white text-center"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'left 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em'
            }}
          >
            <option value="">🌍 شكوى عامة - جميع المحافظات</option>
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

        {/* District */}
        <div>
          <label className="block text-sm font-medium mb-2">المنطقة</label>
          <input
            type="text"
            name="district"
            className="w-full px-3 py-2 border rounded-md"
            placeholder="مثال: مدينة نصر"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium mb-2">العنوان التفصيلي</label>
          <input
            type="text"
            name="address"
            className="w-full px-3 py-2 border rounded-md"
            placeholder="مثال: شارع مصطفى النحاس"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
          <input
            type="tel"
            name="citizen_phone"
            className="w-full px-3 py-2 border rounded-md"
            placeholder="مثال: 01234567890"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
          <input
            type="email"
            name="citizen_email"
            className="w-full px-3 py-2 border rounded-md"
            placeholder="مثال: example@email.com"
          />
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-sm font-medium mb-2">
            المرفقات (اختياري)
          </label>
          <div className="space-y-3">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                multiple
                accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,video/*,audio/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                disabled={loading}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-600">
                  اضغط لاختيار الملفات أو اسحبها هنا
                </span>
                <span className="text-xs text-gray-500">
                  الحد الأقصى: 5 ملفات، 10MB لكل ملف
                </span>
              </label>
            </div>

            {/* Attachments List */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    {attachment.preview ? (
                      <img
                        src={attachment.preview}
                        alt={attachment.file.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded">
                        <FileIcon className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {attachment.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(attachment.file.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 hover:text-red-700"
                      disabled={loading}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Progress */}
            {loading && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>جاري رفع المرفقات...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Public Checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_public"
            id="is_public"
            className="rounded"
          />
          <label htmlFor="is_public" className="text-sm">
            السماح بعرض هذه الشكوى للجمهور
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              "إرسال الشكوى"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  );
}

