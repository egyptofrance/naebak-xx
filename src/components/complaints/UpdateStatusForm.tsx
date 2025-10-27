"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateComplaintStatus } from "@/data/complaints/complaints";
import { notifyCitizenAboutComplaintUpdate } from "@/data/complaints/send-notification";
import { useRouter } from "next/navigation";
import { deputyStatusLabels, ComplaintStatus } from "@/utils/complaint-status-labels";
import { Bell } from "lucide-react";

interface Props {
  complaintId: string;
  currentStatus: string;
  userId: string;
}

export function UpdateStatusForm({ complaintId, currentStatus, userId }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusUpdated, setStatusUpdated] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    const result = await updateComplaintStatus(
      complaintId,
      status,
      userId,
      comment.trim() || undefined
    );

    if (result.success) {
      setSuccess("تم تحديث الحالة بنجاح");
      setStatusUpdated(true);
      router.refresh();
    } else {
      setError(result.error || "فشل تحديث الحالة");
    }

    setLoading(false);
  };

  const handleSendNotification = async () => {
    setNotifying(true);
    setError("");
    setSuccess("");

    const result = await notifyCitizenAboutComplaintUpdate(
      complaintId,
      status as ComplaintStatus,
      comment.trim() || undefined
    );

    if (result.success) {
      setSuccess("تم إرسال الإشعار للمواطن بنجاح");
      setComment("");
      setStatusUpdated(false);
    } else {
      setError(result.error || "فشل إرسال الإشعار");
    }

    setNotifying(false);
  };

  return (
    <div className="bg-card border rounded-lg p-4">
      <h3 className="font-semibold mb-4">تحديث حالة الشكوى</h3>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-800 text-sm p-3 rounded-md mb-4">
          {success}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">الحالة</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setStatusUpdated(false);
            }}
            className="w-full px-3 py-2 border rounded-md"
            disabled={loading || notifying}
          >
            {Object.entries(deputyStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
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
            disabled={loading || notifying}
          />
        </div>

        <Button
          onClick={handleUpdate}
          disabled={loading || notifying || status === currentStatus}
          className="w-full"
        >
          {loading ? "جاري التحديث..." : "تحديث الحالة"}
        </Button>

        {statusUpdated && (
          <Button
            onClick={handleSendNotification}
            disabled={notifying || loading}
            variant="outline"
            className="w-full gap-2"
          >
            <Bell className="h-4 w-4" />
            {notifying ? "جاري الإرسال..." : "إرسال إشعار للمواطن"}
          </Button>
        )}
      </div>
    </div>
  );
}

