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
      
      // Load structured content (for future implementation)
      // For now, we'll start with empty arrays
      setElectoralProgramItems([]);
      setAchievementItems([]);
      setEventItems([]);
    }
  }, [open, currentData]);

  const { execute: updateDeputy, isPending } = useAction(updateDeputyAction, {
    onExecute: () => {
      toastRef.current = toast.loading("جاري تحديث البيانات...");
    },
    onSuccess: async ({ data }) => {
      // Save new content items
      try {
        // Save electoral programs
        for (const item of electoralProgramItems) {
          if (!item.id && item.title.trim()) {
            await createElectoralProgramAction({
              deputyId,
              title: item.title,
              description: item.description || undefined,
              imageUrl: item.imageUrl || undefined,
              displayOrder: item.displayOrder || 0,
            });
          }
        }
        
        // Save achievements
        for (const item of achievementItems) {
          if (!item.id && item.title.trim()) {
            await createAchievementAction({
              deputyId,
              title: item.title,
              description: item.description || undefined,
              imageUrl: item.imageUrl || undefined,
              displayOrder: item.displayOrder || 0,
            });
          }
        }
        
        // Save events
        for (const item of eventItems) {
          if (!item.id && item.title.trim()) {
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

              <Separator className="my-4" />
              
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>ملاحظة:</strong> الحقول التالية هي حقول نصية بسيطة للتوافق مع النظام القديم.
                </p>
                <p className="text-sm text-muted-foreground">
                  للحصول على تجربة أفضل مع إمكانية إضافة عناصر متعددة بصور، استخدم تبويب "المحتوى التفصيلي".
                </p>
              </div>

              {/* Electoral Program */}
              <div className="space-y-2">
                <Label htmlFor="electoral_program">البرنامج الانتخابي (نص بسيط)</Label>
                <Textarea
                  id="electoral_program"
                  value={electoralProgram}
                  onChange={(e) => setElectoralProgram(e.target.value)}
                  placeholder="أدخل البرنامج الانتخابي للنائب..."
                  rows={4}
                />
              </div>

              {/* Achievements */}
              <div className="space-y-2">
                <Label htmlFor="achievements">الإنجازات (نص بسيط)</Label>
                <Textarea
                  id="achievements"
                  value={achievements}
                  onChange={(e) => setAchievements(e.target.value)}
                  placeholder="أدخل إنجازات النائب..."
                  rows={4}
                />
              </div>

              {/* Events */}
              <div className="space-y-2">
                <Label htmlFor="events">المناسبات (نص بسيط)</Label>
                <Textarea
                  id="events"
                  value={events}
                  onChange={(e) => setEvents(e.target.value)}
                  placeholder="أدخل المناسبات والفعاليات..."
                  rows={4}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="content" className="space-y-6 py-4">
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>المحتوى التفصيلي:</strong> يمكنك هنا إضافة عناصر متعددة لكل قسم، 
                  حيث يحتوي كل عنصر على عنوان ووصف وصورة منفصلة.
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
              disabled={isPending}
            >
              {isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

