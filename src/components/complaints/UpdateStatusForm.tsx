"use client";

import { updateComplaintStatusAction } from "@/data/complaints/complaints";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface UpdateStatusFormProps {
  complaintId: string;
  currentStatus: string;
}

export function UpdateStatusForm({ complaintId, currentStatus }: UpdateStatusFormProps) {
  const router = useRouter();
  const [newStatus, setNewStatus] = useState(currentStatus);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const statusOptions = [
    { value: "new", label: "جديدة" },
    { value: "under_review", label: "قيد المراجعة" },
    { value: "assigned_to_deputy", label: "مسندة لنائب" },
    { value: "accepted", label: "مقبولة" },
    { value: "rejected", label: "مرفوضة" },
    { value: "in_progress", label: "قيد التنفيذ" },
    { value: "on_hold", label: "معلقة" },
    { value: "resolved", label: "تم الحل" },
    { value: "closed", label: "مغلقة" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newStatus === currentStatus) {
      setError("الحالة الجديدة مطابقة للحالة الحالية");
      return;
    }

    setLoading(true);
    setError("");

    const result = await updateComplaintStatusAction({
      complaintId,
      newStatus: newStatus as any,
      comment: comment || undefined,
    });

    if (result?.serverError || result?.validationErrors) {
      setError(result.serverError || "حدث خطأ أثناء التحديث");
      setLoading(false);
    } else {
      setComment("");
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
        <label htmlFor="status" className="block text-sm font-medium mb-2">
          الحالة الجديدة
        </label>
        <select
          id="status"
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          disabled={loading}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {(newStatus === "rejected" || newStatus === "on_hold") && (
        <div>
          <label htmlFor="comment" className="block text-sm font-medium mb-2">
            {newStatus === "rejected" ? "سبب الرفض" : "سبب التعليق"}
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="اكتب السبب..."
            disabled={loading}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading || newStatus === currentStatus}
        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? "جاري التحديث..." : "تحديث الحالة"}
      </button>
    </form>
  );
}

