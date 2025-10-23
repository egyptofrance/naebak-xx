"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { assignComplaintToDeputy, getAvailableDeputies } from "@/data/complaints/complaints";
import { useRouter } from "next/navigation";
import AdvancedDeputySelector from "./AdvancedDeputySelector";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users } from "lucide-react";

interface Deputy {
  id: string;
  full_name: string;
  governorate: string;
  party?: string;
  council_type: string;
  deputy_status: string;
  gender?: string;
  points: number;
}

interface Props {
  complaintId: string;
  currentDeputyId: string | null;
  deputies: Deputy[];
  userId: string;
}

export function AssignDeputyFormAdvanced({
  complaintId,
  currentDeputyId,
  deputies,
  userId,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const handleAssign = async (selectedDeputyIds: string[]) => {
    if (selectedDeputyIds.length === 0) {
      setError("يرجى اختيار نائب واحد على الأقل");
      return;
    }

    setLoading(true);
    setError("");

    const result = await assignComplaintToDeputy(
      complaintId,
      selectedDeputyIds,
      userId
    );

    if (result.success) {
      setOpen(false);
      router.refresh();
    } else {
      setError(result.error || "فشل إسناد الشكوى");
    }

    setLoading(false);
  };

  const currentDeputy = deputies.find((d) => d.id === currentDeputyId);

  return (
    <div className="bg-card border rounded-lg p-4">
      <h3 className="font-semibold mb-4">إسناد الشكوى لنائب</h3>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {currentDeputyId && currentDeputy && (
        <div className="mb-4 p-3 bg-muted rounded-md">
          <p className="text-sm font-medium">النائب الحالي:</p>
          <p className="text-sm text-muted-foreground">
            {currentDeputy.full_name} - {currentDeputy.governorate}
          </p>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full" variant="default">
            <Users className="ml-2 h-4 w-4" />
            {currentDeputyId ? "تغيير أو إضافة نواب" : "اختيار نواب"}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>اختيار النواب لإسناد الشكوى</DialogTitle>
            <DialogDescription>
              يمكنك اختيار نائب واحد أو أكثر لإسناد الشكوى إليهم. استخدم الفلاتر
              للبحث عن النواب المناسبين.
            </DialogDescription>
          </DialogHeader>
          <AdvancedDeputySelector
            deputies={deputies}
            onSelect={handleAssign}
            isLoading={loading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

