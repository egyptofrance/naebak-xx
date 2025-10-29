"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Image as ImageIcon, Loader2, Share2 } from "lucide-react";
import { uploadOGImageAction } from "@/data/admin/og-image";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

interface OGImageUploadProps {
  currentImageUrl: string;
}

export function OGImageUpload({ currentImageUrl }: OGImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { execute, isExecuting } = useAction(uploadOGImageAction, {
    onSuccess: ({ data }) => {
      toast.success(data?.message || "تم تحديث صورة المشاركة بنجاح");
      setPreviewUrl(null);
      window.location.reload();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "حدث خطأ أثناء رفع الصورة");
    },
  });

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error("يرجى اختيار ملف صورة");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (!previewUrl) return;

    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    execute({
      fileData: previewUrl,
      fileName: file.name,
      fileType: file.type,
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current OG Image */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            صورة المشاركة الحالية
          </CardTitle>
          <CardDescription>
            الصورة التي تظهر عند مشاركة الموقع على واتساب، فيسبوك، تويتر، إلخ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full aspect-[1200/630] max-w-2xl rounded-lg overflow-hidden border bg-muted">
            <Image
              src={currentImageUrl}
              alt="صورة المشاركة الحالية"
              fill
              className="object-contain"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            الرابط الحالي: <code className="bg-muted px-2 py-1 rounded">{currentImageUrl}</code>
          </p>
        </CardContent>
      </Card>

      {/* Upload New OG Image */}
      <Card>
        <CardHeader>
          <CardTitle>رفع صورة مشاركة جديدة</CardTitle>
          <CardDescription>
            اختر صورة جديدة للمشاركة (يُفضل أن تكون بأبعاد 1200×630 بكسل أو 1536×1024 بكسل)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors
              ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
              ${previewUrl ? 'hidden' : 'block'}
            `}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 rounded-full bg-muted">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-medium">
                  اسحب وأفلت الصورة هنا
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  أو اضغط للاختيار من جهازك
                </p>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>الحد الأقصى: 5 ميجابايت | الصيغ المدعومة: JPG, PNG, WebP</p>
                <p className="font-medium">الأبعاد المثالية: 1200×630 بكسل (نسبة 1.91:1)</p>
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileChange(file);
            }}
          />

          {/* Preview */}
          {previewUrl && (
            <div className="space-y-4">
              <div className="relative w-full aspect-[1200/630] max-w-2xl rounded-lg overflow-hidden border bg-muted">
                <Image
                  src={previewUrl}
                  alt="معاينة صورة المشاركة الجديدة"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleUpload}
                  disabled={isExecuting}
                  className="flex-1"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      جاري الرفع...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      تحديث صورة المشاركة
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPreviewUrl(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  disabled={isExecuting}
                >
                  إلغاء
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">
            💡 ملاحظات مهمة
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <p>• <strong>الأبعاد المثالية:</strong> 1200×630 بكسل (Open Graph) أو 1536×1024 بكسل</p>
          <p>• <strong>نسبة العرض للارتفاع:</strong> 1.91:1 (مثل 1200×630)</p>
          <p>• <strong>الحجم:</strong> أقل من 5 ميجابايت</p>
          <p>• <strong>الصيغ:</strong> JPG, PNG, WebP</p>
          <p>• <strong>المحتوى:</strong> تأكد من وضوح النص والشعار في الصورة</p>
          <p>• <strong>الاختبار:</strong> بعد الرفع، شارك الرابط على واتساب للتأكد من ظهور الصورة</p>
          <p className="text-xs mt-3 pt-3 border-t border-blue-300 dark:border-blue-700">
            <strong>ملاحظة:</strong> قد يستغرق ظهور الصورة الجديدة بضع دقائق بسبب الـ cache في واتساب وفيسبوك
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
