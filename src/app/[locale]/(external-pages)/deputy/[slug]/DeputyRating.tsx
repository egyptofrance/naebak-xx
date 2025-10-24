"use client";

import { StarRating } from "@/components/StarRating";
import { rateDeputy } from "@/app/actions/deputy/rateDeputy";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface DeputyRatingProps {
  deputyId: string;
  rating: number;
  ratingCount: number;
  userRating: number | null;
  isAuthenticated: boolean;
}

export function DeputyRating({
  deputyId,
  rating,
  ratingCount,
  userRating,
  isAuthenticated,
}: DeputyRatingProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleRate = async (newRating: number) => {
    if (!isAuthenticated) {
      toast.error("يجب تسجيل الدخول أولاً للتقييم");
      return;
    }

    setIsLoading(true);
    const result = await rateDeputy(deputyId, newRating);
    setIsLoading(false);

    if (result.success) {
      toast.success(userRating ? "تم تحديث تقييمك بنجاح" : "تم إضافة تقييمك بنجاح");
      router.refresh();
    } else {
      toast.error(result.error || "فشل حفظ التقييم");
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm border">
      <h2 className="text-2xl font-bold mb-4">تقييم النائب</h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            {isAuthenticated
              ? userRating
                ? "يمكنك تعديل تقييمك بالضغط على النجوم"
                : "قيّم هذا النائب بالضغط على النجوم"
              : "سجل دخولك لتتمكن من تقييم النائب"}
          </p>
          <StarRating
            rating={rating || 0}
            totalRatings={ratingCount || 0}
            userRating={userRating}
            onRate={isAuthenticated ? handleRate : undefined}
            readonly={!isAuthenticated || isLoading}
            size="lg"
            showCount={true}
          />
        </div>
        {ratingCount > 0 && (
          <p className="text-xs text-muted-foreground">
            التقييم بناءً على {ratingCount} {ratingCount === 1 ? "تقييم" : "تقييمات"}
          </p>
        )}
      </div>
    </div>
  );
}

