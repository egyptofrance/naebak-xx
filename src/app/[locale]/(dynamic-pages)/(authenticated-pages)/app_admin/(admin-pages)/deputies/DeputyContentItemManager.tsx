"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";

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

              {/* Image URL Input */}
              <div className="space-y-1.5">
                <Label htmlFor={`item-${index}-image`} className="text-sm">
                  رابط الصورة
                </Label>
                
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      id={`item-${index}-image`}
                      value={item.imageUrl}
                      onChange={(e) => updateItem(index, "imageUrl", e.target.value)}
                      placeholder={placeholder.image || "أدخل رابط الصورة..."}
                      dir="ltr"
                    />
                  </div>

                  {/* Image preview */}
                  {item.imageUrl ? (
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
                  ) : (
                    <div className="w-16 h-16 border rounded flex items-center justify-center bg-muted flex-shrink-0">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  أدخل رابط الصورة (URL) من الإنترنت
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

