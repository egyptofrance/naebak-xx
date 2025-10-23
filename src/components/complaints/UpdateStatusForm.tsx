"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateComplaintStatus } from "@/data/complaints/complaints";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/utils/supabase/server-actions";

interface Props {
  complaintId: string;
  currentStatus: string;
}

export function UpdateStatusForm({ complaintId, currentStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpdate = async () => {
    setLoading(true);
    setError("");

    try {
      const user = await getCurrentUser();
      if (!user) {
        setError("يجب تسجيل الدخول");
        return;
      }

      const result = await updateComplaintStatus(
        complaintId,
        status,
        user.id,
        comment.trim() || undefined
      );

      if (result.success) {
        router.refresh();
      } else {
        setError(result.error || "فشل تحديث الحالة");
      }
    } catch (err) {
      setError("حدث خطأ غير متوقع");
    }

    setLoading(false);
  };

  return (
    <div className="bg-card border rounded-lg p-4">
      <h3 className="font-semibold mb-4">تحديث حالة الشكوى</h3>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">الحالة</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            disabled={loading}
          >
            <option value="new">جديدة</option>
            <option value="accepted">مقبولة</option>
            <option value="rejected">مرفوضة</option>
            <option value="in_progress">قيد المعالجة</option>
            <option value="on_hold">معلقة</option>
            <option value="resolved">محلولة</option>
            <option value="closed">مغلقة</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">تعليق (اختياري)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="أضف ملاحظة..."
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
            disabled={loading}
          />
        </div>

        <Button
          onClick={handleUpdate}
          disabled={loading || status === currentStatus}
          className="w-full"
        >
          {loading ? "جاري التحديث..." : "تحديث الحالة"}
        </Button>
      </div>
    </div>
  );
}
