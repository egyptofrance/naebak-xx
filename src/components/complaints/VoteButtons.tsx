"use client";

import { useState } from "react";
import { ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { upvoteComplaint } from "@/app/actions/complaints/upvoteComplaint";
import { downvoteComplaint } from "@/app/actions/complaints/downvoteComplaint";

interface VoteButtonsProps {
  complaintId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  initialHasUpvoted: boolean;
  initialHasDownvoted: boolean;
  variant?: "default" | "compact";
}

export function VoteButtons({
  complaintId,
  initialUpvotes,
  initialDownvotes,
  initialHasUpvoted,
  initialHasDownvoted,
  variant = "compact",
}: VoteButtonsProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [hasUpvoted, setHasUpvoted] = useState(initialHasUpvoted);
  const [hasDownvoted, setHasDownvoted] = useState(initialHasDownvoted);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [isDownvoting, setIsDownvoting] = useState(false);

  const netVotes = upvotes - downvotes;

  const handleUpvote = async () => {
    if (isUpvoting || isDownvoting) return;

    setIsUpvoting(true);

    // Optimistic update
    const newHasUpvoted = !hasUpvoted;
    const newUpvotes = newHasUpvoted ? upvotes + 1 : upvotes - 1;

    setHasUpvoted(newHasUpvoted);
    setUpvotes(newUpvotes);

    // If user had downvoted, remove downvote
    if (hasDownvoted) {
      setHasDownvoted(false);
      setDownvotes(downvotes - 1);
    }

    try {
      const result = await upvoteComplaint(complaintId);

      if (result.success) {
        setUpvotes(result.votesCount);
        setHasUpvoted(result.hasVoted);
      } else {
        // Revert on error
        setHasUpvoted(!newHasUpvoted);
        setUpvotes(upvotes);
        if (hasDownvoted) {
          setHasDownvoted(true);
          setDownvotes(downvotes);
        }
        console.error("Failed to upvote:", result.error);
      }
    } catch (error) {
      // Revert on error
      setHasUpvoted(!newHasUpvoted);
      setUpvotes(upvotes);
      if (hasDownvoted) {
        setHasDownvoted(true);
        setDownvotes(downvotes);
      }
      console.error("Failed to upvote:", error);
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleDownvote = async () => {
    if (isUpvoting || isDownvoting) return;

    setIsDownvoting(true);

    // Optimistic update
    const newHasDownvoted = !hasDownvoted;
    const newDownvotes = newHasDownvoted ? downvotes + 1 : downvotes - 1;

    setHasDownvoted(newHasDownvoted);
    setDownvotes(newDownvotes);

    // If user had upvoted, remove upvote
    if (hasUpvoted) {
      setHasUpvoted(false);
      setUpvotes(upvotes - 1);
    }

    try {
      const result = await downvoteComplaint(complaintId);

      if (result.success) {
        setDownvotes(result.downvotesCount);
        setHasDownvoted(result.hasDownvoted);
      } else {
        // Revert on error
        setHasDownvoted(!newHasDownvoted);
        setDownvotes(downvotes);
        if (hasUpvoted) {
          setHasUpvoted(true);
          setUpvotes(upvotes);
        }
        console.error("Failed to downvote:", result.error);
      }
    } catch (error) {
      // Revert on error
      setHasDownvoted(!newHasDownvoted);
      setDownvotes(downvotes);
      if (hasUpvoted) {
        setHasUpvoted(true);
        setUpvotes(upvotes);
      }
      console.error("Failed to downvote:", error);
    } finally {
      setIsDownvoting(false);
    }
  };

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2">
        {/* Upvote Button */}
        <button
          onClick={handleUpvote}
          disabled={isUpvoting || isDownvoting}
          className={`
            inline-flex items-center justify-center w-8 h-8 rounded-md transition-all
            ${
              hasUpvoted
                ? "bg-green-500 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600"
            }
            ${isUpvoting || isDownvoting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
          aria-label="تأييد"
          title="تأييد"
        >
          {isUpvoting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowUp className="h-4 w-4" />
          )}
        </button>

        {/* Net Votes Count */}
        <span
          className={`
            text-sm font-bold min-w-[2rem] text-center
            ${netVotes > 0 ? "text-green-600" : netVotes < 0 ? "text-red-600" : "text-gray-600"}
          `}
        >
          {netVotes > 0 && "+"}
          {netVotes}
        </span>

        {/* Downvote Button */}
        <button
          onClick={handleDownvote}
          disabled={isUpvoting || isDownvoting}
          className={`
            inline-flex items-center justify-center w-8 h-8 rounded-md transition-all
            ${
              hasDownvoted
                ? "bg-red-500 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600"
            }
            ${isUpvoting || isDownvoting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
          aria-label="رفض"
          title="رفض"
        >
          {isDownvoting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
        </button>
      </div>
    );
  }

  // Default variant (vertical)
  return (
    <div className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded-lg">
      {/* Upvote Button */}
      <button
        onClick={handleUpvote}
        disabled={isUpvoting || isDownvoting}
        className={`
          inline-flex items-center justify-center w-10 h-10 rounded-md transition-all
          ${
            hasUpvoted
              ? "bg-green-500 text-white shadow-md"
              : "bg-white text-gray-600 hover:bg-green-100 hover:text-green-600 border"
          }
          ${isUpvoting || isDownvoting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        aria-label="تأييد"
        title="تأييد"
      >
        {isUpvoting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <ArrowUp className="h-5 w-5" />
        )}
      </button>

      {/* Net Votes Count */}
      <span
        className={`
          text-lg font-bold
          ${netVotes > 0 ? "text-green-600" : netVotes < 0 ? "text-red-600" : "text-gray-600"}
        `}
      >
        {netVotes > 0 && "+"}
        {netVotes}
      </span>

      {/* Downvote Button */}
      <button
        onClick={handleDownvote}
        disabled={isUpvoting || isDownvoting}
        className={`
          inline-flex items-center justify-center w-10 h-10 rounded-md transition-all
          ${
            hasDownvoted
              ? "bg-red-500 text-white shadow-md"
              : "bg-white text-gray-600 hover:bg-red-100 hover:text-red-600 border"
          }
          ${isUpvoting || isDownvoting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        aria-label="رفض"
        title="رفض"
      >
        {isDownvoting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <ArrowDown className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
