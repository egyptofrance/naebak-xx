"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number; // Current average rating (0-5)
  totalRatings: number; // Total number of ratings
  userRating?: number | null; // User's own rating (if exists)
  onRate?: (rating: number) => Promise<void>; // Callback when user rates
  readonly?: boolean; // If true, stars are not interactive
  size?: "sm" | "md" | "lg";
  showCount?: boolean; // Show rating count
}

export function StarRating({
  rating,
  totalRatings,
  userRating,
  onRate,
  readonly = false,
  size = "md",
  showCount = true,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const handleClick = async (selectedRating: number) => {
    if (readonly || !onRate || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onRate(selectedRating);
    } catch (error) {
      console.error("Failed to submit rating:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoverRating ?? userRating ?? rating;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayRating;
          const isPartiallyFilled = star - 0.5 <= displayRating && displayRating < star;

          return (
            <button
              key={star}
              type="button"
              disabled={readonly || isSubmitting}
              onClick={() => handleClick(star)}
              onMouseEnter={() => !readonly && setHoverRating(star)}
              onMouseLeave={() => !readonly && setHoverRating(null)}
              className={cn(
                "transition-all",
                !readonly && "cursor-pointer hover:scale-110",
                readonly && "cursor-default",
                isSubmitting && "opacity-50 cursor-wait"
              )}
              aria-label={`Rate ${star} stars`}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  "transition-colors",
                  isFilled || isPartiallyFilled
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-none text-gray-300"
                )}
              />
            </button>
          );
        })}
      </div>

      {showCount && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span className="font-semibold">{rating.toFixed(1)}</span>
          <span>({totalRatings})</span>
        </div>
      )}

      {userRating && !readonly && (
        <span className="text-xs text-muted-foreground">
          تقييمك: {userRating} ⭐
        </span>
      )}
    </div>
  );
}

