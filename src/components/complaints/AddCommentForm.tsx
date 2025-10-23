"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { addComplaintComment } from "@/data/complaints/complaints";
import { useRouter } from "next/navigation";

interface Props {
  complaintId: string;
  userId: string;
}

export function AddCommentForm({ complaintId, userId }: Props) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      setError("يرجى كتابة تعليق");
      return;
    }

    setLoading(true);
    setError("");

    const result = await addComplaintComment(complaintId, userId, comment.trim());

    if (result.success) {
      setComment("");
      router.refresh();
    } else {
      setError(result.error || "فشل إضافة التعليق");
    }

    setLoading(false);
  };

  return (
    <div className="bg-card border rounded-lg p-4">
      <h3 className="font-semibold mb-4">إضافة تعليق</h3>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="اكتب تعليقك هنا..."
          className="w-full px-3 py-2 border rounded-md min-h-[100px]"
          disabled={loading}
        />

        <Button type="submit" disabled={loading || !comment.trim()} className="w-full">
          {loading ? "جاري الإضافة..." : "إضافة تعليق"}
        </Button>
      </form>
    </div>
  );
}
