"use client";

import { addComplaintCommentAction } from "@/data/complaints/complaints";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface AddCommentFormProps {
  complaintId: string;
}

export function AddCommentForm({ complaintId }: AddCommentFormProps) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) {
      setError("يرجى كتابة تعليق");
      return;
    }

    setLoading(true);
    setError("");

    const result = await addComplaintCommentAction({
      complaintId,
      comment: comment.trim(),
    });

    if (result?.serverError || result?.validationErrors) {
      setError(result.serverError || "حدث خطأ أثناء إضافة التعليق");
      setLoading(false);
    } else {
      setComment("");
      setLoading(false);
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
        <label htmlFor="comment" className="block text-sm font-medium mb-2">
          الملاحظة
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="اكتب ملاحظتك هنا..."
          disabled={loading}
          maxLength={2000}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {comment.length} / 2000 حرف
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || !comment.trim()}
        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? "جاري الإضافة..." : "إضافة ملاحظة"}
      </button>
    </form>
  );
}

