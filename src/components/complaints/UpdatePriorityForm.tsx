"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateComplaintPriority } from "@/data/complaints/complaints";
import { useRouter } from "next/navigation";

interface Props {
  complaintId: string;
  currentPriority: string;
  userId: string;
}

export function UpdatePriorityForm({ complaintId, currentPriority, userId }: Props) {
  const router = useRouter();
  const [priority, setPriority] = useState(currentPriority);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpdate = async () => {
    setLoading(true);
    setError("");

    const result = await updateComplaintPriority(complaintId, priority, userId);

    if (result.success) {
      router.refresh();
    } else {
      setError(result.error || "فشل تحديث الأولوية");
    }

    setLoading(false);
  };

  return (
    <div className="bg-card border rounded-lg p-4">
      <h3 className="font-semibold mb-4">تحديث الأولوية</h3>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">الأولوية</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            disabled={loading}
          >
            <option value="low">منخفضة</option>
            <option value="medium">متوسطة</option>
            <option value="high">عالية</option>
            <option value="urgent">عاجلة</option>
          </select>
        </div>

        <Button
          onClick={handleUpdate}
          disabled={loading || priority === currentPriority}
          className="w-full"
        >
          {loading ? "جاري التحديث..." : "تحديث الأولوية"}
        </Button>
      </div>
    </div>
  );
}
