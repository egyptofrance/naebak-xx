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
            className="w-full px-3 py-2 border rounded-md text-center appearance-none"
            style={{ backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", backgroundPosition: "left 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
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
