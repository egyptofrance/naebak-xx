"use client";

import { createComplaintAction } from "@/data/complaints/complaints";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseUserClientComponent } from "@/supabase-clients/user/supabaseUserClientComponent";
import { Upload, X, FileIcon } from "lucide-react";

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

interface AttachmentFile {
  file: File;
  preview?: string;
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
        setError(`الملف ${file.name} أكبر من 10 ميجابايت`);
        return false;
      }
      return true;
    });

    // Check total number of files
    if (attachments.length + validFiles.length > 5) {
      setError("يمكنك رفع 5 ملفات كحد أقصى");
      return;
    }

    const newAttachments: AttachmentFile[] = validFiles.map(file => {
      const attachment: AttachmentFile = { file };
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          attachment.preview = reader.result as string;
          setAttachments(prev => [...prev]);
        };
        reader.readAsDataURL(file);
      }
      
      return attachment;
    });

    setAttachments(prev => [...prev, ...newAttachments]);
    setError("");
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  async function uploadAttachments(complaintId: string, userId: string) {
    const supabase = supabaseUserClientComponent;
    const uploadedFiles: any[] = [];

    for (let i = 0; i < attachments.length; i++) {
      const attachment = attachments[i];
      const file = attachment.file;
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}_${randomString}.${fileExt}`;
      const filePath = `${userId}/${complaintId}/${fileName}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('complaint_attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`فشل رفع الملف: ${file.name}`);
      }

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('complaint_attachments')
        .insert({
          complaint_id: complaintId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          uploaded_by: userId
        });

      if (dbError) {
        console.error('Database error:', dbError);
        // Try to delete the uploaded file
        await supabase.storage
          .from('complaint_attachments')
          .remove([filePath]);
        throw new Error(`فشل حفظ بيانات الملف: ${file.name}`);
      }

      uploadedFiles.push({ fileName: file.name, filePath });
      setUploadProgress(((i + 1) / attachments.length) * 100);
    }

    return uploadedFiles;
  }

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
        governorate: formData.get("governorate") as string || undefined,
        district: formData.get("district") as string || undefined,
        address: formData.get("address") as string || undefined,
        citizen_phone: formData.get("citizen_phone") as string || undefined,
        citizen_email: formData.get("citizen_email") as string || undefined,
        is_public: formData.get("is_public") === "on",
      };

      // Create complaint
      const result = await createComplaintAction(data);

      if (result?.serverError || result?.validationErrors) {
        setError(result.serverError || "حدث خطأ في التحقق من البيانات");
        setLoading(false);
        return;
      }

      // Upload attachments if any
      if (attachments.length > 0 && result?.data?.id) {
        const supabase = supabaseUserClientComponent;
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          await uploadAttachments(result.data.id, user.id);
        }
      }

      router.push("/complaints");
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء إنشاء الشكوى");
      setLoading(false);
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">إضافة شكوى جديدة</h1>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>جاري رفع المرفقات...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
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
            dir="rtl"
            className="w-full px-3 py-2 pr-10 border rounded-md appearance-none bg-white"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
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
              dir="rtl"
              className="w-full px-3 py-2 pr-10 border rounded-md appearance-none bg-white"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundPosition: 'left 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em'
              }}
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

        {/* Attachments Section */}
        <div className="border-t pt-4 mt-4">
          <label className="block text-sm font-medium mb-2">
            المرفقات (اختياري)
          </label>
          <p className="text-xs text-muted-foreground mb-3">
            يمكنك إرفاق صور أو مستندات توضح المشكلة (حد أقصى 5 ملفات، 10 ميجابايت لكل ملف)
          </p>

          <div className="space-y-3">
            {/* Upload Button */}
            <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-md cursor-pointer hover:bg-secondary/50 transition-colors">
              <Upload className="h-5 w-5" />
              <span>اختر ملفات للرفع</span>
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,video/*,audio/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading || attachments.length >= 5}
              />
            </label>

            {/* Attachments List */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border rounded-md bg-secondary/20"
                  >
                    {attachment.preview ? (
                      <img
                        src={attachment.preview}
                        alt={attachment.file.name}
                        className="h-12 w-12 object-cover rounded"
                      />
                    ) : (
                      <div className="h-12 w-12 flex items-center justify-center bg-secondary rounded">
                        <FileIcon className="h-6 w-6" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {attachment.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.file.size)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="p-1 hover:bg-destructive/10 rounded"
                      disabled={loading}
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
            disabled={loading}
            className="px-6 py-2 border rounded-md hover:bg-secondary disabled:opacity-50"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}

