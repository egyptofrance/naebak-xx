"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

type DeputyDataFormProps = {
  deputyProfile: any;
};

export function DeputyDataForm({ deputyProfile }: DeputyDataFormProps) {
  const [deputyStatus, setDeputyStatus] = useState(deputyProfile.deputy_status || "");
  const [electoralSymbol, setElectoralSymbol] = useState(deputyProfile.electoral_symbol || "");
  const [electoralNumber, setElectoralNumber] = useState(deputyProfile.electoral_number || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // TODO: Create server action to update deputy profile
      // For now, just show success message
      toast.success("سيتم إضافة وظيفة الحفظ قريباً");
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("فشل حفظ التغييرات");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Deputy Status */}
      <div className="space-y-2">
        <Label htmlFor="deputy_status">حالة النائب *</Label>
        <Select value={deputyStatus} onValueChange={setDeputyStatus}>
          <SelectTrigger>
            <SelectValue placeholder="اختر الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">نائب حالي</SelectItem>
            <SelectItem value="candidate">مرشح</SelectItem>
            <SelectItem value="former">نائب سابق</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Council */}
      <div className="space-y-2">
        <Label htmlFor="council">المجلس</Label>
        <p className="text-sm text-muted-foreground">
          سيتم إضافة قائمة المجالس قريباً
        </p>
      </div>

      {/* Electoral Symbol */}
      <div className="space-y-2">
        <Label htmlFor="electoral_symbol">الرمز الانتخابي</Label>
        <Input
          id="electoral_symbol"
          value={electoralSymbol}
          onChange={(e) => setElectoralSymbol(e.target.value)}
          placeholder="مثال: الأسد"
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
        />
      </div>

      {/* Electoral Districts */}
      <div className="space-y-2">
        <Label>الدوائر الانتخابية</Label>
        <p className="text-sm text-muted-foreground">
          سيتم إضافة إمكانية إدارة الدوائر الانتخابية قريباً
        </p>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
      </div>
    </div>
  );
}

