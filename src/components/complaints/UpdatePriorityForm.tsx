"use client";

import { updateComplaintPriorityAction } from "@/data/complaints/complaints";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface UpdatePriorityFormProps {
  complaintId: string;
  currentPriority: string;
}

export function UpdatePriorityForm({ complaintId, currentPriority }: UpdatePriorityFormProps) {
  const router = useRouter();
  const [newPriority, setNewPriority] = useState(currentPriority);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const priorityOptions = [
    { value: "low", label: "منخفضة", color: "text-green-600" },
    { value: "medium", label: "متوسطة", color: "text-yellow-600" },
    { value: "high", label: "عالية", color: "text-orange-600" },
    { value: "urgent", label: "عاجلة", color: "text-red-600" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPriority === currentPriority) {
      setError("الأولوية الجديدة مطابقة للأولوية الحالية");
      return;
    }

    setLoading(true);
    setError("");

    const result = await updateComplaintPriorityAction({
      complaintId,
      newPriority: newPriority as any,
    });

    if (result?.serverError || result?.validationErrors) {
      setError(result.serverError || "حدث خطأ أثناء التحديث");
      setLoading(false);
    } else {
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="priority" className="block text-sm font-medium mb-2">
          الأولوية الجديدة
        </label>
        <select
          id="priority"
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          disabled={loading}
        >
          {priorityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading || newPriority === currentPriority}
        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? "جاري التحديث..." : "تحديث الأولوية"}
      </button>
    </form>
  );
}

