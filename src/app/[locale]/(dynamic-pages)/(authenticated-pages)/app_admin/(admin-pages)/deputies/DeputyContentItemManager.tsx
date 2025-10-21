"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadImageAction } from "@/data/admin/user";
import { Plus, Trash2, Image as ImageIcon, Upload, Loader2 } from "lucide-react";
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

  const { execute: uploadImage } = useAction(uploadImageAction, {
    onSuccess: ({ data }) => {
      if (data?.status === "success" && data.data && uploadingIndex !== null) {
        // Update the image URL immediately
        const updatedItems = [...items];
        updatedItems[uploadingIndex] = {
          ...updatedItems[uploadingIndex],
          imageUrl: data.data,
        };
        onChange(updatedItems);
        toast.success("تم رفع الصورة بنجاح!");
        setUploadingIndex(null);
      } else {
        toast.error("فشل رفع الصورة");
        setUploadingIndex(null);
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "فشل رفع الصورة");
      setUploadingIndex(null);
    },
  });

  const addNewItem = () => {
    const newItem: ContentItem = {
      title: "",
      description: "",
      imageUrl: "",
      displayOrder: items.length,
    };
    onChange([...items, newItem]);
  };

  const updateItem = (index: number, field: keyof ContentItem, value: string) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    onChange(updatedItems);
  };

  const removeItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    // Update display order
    const reorderedItems = updatedItems.map((item, i) => ({
      ...item,
      displayOrder: i,
    }));
    onChange(reorderedItems);
  };

  const handleFileSelect = async (index: number, file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("الرجاء اختيار ملف صورة");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
      return;
    }

    setUploadingIndex(index);

    const formData = new FormData();
    formData.append("file", file);

    // Generate filename from item title or use timestamp
    const item = items[index];
    const fileName = item.title
      ? `deputy-${item.title}-${Date.now()}`
      : `deputy-image-${Date.now()}`;

    uploadImage({
      formData: formData as any,
      fileName,
      fileOptions: {
        cacheControl: "3600",
        upsert: false,
      },
    });
  };

  const triggerFileInput = (index: number) => {
    fileInputRefs.current[index]?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">{title}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addNewItem}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          إضافة
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/20">
          <p className="text-sm text-muted-foreground">
            لا توجد عناصر. اضغط على "إضافة" لإضافة عنصر جديد.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((item, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg space-y-3 bg-muted/10 relative"
            >
              {/* Remove button */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  العنصر {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor={`item-${index}-title`} className="text-sm">
                  العنوان *
                </Label>
                <Input
                  id={`item-${index}-title`}
                  value={item.title}
                  onChange={(e) => updateItem(index, "title", e.target.value)}
                  placeholder={placeholder.title || "أدخل العنوان..."}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor={`item-${index}-description`} className="text-sm">
                  الوصف
                </Label>
                <Textarea
                  id={`item-${index}-description`}
                  value={item.description}
                  onChange={(e) => updateItem(index, "description", e.target.value)}
                  placeholder={placeholder.description || "أدخل الوصف..."}
                  rows={3}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-1.5">
                <Label className="text-sm">الصورة</Label>
                
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={(el) => { fileInputRefs.current[index] = el; }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileSelect(index, file);
                    }
                  }}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex gap-2">
                  {/* Upload button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => triggerFileInput(index)}
                    disabled={uploadingIndex === index}
                    className="gap-2"
                  >
                    {uploadingIndex === index ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري الرفع...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        رفع صورة
                      </>
                    )}
                  </Button>

                  {/* Image preview */}
                  {item.imageUrl && (
                    <div className="w-16 h-16 border rounded overflow-hidden flex-shrink-0">
                      <img
                        src={item.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  {!item.imageUrl && (
                    <div className="w-16 h-16 border rounded flex items-center justify-center bg-muted flex-shrink-0">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Manual URL input (optional) */}
                <details className="mt-2">
                  <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                    أو أدخل رابط صورة يدوياً
                  </summary>
                  <div className="mt-2">
                    <Input
                      id={`item-${index}-image`}
                      value={item.imageUrl}
                      onChange={(e) => updateItem(index, "imageUrl", e.target.value)}
                      placeholder={placeholder.image || "أدخل رابط الصورة..."}
                      dir="ltr"
                      className="text-sm"
                    />
                  </div>
                </details>

                <p className="text-xs text-muted-foreground">
                  اضغط "رفع صورة" لاختيار صورة من جهازك (حد أقصى 5 ميجابايت)
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

