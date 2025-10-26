"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadDeputyContentImageAction } from "@/data/deputy/content-upload";
import { Plus, Trash2, Upload, Loader2, X, Image as ImageIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRef, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";

export type ContentItem = {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  displayOrder?: number;
};

type DeputyContentItemManagerProps = {
  title: string;
  items: ContentItem[];
  onChange: (items: ContentItem[]) => void;
  placeholder?: {
    title?: string;
    description?: string;
    image?: string;
  };
};

export function DeputyContentItemManager({
  title,
  items,
  onChange,
  placeholder = {},
}: DeputyContentItemManagerProps) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [previewUrls, setPreviewUrls] = useState<{ [key: number]: string }>({});
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const { execute: uploadImage, isExecuting } = useAction(uploadDeputyContentImageAction, {
    onSuccess: ({ data }) => {
      if (data?.imageUrl && uploadingIndex !== null) {
        const updatedItems = [...items];
        updatedItems[uploadingIndex] = {
          ...updatedItems[uploadingIndex],
          imageUrl: data.imageUrl,
        };
        onChange(updatedItems);
        toast.success("تم رفع الصورة بنجاح");
        
        // Clear preview
        setPreviewUrls(prev => {
          const newPreviews = { ...prev };
          delete newPreviews[uploadingIndex];
          return newPreviews;
        });
        setUploadingIndex(null);
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "فشل رفع الصورة");
      setUploadingIndex(null);
    },
  });

  const handleFileSelect = (index: number, file: File) => {
    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error("الرجاء اختيار ملف صورة");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      setPreviewUrls(prev => ({ ...prev, [index]: base64Data }));
    };
    reader.onerror = () => {
      toast.error("فشل قراءة الملف");
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = (index: number) => {
    const file = fileInputRefs.current[index]?.files?.[0];
    if (!file || !previewUrls[index]) return;

    setUploadingIndex(index);

    uploadImage({
      fileData: previewUrls[index],
      fileName: file.name,
      fileType: file.type,
    });
  };

  const cancelPreview = (index: number) => {
    setPreviewUrls(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[index];
      return newPreviews;
    });
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]!.value = '';
    }
  };

  const triggerFileInput = (index: number) => {
    fileInputRefs.current[index]?.click();
  };

  const addItem = () => {
    onChange([
      ...items,
      {
        title: "",
        description: "",
        imageUrl: "",
      },
    ]);
  };

  const removeItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onChange(updatedItems);
    
    // Clean up preview
    setPreviewUrls(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[index];
      return newPreviews;
    });
  };

  const updateItem = (index: number, field: keyof ContentItem, value: string) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    onChange(updatedItems);
  };

  const removeImage = (index: number) => {
    updateItem(index, "imageUrl", "");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">{title}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          إضافة
        </Button>
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          <p>لا توجد عناصر. اضغط &quot;إضافة&quot; لبدء الإضافة.</p>
        </div>
      )}

      <div className="space-y-6">
        {items.map((item, index) => (
          <div
            key={index}
            className="p-6 border rounded-lg space-y-4 bg-card"
          >
            {/* Header with delete button */}
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="text-sm font-medium text-muted-foreground">
                العنصر {index + 1}
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
                className="h-8 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
                حذف
              </Button>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label className="text-sm">العنوان *</Label>
              <Input
                placeholder={placeholder.title || "مثال: تحسين التعليم"}
                value={item.title}
                onChange={(e) => updateItem(index, "title", e.target.value)}
                className="text-right"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm">الوصف</Label>
              <Textarea
                placeholder={
                  placeholder.description ||
                  "اكتب وصفاً تفصيلياً هنا..."
                }
                value={item.description}
                onChange={(e) => updateItem(index, "description", e.target.value)}
                rows={3}
                className="text-right resize-none"
              />
            </div>

            {/* Image Upload Section */}
            <div className="space-y-3">
              <Label className="text-sm">الصورة</Label>
              
              {/* Hidden file input */}
              <input
                type="file"
                ref={(el) => {
                  fileInputRefs.current[index] = el;
                }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileSelect(index, file);
                  }
                }}
                accept="image/*"
                className="hidden"
              />

              {/* Current uploaded image */}
              {item.imageUrl && !previewUrls[index] && (
                <div className="space-y-2">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                    <Image
                      src={item.imageUrl}
                      alt="الصورة الحالية"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => triggerFileInput(index)}
                      className="flex-1 gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      تغيير الصورة
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeImage(index)}
                      className="gap-2 text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                      حذف الصورة
                    </Button>
                  </div>
                </div>
              )}

              {/* Preview before upload */}
              {previewUrls[index] && (
                <div className="space-y-3">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                    <Image
                      src={previewUrls[index]}
                      alt="معاينة الصورة"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => handleUpload(index)}
                      disabled={uploadingIndex === index && isExecuting}
                      className="flex-1 gap-2"
                    >
                      {uploadingIndex === index && isExecuting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          جاري الرفع...
                        </>
                      ) : (
                        <>
                          <ImageIcon className="h-4 w-4" />
                          رفع الصورة
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => cancelPreview(index)}
                      disabled={uploadingIndex === index && isExecuting}
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              )}

              {/* Upload area (when no image) */}
              {!item.imageUrl && !previewUrls[index] && (
                <div className="space-y-3">
                  <div
                    onClick={() => triggerFileInput(index)}
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-primary hover:bg-primary/5"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-3 rounded-full bg-muted">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          اسحب وأفلت الصورة هنا
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          أو اضغط للاختيار من جهازك
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        الحد الأقصى: 5 ميجابايت | JPG, PNG, WebP
                      </p>
                    </div>
                  </div>

                  <div className="relative flex items-center">
                    <div className="flex-grow border-t border-muted"></div>
                    <span className="flex-shrink mx-4 text-muted-foreground text-xs">
                      أو أدخل رابط الصورة
                    </span>
                    <div className="flex-grow border-t border-muted"></div>
                  </div>

                  <Input
                    placeholder={placeholder.image || "https://example.com/image.jpg"}
                    value={item.imageUrl}
                    onChange={(e) => updateItem(index, "imageUrl", e.target.value)}
                    className="text-right"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

