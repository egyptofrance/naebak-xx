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
  compact?: boolean; // Compact mode for header display
}

export function DeputyRating({
  deputyId,
  rating,
  ratingCount,
  userRating,
  isAuthenticated,
  compact = false,
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

  if (compact) {
    // Compact mode for header display
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <StarRating
            rating={rating}
            totalRatings={ratingCount}
            userRating={userRating}
            onRate={isAuthenticated ? handleRate : undefined}
            readonly={!isAuthenticated || isLoading}
            size="md"
            showCount={true}
          />
        </div>
        {!isAuthenticated && (
          <p className="text-xs text-muted-foreground">
            سجل دخولك لتقييم النائب
          </p>
        )}
        {isAuthenticated && userRating && (
          <p className="text-xs text-primary font-medium">
            تقييمك: {userRating} ⭐
          </p>
        )}
        {isAuthenticated && !userRating && (
          <p className="text-xs text-muted-foreground">
            اضغط على النجوم للتقييم
          </p>
        )}
      </div>
    );
  }

  // Full mode (not used anymore, but kept for compatibility)
  return (
    <div className="bg-card p-6 rounded-lg shadow-sm border">
      <h2 className="text-2xl font-bold mb-4">
        {isAuthenticated ? "قيّم هذا النائب" : "تقييم النائب"}
      </h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-3">
            {isAuthenticated
              ? userRating
                ? "يمكنك تعديل تقييمك بالضغط على النجوم أدناه"
                : "شارك رأيك في أداء هذا النائب بالضغط على النجوم"
              : "سجل دخولك لتتمكن من تقييم النائب ومشاركة رأيك"}
          </p>
          <div className="flex flex-col items-center gap-3 p-4 bg-muted/30 rounded-lg">
            <StarRating
              rating={userRating || 0}
              totalRatings={0}
              userRating={userRating}
              onRate={isAuthenticated ? handleRate : undefined}
              readonly={!isAuthenticated || isLoading}
              size="lg"
              showCount={false}
            />
            {userRating && (
              <p className="text-sm font-medium text-primary">
                تقييمك الحالي: {userRating} من 5 نجوم
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

