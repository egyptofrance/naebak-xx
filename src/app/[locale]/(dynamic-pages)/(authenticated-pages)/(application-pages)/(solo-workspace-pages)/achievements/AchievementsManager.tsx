"use client";

import { DeputyContentItemManager, type ContentItem } from "@/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/deputies/DeputyContentItemManager";
import { Button } from "@/components/ui/button";
import {
  createAchievementAction,
  deleteAchievementAction,
  getAchievementsAction,
  updateAchievementAction,
} from "@/data/admin/deputy-content";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type AchievementsManagerProps = {
  deputyId: string;
};

export function AchievementsManager({ deputyId }: AchievementsManagerProps) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [originalItems, setOriginalItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing items
  useEffect(() => {
    async function loadItems() {
      setIsLoading(true);
      const result = await getAchievementsAction({ deputyId });
      
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
      // Find items to delete
      const itemsToDelete = originalItems.filter(
        (original) => !items.find((item) => item.id === original.id)
      );

      // Delete removed items
      for (const item of itemsToDelete) {
        if (item.id) {
          await deleteAchievementAction({ id: item.id });
        }
      }

      // Create or update items
      for (const item of items) {
        if (item.id) {
          await updateAchievementAction({
            id: item.id,
            title: item.title,
            description: item.description,
            imageUrl: item.imageUrl,
            displayOrder: item.displayOrder || 0,
          });
        } else {
          await createAchievementAction({
            deputyId,
            title: item.title,
            description: item.description,
            imageUrl: item.imageUrl,
            displayOrder: item.displayOrder || 0,
          });
        }
      }

      toast.success("تم حفظ التغييرات بنجاح!");
      
      // Reload items
      const result = await getAchievementsAction({ deputyId });
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
        title="الإنجازات"
        items={items}
        onChange={setItems}
        placeholder={{
          title: "مثال: افتتاح مستشفى جديد",
          description: "وصف الإنجاز...",
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

