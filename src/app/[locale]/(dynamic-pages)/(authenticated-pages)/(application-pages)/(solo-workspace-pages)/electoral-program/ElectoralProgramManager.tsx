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

  // Debug: Log deputyId
  useEffect(() => {
    console.log("[ElectoralProgramManager] deputyId:", deputyId);
  }, [deputyId]);

  // Load existing items
  useEffect(() => {
    async function loadItems() {
      setIsLoading(true);
      console.log("[ElectoralProgramManager] Loading items for deputyId:", deputyId);
      
      const result = await getElectoralProgramsAction({ deputyId });
      console.log("[ElectoralProgramManager] Load result:", result);
      
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
        console.log("[ElectoralProgramManager] Loaded items:", loadedItems.length);
      } else if (result?.serverError) {
        console.error("[ElectoralProgramManager] Server error:", result.serverError);
        toast.error(`خطأ في تحميل البيانات: ${result.serverError}`);
      } else if (result?.validationErrors) {
        console.error("[ElectoralProgramManager] Validation errors:", result.validationErrors);
        toast.error("خطأ في البيانات المُرسلة");
      }
      setIsLoading(false);
    }
    loadItems();
  }, [deputyId]);

  const handleSave = async () => {
    console.log("[ElectoralProgramManager] Saving...", { deputyId, itemsCount: items.length });
    setIsSaving(true);

    try {
      // Find items to delete (in original but not in current)
      const itemsToDelete = originalItems.filter(
        (original) => !items.find((item) => item.id === original.id)
      );

      // Delete removed items
      for (const item of itemsToDelete) {
        if (item.id) {
          const deleteResult = await deleteElectoralProgramAction({ id: item.id });
          console.log("[ElectoralProgramManager] Delete result:", deleteResult);
          if (deleteResult?.serverError) {
            throw new Error(deleteResult.serverError);
          }
        }
      }

      // Create or update items
      for (const item of items) {
        if (item.id) {
          // Update existing item
          const updateResult = await updateElectoralProgramAction({
            id: item.id,
            title: item.title,
            description: item.description,
            imageUrl: item.imageUrl,
            displayOrder: item.displayOrder || 0,
          });
          console.log("[ElectoralProgramManager] Update result:", updateResult);
          if (updateResult?.serverError) {
            throw new Error(updateResult.serverError);
          }
        } else {
          // Create new item
          const createResult = await createElectoralProgramAction({
            deputyId,
            title: item.title,
            description: item.description,
            imageUrl: item.imageUrl,
            displayOrder: item.displayOrder || 0,
          });
          console.log("[ElectoralProgramManager] Create result:", createResult);
          if (createResult?.serverError) {
            throw new Error(createResult.serverError);
          }
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

