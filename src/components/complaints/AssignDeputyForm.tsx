"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { assignComplaintToDeputy } from "@/data/complaints/complaints";
import { useRouter } from "next/navigation";

interface Deputy {
  id: string;
  full_name: string;
  governorate: string;
  party: string;
}

interface Props {
  complaintId: string;
  currentDeputyId: string | null;
  deputies: Deputy[];
}

export function AssignDeputyForm({ complaintId, currentDeputyId, deputies }: Props) {
  const router = useRouter();
  const [selectedDeputyId, setSelectedDeputyId] = useState(currentDeputyId || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAssign = async () => {
    if (!selectedDeputyId) {
      setError("يرجى اختيار نائب");
      return;
    }

    setLoading(true);
    setError("");

    const result = await assignComplaintToDeputy(complaintId, selectedDeputyId);

    if (result.success) {
      router.refresh();
    } else {
      setError(result.error || "فشل إسناد الشكوى");
    }

    setLoading(false);
  };

  return (
    <div className="bg-card border rounded-lg p-4">
      <h3 className="font-semibold mb-4">إسناد الشكوى لنائب</h3>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="deputy" className="block text-sm font-medium mb-2">
            اختر النائب
          </label>
          <select
            id="deputy"
            value={selectedDeputyId}
            onChange={(e) => setSelectedDeputyId(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            disabled={loading}
          >
            <option value="">-- اختر نائباً --</option>
            {deputies.map((deputy) => (
              <option key={deputy.id} value={deputy.id}>
                {deputy.full_name} - {deputy.governorate}
              </option>
            ))}
          </select>
        </div>

        <Button
          onClick={handleAssign}
          disabled={loading || !selectedDeputyId}
          className="w-full"
        >
          {loading ? "جاري الإسناد..." : currentDeputyId ? "تحديث الإسناد" : "إسناد الشكوى"}
        </Button>

        {currentDeputyId && (
          <p className="text-xs text-muted-foreground text-center">
            الشكوى مسندة حالياً
          </p>
        )}
      </div>
    </div>
  );
}
