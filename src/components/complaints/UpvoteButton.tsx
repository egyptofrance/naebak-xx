"use client";

import { useState } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { upvoteComplaint } from "@/app/actions/complaints/upvoteComplaint";

interface UpvoteButtonProps {
  complaintId: string;
  initialVotesCount: number;
  initialHasVoted: boolean;
  variant?: "default" | "compact";
}

export function UpvoteButton({
  complaintId,
  initialVotesCount,
  initialHasVoted,
  variant = "default",
}: UpvoteButtonProps) {
  const [votesCount, setVotesCount] = useState(initialVotesCount);
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpvote = async () => {
    if (isLoading) return;

    setIsLoading(true);

    // Optimistic update
    const newHasVoted = !hasVoted;
    const newVotesCount = newHasVoted ? votesCount + 1 : votesCount - 1;

    setHasVoted(newHasVoted);
    setVotesCount(newVotesCount);

    try {
      const result = await upvoteComplaint(complaintId);

      if (result.success) {
        // Update with actual values from server
        setVotesCount(result.votesCount);
        setHasVoted(result.hasVoted);
      } else {
        // Revert on error
        setHasVoted(!newHasVoted);
        setVotesCount(votesCount);
        console.error("Failed to upvote:", result.error);
      }
    } catch (error) {
      // Revert on error
      setHasVoted(!newHasVoted);
      setVotesCount(votesCount);
      console.error("Failed to upvote:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "compact") {
    return (
      <button
        onClick={handleUpvote}
        disabled={isLoading}
        className={`
          inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all
          ${
            hasVoted
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-primary/10 hover:text-primary"
          }
          ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        aria-label={hasVoted ? "إلغاء التأييد" : "تأييد هذه الشكوى"}
        title={hasVoted ? "إلغاء التأييد" : "تأييد هذه الشكوى"}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
        )}
        <span>{votesCount}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleUpvote}
      disabled={isLoading}
      className={`
        flex flex-col items-center gap-1 p-3 rounded-lg transition-all min-w-[60px]
        ${
          hasVoted
            ? "bg-primary text-white shadow-md"
            : "bg-gray-100 text-gray-600 hover:bg-primary/10 hover:text-primary hover:shadow-sm"
        }
        ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
      aria-label={hasVoted ? "إلغاء التأييد" : "تأييد هذه الشكوى"}
      title={hasVoted ? "إلغاء التأييد" : "تأييد هذه الشكوى"}
    >
      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
      ) : (
        <ArrowUp className="h-6 w-6" aria-hidden="true" />
      )}
      <span className="text-lg font-bold">{votesCount}</span>
      {hasVoted && (
        <span className="text-xs opacity-90">تم التأييد</span>
      )}
    </button>
  );
}
