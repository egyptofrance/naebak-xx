"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadImageAction } from "@/data/admin/user";
import { compressImage, validateImageFile, formatFileSize } from "@/utils/imageCompression";
import { Plus, Trash2, Image as ImageIcon, Upload, Loader2, X } from "lucide-react";
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
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [compressing, setCompressing] = useState(false);
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const { execute: uploadImage } = useAction(uploadImageAction, {
    onSuccess: ({ data }) => {
      if (data?.status === "success" && data.data && uploadingIndex !== null) {
        const updatedItems = [...items];
        updatedItems[uploadingIndex] = {
          ...updatedItems[uploadingIndex],
          imageUrl: data.data,
        };
        onChange(updatedItems);
        toast.success("تم رفع الصورة بنجاح!");
        setUploadingIndex(null);
        setUploadProgress(0);
        setCompressing(false);
      } else {
        toast.error(data?.message || "فشل رفع الصورة");
        setUploadingIndex(null);
        setUploadProgress(0);
        setCompressing(false);
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "فشل رفع الصورة");
      setUploadingIndex(null);
      setUploadProgress(0);
      setCompressing(false);
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
    const reorderedItems = updatedItems.map((item, i) => ({
      ...item,
      displayOrder: i,
    }));
    onChange(reorderedItems);
  };

  const removeImage = (index: number) => {
    updateItem(index, "imageUrl", "");
  };

  const handleFileSelect = async (index: number, file: File) => {
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file, 5);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setUploadingIndex(index);
    setUploadProgress(0);

    try {
      // Show compression status
      setCompressing(true);
      setUploadProgress(10);
      
      const originalSize = formatFileSize(file.size);
      
      // Compress image if larger than 1MB
      let fileToUpload = file;
      if (file.size > 1024 * 1024) {
        toast.info(`جاري ضغط الصورة (${originalSize})...`);
        fileToUpload = await compressImage(file, 1, 1920);
        const compressedSize = formatFileSize(fileToUpload.size);
        toast.success(`تم ضغط الصورة من ${originalSize} إلى ${compressedSize}`);
      }
      
      setCompressing(false);
      setUploadProgress(30);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append("file", fileToUpload);

      const item = items[index];
      const fileName = item.title
        ? `${item.title}-${Date.now()}`
        : `image-${Date.now()}`;

      uploadImage({
        formData: formData as any,
        fileName,
        fileOptions: {
          cacheControl: "3600",
          upsert: false,
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
    } catch (error) {
      toast.error("فشل معالجة الصورة");
      setUploadingIndex(null);
      setUploadProgress(0);
      setCompressing(false);
    }
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
              <div className="space-y-2">
                <Label className="text-sm">الصورة</Label>
                
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={(el) => (fileInputRefs.current[index] = el)}
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
                      alt="Preview"
                      className="w-full max-w-xs h-48 object-cover rounded-lg border"
                      onError={(e) => {
                        e.currentTarget.src = "";
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => triggerFileInput(index)}
                      disabled={uploadingIndex === index}
                      className="w-full max-w-xs"
                    >
                      {uploadingIndex === index ? (
                        <>
                          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                          {compressing ? "جاري الضغط..." : `جاري الرفع... ${uploadProgress}%`}
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 ml-2" />
                          رفع صورة من جهازك
                        </>
                      )}
                    </Button>

                    {/* Progress bar */}
                    {uploadingIndex === index && (
                      <div className="w-full max-w-xs bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}

                    {/* Or divider */}
                    <div className="flex items-center gap-2 max-w-xs">
                      <div className="flex-1 border-t" />
                      <span className="text-xs text-muted-foreground">أو</span>
                      <div className="flex-1 border-t" />
                    </div>

                    {/* Manual URL input */}
                    <Input
                      id={`item-${index}-image-url`}
                      value={item.imageUrl}
                      onChange={(e) => updateItem(index, "imageUrl", e.target.value)}
                      placeholder="أدخل رابط الصورة..."
                      dir="ltr"
                      className="max-w-xs"
                    />
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  يمكنك رفع صورة من جهازك (حد أقصى 5 ميجابايت، سيتم ضغطها تلقائياً) أو إدخال رابط صورة
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

