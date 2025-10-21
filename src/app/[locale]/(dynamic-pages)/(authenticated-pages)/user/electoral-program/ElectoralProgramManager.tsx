"use client";

import { DeputyContentItemManager, type ContentItem } from "@/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/deputies/DeputyContentItemManager";
import { Button } from "@/components/ui/button";
import {
  createElectoralProgramAction,
  deleteElectoralProgramAction,
  getElectoralProgramsAction,
  updateElectoralProgramAction,
} from "@/data/admin/deputy-content";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type ElectoralProgramManagerProps = {
  deputyId: string;
};

export function ElectoralProgramManager({ deputyId }: ElectoralProgramManagerProps) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [originalItems, setOriginalItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing items
  useEffect(() => {
    async function loadItems() {
      setIsLoading(true);
      const result = await getElectoralProgramsAction({ deputyId });
      
      if (result?.data?.success && result.data.data) {
        const loadedItems: ContentItem[] = result.data.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description || "",
          imageUrl: item.image_url || "",
          displayOrder: item.display_order,
        }));
        setItems(loadedItems);
        setOriginalItems(loadedItems);
      }
      setIsLoading(false);
    }
    loadItems();
  }, [deputyId]);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Find items to delete (in original but not in current)
      const itemsToDelete = originalItems.filter(
        (original) => !items.find((item) => item.id === original.id)
      );

      // Delete removed items
      for (const item of itemsToDelete) {
        if (item.id) {
          await deleteElectoralProgramAction({ id: item.id });
        }
      }

      // Create or update items
      for (const item of items) {
        if (item.id) {
          // Update existing item
          await updateElectoralProgramAction({
            id: item.id,
            title: item.title,
            description: item.description,
            imageUrl: item.imageUrl,
            displayOrder: item.displayOrder || 0,
          });
        } else {
          // Create new item
          await createElectoralProgramAction({
            deputyId,
            title: item.title,
            description: item.description,
            imageUrl: item.imageUrl,
            displayOrder: item.displayOrder || 0,
          });
        }
      }

      toast.success("تم حفظ التغييرات بنجاح!");
      
      // Reload items to get updated data
      const result = await getElectoralProgramsAction({ deputyId });
      if (result?.data?.success && result.data.data) {
        const loadedItems: ContentItem[] = result.data.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description || "",
          imageUrl: item.image_url || "",
          displayOrder: item.display_order,
        }));
        setItems(loadedItems);
        setOriginalItems(loadedItems);
      }
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("فشل حفظ التغييرات");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <p className="text-center text-muted-foreground">جاري تحميل البيانات...</p>;
  }

  return (
    <div className="space-y-6">
      <DeputyContentItemManager
        title="بنود البرنامج الانتخابي"
        items={items}
        onChange={setItems}
        placeholder={{
          title: "مثال: تحسين التعليم",
          description: "وصف البند...",
          image: "رابط الصورة...",
        }}
      />

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
      </div>
    </div>
  );
}

