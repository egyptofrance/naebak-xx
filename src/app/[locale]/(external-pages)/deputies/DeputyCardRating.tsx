"use client";

import { StarRating } from "@/components/StarRating";
import { rateDeputy } from "@/app/actions/deputy/rateDeputy";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getUserRating } from "@/app/actions/deputy/getUserRating";

interface DeputyCardRatingProps {
  deputyId: string;
  rating: number;
  ratingCount: number;
  isAuthenticated: boolean;
}

export function DeputyCardRating({
  deputyId,
  rating,
  ratingCount,
  isAuthenticated,
}: DeputyCardRatingProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);

  // Fetch user's rating on mount
  useEffect(() => {
    if (isAuthenticated) {
      getUserRating(deputyId).then((rating) => setUserRating(rating));
    }
  }, [deputyId, isAuthenticated]);

  const handleRate = async (newRating: number) => {
    if (!isAuthenticated) {
      toast.error("يجب تسجيل الدخول أولاً للتقييم");
      return;
    }

    setIsLoading(true);
    const result = await rateDeputy(deputyId, newRating);
    setIsLoading(false);

    if (result.success) {
      toast.success(userRating ? "تم تحديث تقييمك" : "تم إضافة تقييمك");
      setUserRating(newRating);
      router.refresh();
    } else {
      toast.error(result.error || "فشل حفظ التقييم");
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 py-2 border-t">
      <StarRating
        rating={rating || 0}
        totalRatings={ratingCount || 0}
        userRating={userRating}
        onRate={isAuthenticated ? handleRate : undefined}
        readonly={!isAuthenticated || isLoading}
        size="sm"
        showCount={true}
      />
      {isAuthenticated && userRating && (
        <p className="text-xs text-primary font-medium">
          تقييمك: {userRating} ⭐
        </p>
      )}
    </div>
  );
}

