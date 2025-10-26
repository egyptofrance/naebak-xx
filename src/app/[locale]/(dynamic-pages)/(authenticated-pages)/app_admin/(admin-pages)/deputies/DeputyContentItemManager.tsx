"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadDeputyContentImageAction } from "@/data/deputy/content-upload";
import { Plus, Trash2, Upload, Loader2, X } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRef, useState } from "react";
import { toast } from "sonner";

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
        setUploadingIndex(null);
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "فشل رفع الصورة");
      setUploadingIndex(null);
    },
  });

  const handleFileSelect = async (index: number, file: File) => {
    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error("الرجاء اختيار ملف صورة");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
      return;
    }

    setUploadingIndex(index);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        
        // Upload to server
        uploadImage({
          fileData: base64Data,
          fileName: file.name,
          fileType: file.type,
        });
      };
      reader.onerror = () => {
        toast.error("فشل قراءة الملف");
        setUploadingIndex(null);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("فشل معالجة الصورة");
      setUploadingIndex(null);
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
            className="p-4 border rounded-lg space-y-4 relative bg-card"
          >
            {/* Delete Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeItem(index)}
              className="absolute top-2 left-2 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div className="space-y-1">
              <Label className="text-sm">العنوان *</Label>
              <Input
                placeholder={placeholder.title || "مثال: تحسين التعليم"}
                value={item.title}
                onChange={(e) => updateItem(index, "title", e.target.value)}
                className="text-right"
              />
            </div>

            <div className="space-y-1">
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

            {/* Image Upload */}
            <div className="space-y-2">
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

              {/* Image preview or upload button */}
              {item.imageUrl ? (
                <div className="relative inline-block">
                  <img
                    src={item.imageUrl}
                    alt="معاينة"
                    className="w-full max-w-md h-48 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => triggerFileInput(index)}
                    disabled={uploadingIndex === index && isExecuting}
                    className="w-full gap-2"
                  >
                    {uploadingIndex === index && isExecuting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        جاري الرفع...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        رفع صورة من جهازك
                      </>
                    )}
                  </Button>

                  <div className="relative flex items-center">
                    <div className="flex-grow border-t border-muted"></div>
                    <span className="flex-shrink mx-4 text-muted-foreground text-sm">
                      أو
                    </span>
                    <div className="flex-grow border-t border-muted"></div>
                  </div>

                  <Input
                    placeholder={placeholder.image || "أدخل رابط الصورة..."}
                    value={item.imageUrl}
                    onChange={(e) => updateItem(index, "imageUrl", e.target.value)}
                    className="text-right"
                  />
                  <p className="text-xs text-muted-foreground">
                    يمكنك رفع صورة من جهازك (حد أقصى 5 ميجابايت) أو إدخال رابط صورة
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

