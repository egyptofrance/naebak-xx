"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { updateDeputyAction } from "@/data/admin/deputies";
import {
  createElectoralProgramAction,
  createAchievementAction,
  createEventAction,
  updateElectoralProgramAction,
  updateAchievementAction,
  updateEventAction,
  deleteElectoralProgramAction,
  deleteAchievementAction,
  deleteEventAction,
  getElectoralProgramsAction,
  getAchievementsAction,
  getEventsAction,
} from "@/data/admin/deputy-content";
import { Edit } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  DeputyContentItemManager,
  ContentItem,
} from "./DeputyContentItemManager";

type Council = {
  id: string;
  name_ar: string;
  name_en: string | null;
  code: string | null;
};

type EditDeputyDialogProps = {
  deputyId: string;
  currentData: {
    deputyStatus: string;
    electoralProgram: string | null;
    achievements: string | null;
    events: string | null;
    councilId: string | null;
    electoralSymbol: string | null;
    electoralNumber: string | null;
  };
  councils: Council[];
};

export function EditDeputyDialog({
  deputyId,
  currentData,
  councils = [],
}: EditDeputyDialogProps) {
  const [open, setOpen] = useState(false);
  const [deputyStatus, setDeputyStatus] = useState(currentData.deputyStatus || "current");
  const [electoralProgram, setElectoralProgram] = useState(
    currentData.electoralProgram || ""
  );
  const [achievements, setAchievements] = useState(
    currentData.achievements || ""
  );
  const [events, setEvents] = useState(currentData.events || "");
  const [councilId, setCouncilId] = useState(currentData.councilId || "none");
  const [electoralSymbol, setElectoralSymbol] = useState(
    currentData.electoralSymbol || ""
  );
  const [electoralNumber, setElectoralNumber] = useState(
    currentData.electoralNumber || ""
  );
  
  // New structured content states
  const [electoralProgramItems, setElectoralProgramItems] = useState<ContentItem[]>([]);
  const [achievementItems, setAchievementItems] = useState<ContentItem[]>([]);
  const [eventItems, setEventItems] = useState<ContentItem[]>([]);
  
  // Track original items to detect deletions
  const [originalElectoralProgramIds, setOriginalElectoralProgramIds] = useState<Set<string>>(new Set());
  const [originalAchievementIds, setOriginalAchievementIds] = useState<Set<string>>(new Set());
  const [originalEventIds, setOriginalEventIds] = useState<Set<string>>(new Set());
  
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const toastRef = useRef<string | number | undefined>(undefined);

  // Load existing content items when dialog opens
  useEffect(() => {
    if (open) {
      // Reset basic fields
      setDeputyStatus(currentData.deputyStatus || "current");
      setElectoralProgram(currentData.electoralProgram || "");
      setAchievements(currentData.achievements || "");
      setEvents(currentData.events || "");
      setCouncilId(currentData.councilId || "none");
      setElectoralSymbol(currentData.electoralSymbol || "");
      setElectoralNumber(currentData.electoralNumber || "");
      
      // Load structured content from database
      loadContentItems();
    }
  }, [open, deputyId]);

  const loadContentItems = async () => {
    setIsLoadingContent(true);
    try {
      // Load electoral programs
      const programsResult = await getElectoralProgramsAction({ deputyId });
      if (programsResult?.data?.data) {
        const programs = programsResult.data.data.map((item: any) => ({
          id: item.id,
          title: item.title || "",
          description: item.description || "",
          imageUrl: item.image_url || "",
          displayOrder: item.display_order || 0,
        }));
        setElectoralProgramItems(programs);
        setOriginalElectoralProgramIds(new Set(programs.map((p: ContentItem) => p.id!)));
      }

      // Load achievements
      const achievementsResult = await getAchievementsAction({ deputyId });
      if (achievementsResult?.data?.data) {
        const achievements = achievementsResult.data.data.map((item: any) => ({
          id: item.id,
          title: item.title || "",
          description: item.description || "",
          imageUrl: item.image_url || "",
          displayOrder: item.display_order || 0,
        }));
        setAchievementItems(achievements);
        setOriginalAchievementIds(new Set(achievements.map((a: ContentItem) => a.id!)));
      }

      // Load events
      const eventsResult = await getEventsAction({ deputyId });
      if (eventsResult?.data?.data) {
        const events = eventsResult.data.data.map((item: any) => ({
          id: item.id,
          title: item.title || "",
          description: item.description || "",
          imageUrl: item.image_url || "",
          displayOrder: item.display_order || 0,
        }));
        setEventItems(events);
        setOriginalEventIds(new Set(events.map((e: ContentItem) => e.id!)));
      }
    } catch (error) {
      console.error("Error loading content items:", error);
      toast.error("فشل تحميل المحتوى التفصيلي");
    } finally {
      setIsLoadingContent(false);
    }
  };

  const { execute: updateDeputy, isPending } = useAction(updateDeputyAction, {
    onExecute: () => {
      toastRef.current = toast.loading("جاري تحديث البيانات...");
    },
    onSuccess: async ({ data }) => {
      // Save/Update/Delete content items
      try {
        // Process electoral programs
        const currentProgramIds = new Set(electoralProgramItems.filter(i => i.id).map(i => i.id!));
        
        // Delete removed items
        for (const id of originalElectoralProgramIds) {
          if (!currentProgramIds.has(id)) {
            await deleteElectoralProgramAction({ id });
          }
        }
        
        // Create or update items
        for (const item of electoralProgramItems) {
          if (!item.title.trim()) continue; // Skip empty items
          
          if (item.id) {
            // Update existing item
            await updateElectoralProgramAction({
              id: item.id,
              title: item.title,
              description: item.description || undefined,
              imageUrl: item.imageUrl || undefined,
              displayOrder: item.displayOrder,
            });
          } else {
            // Create new item
            await createElectoralProgramAction({
              deputyId,
              title: item.title,
              description: item.description || undefined,
              imageUrl: item.imageUrl || undefined,
              displayOrder: item.displayOrder || 0,
            });
          }
        }
        
        // Process achievements
        const currentAchievementIds = new Set(achievementItems.filter(i => i.id).map(i => i.id!));
        
        // Delete removed items
        for (const id of originalAchievementIds) {
          if (!currentAchievementIds.has(id)) {
            await deleteAchievementAction({ id });
          }
        }
        
        // Create or update items
        for (const item of achievementItems) {
          if (!item.title.trim()) continue;
          
          if (item.id) {
            await updateAchievementAction({
              id: item.id,
              title: item.title,
              description: item.description || undefined,
              imageUrl: item.imageUrl || undefined,
              displayOrder: item.displayOrder,
            });
          } else {
            await createAchievementAction({
              deputyId,
              title: item.title,
              description: item.description || undefined,
              imageUrl: item.imageUrl || undefined,
              displayOrder: item.displayOrder || 0,
            });
          }
        }
        
        // Process events
        const currentEventIds = new Set(eventItems.filter(i => i.id).map(i => i.id!));
        
        // Delete removed items
        for (const id of originalEventIds) {
          if (!currentEventIds.has(id)) {
            await deleteEventAction({ id });
          }
        }
        
        // Create or update items
        for (const item of eventItems) {
          if (!item.title.trim()) continue;
          
          if (item.id) {
            await updateEventAction({
              id: item.id,
              title: item.title,
              description: item.description || undefined,
              imageUrl: item.imageUrl || undefined,
              displayOrder: item.displayOrder,
            });
          } else {
            await createEventAction({
              deputyId,
              title: item.title,
              description: item.description || undefined,
              imageUrl: item.imageUrl || undefined,
              displayOrder: item.displayOrder || 0,
            });
          }
        }
        
        toast.success("تم تحديث بيانات النائب بنجاح!", {
          id: toastRef.current,
        });
      } catch (error) {
        console.error("Error saving content:", error);
        toast.error("تم تحديث البيانات الأساسية، لكن حدث خطأ في حفظ بعض المحتويات", {
          id: toastRef.current,
        });
      }
      
      toastRef.current = undefined;
      setOpen(false);
      // Refresh the page to show updated data
      window.location.reload();
    },
    onError: ({ error }) => {
      const errorMessage = error.serverError ?? "فشل تحديث البيانات";
      toast.error(errorMessage, {
        id: toastRef.current,
      });
      toastRef.current = undefined;
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateDeputy({
      deputyId,
      deputyStatus: deputyStatus as "current" | "candidate" | "former",
      electoralProgram: electoralProgram.trim() || undefined,
      achievements: achievements.trim() || undefined,
      events: events.trim() || undefined,
      councilId: councilId === "none" ? null : councilId || null,
      electoralSymbol: electoralSymbol.trim() || undefined,
      electoralNumber: electoralNumber.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>تعديل بيانات النائب</DialogTitle>
            <DialogDescription>
              قم بتعديل البيانات الانتخابية والمعلومات الخاصة بالنائب.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">البيانات الأساسية</TabsTrigger>
              <TabsTrigger value="content">المحتوى التفصيلي</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 py-4">
              {/* Deputy Status */}
              <div className="space-y-2">
                <Label htmlFor="deputy_status">الحالة *</Label>
                <Select value={deputyStatus} onValueChange={setDeputyStatus}>
                  <SelectTrigger id="deputy_status">
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">نائب حالي</SelectItem>
                    <SelectItem value="candidate">مرشح للعضوية</SelectItem>
                    <SelectItem value="former">نائب سابق</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Council */}
              <div className="space-y-2">
                <Label htmlFor="council_id">المجلس</Label>
                <Select value={councilId} onValueChange={setCouncilId}>
                  <SelectTrigger id="council_id">
                    <SelectValue placeholder="اختر المجلس" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون مجلس</SelectItem>
                    {councils.map((council) => (
                      <SelectItem key={council.id} value={council.id}>
                        {council.name_ar}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Electoral Symbol */}
              <div className="space-y-2">
                <Label htmlFor="electoral_symbol">الرمز الانتخابي</Label>
                <Input
                  id="electoral_symbol"
                  value={electoralSymbol}
                  onChange={(e) => setElectoralSymbol(e.target.value)}
                  placeholder="مثال: الأسد، النخلة، الهلال"
                />
              </div>

              {/* Electoral Number */}
              <div className="space-y-2">
                <Label htmlFor="electoral_number">الرقم الانتخابي</Label>
                <Input
                  id="electoral_number"
                  value={electoralNumber}
                  onChange={(e) => setElectoralNumber(e.target.value)}
                  placeholder="مثال: 123"
                  dir="ltr"
                />
              </div>


            </TabsContent>
            
            <TabsContent value="content" className="space-y-6 py-4">
              {isLoadingContent ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">جاري تحميل المحتوى...</p>
                </div>
              ) : (
                <>
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>المحتوى التفصيلي:</strong> يمكنك هنا إضافة عناصر متعددة لكل قسم، 
                      حيث يحتوي كل عنصر على عنوان ووصف وصورة منفصلة. التعديلات تُحفظ تلقائياً عند الضغط على "حفظ التغييرات".
                    </p>
                  </div>

                  {/* Electoral Programs */}
                  <DeputyContentItemManager
                    title="البرنامج الانتخابي"
                    items={electoralProgramItems}
                    onChange={setElectoralProgramItems}
                    placeholder={{
                      title: "مثال: تطوير البنية التحتية",
                      description: "وصف تفصيلي للبند من البرنامج الانتخابي...",
                      image: "https://example.com/image.jpg",
                    }}
                  />

                  <Separator />

                  {/* Achievements */}
                  <DeputyContentItemManager
                    title="الإنجازات"
                    items={achievementItems}
                    onChange={setAchievementItems}
                    placeholder={{
                      title: "مثال: افتتاح مستشفى جديد",
                      description: "تفاصيل الإنجاز...",
                      image: "https://example.com/achievement.jpg",
                    }}
                  />

                  <Separator />

                  {/* Events */}
                  <DeputyContentItemManager
                    title="المناسبات"
                    items={eventItems}
                    onChange={setEventItems}
                    placeholder={{
                      title: "مثال: لقاء مع المواطنين",
                      description: "تفاصيل المناسبة...",
                      image: "https://example.com/event.jpg",
                    }}
                  />
                </>
              )}
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              className="flex-1 min-w-[120px]"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              className="flex-1 min-w-[120px]"
              disabled={isPending || isLoadingContent}
            >
              {isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

