"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { uploadDeputyBannerAction } from "@/data/deputy/banner";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

interface DeputyBannerUploadProps {
  currentImageUrl: string;
}

export function DeputyBannerUpload({ currentImageUrl }: DeputyBannerUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { execute, isExecuting } = useAction(uploadDeputyBannerAction, {
    onSuccess: ({ data }) => {
      toast.success((data as any)?.message || "تم تحديث البانر بنجاح");
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
      {/* Current Banner */}
      <Card>
        <CardHeader>
          <CardTitle>البانر الحالي</CardTitle>
          <CardDescription>
            الصورة المعروضة حالياً أعلى صفحتك الشخصية
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full aspect-[1920/400] rounded-lg overflow-hidden border">
            <Image
              src={currentImageUrl}
              alt="البانر الحالي"
              fill
              className="object-cover"
            />
          </div>
        </CardContent>
      </Card>

      {/* Upload New Banner */}
      <Card>
        <CardHeader>
          <CardTitle>رفع بانر جديد</CardTitle>
          <CardDescription>
            اختر صورة جديدة للبانر (يُفضل أن تكون بأبعاد 1920x400 بكسل)
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
              <p className="text-xs text-muted-foreground">
                الحد الأقصى: 5 ميجابايت | الصيغ المدعومة: JPG, PNG, WebP
              </p>
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
              <div className="relative w-full aspect-[1920/400] rounded-lg overflow-hidden border">
                <Image
                  src={previewUrl}
                  alt="معاينة البانر الجديد"
                  fill
                  className="object-cover"
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
                      تحديث البانر
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
    </div>
  );
}

