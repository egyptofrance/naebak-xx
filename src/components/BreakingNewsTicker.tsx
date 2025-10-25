"use client";

import { useEffect, useState } from "react";
import type { BreakingNewsItem } from "@/app/actions/breaking-news/getBreakingNews";

interface BreakingNewsTickerProps {
  newsItems: BreakingNewsItem[];
}

export function BreakingNewsTicker({ newsItems }: BreakingNewsTickerProps) {
  const [isVisible, setIsVisible] = useState(true);

  console.log('[BreakingNewsTicker] Received news items:', newsItems);

  if (!newsItems || newsItems.length === 0) {
    console.log('[BreakingNewsTicker] No news items, returning null');
    return null;
  }

  // Create a continuous string of news items separated by bullets
  const newsText = newsItems.map(item => item.content).join(" • ");
  // Duplicate for seamless loop
  const fullNewsText = `${newsText} • ${newsText}`;

  return (
    <div className="breaking-news-container">
      {/* Top orange line (2px) */}
      <div className="h-[2px] bg-orange-500" />
      
      {/* Main ticker area */}
      <div className="relative bg-gray-800 overflow-hidden">
        <div className="flex items-center h-10">
          {/* "أخبار عاجلة" label on the right */}
          <div className="absolute right-0 top-0 bottom-0 z-10 bg-orange-500 px-6 flex items-center shadow-lg">
            <span className="text-white font-bold text-sm whitespace-nowrap" style={{ fontFamily: 'Tajawal, sans-serif' }}>
              أخبار عاجلة
            </span>
          </div>

          {/* Scrolling news text */}
          <div className="flex-1 overflow-hidden pr-32">
            <div className="breaking-news-scroll">
              <span 
                className="inline-block text-white text-sm whitespace-nowrap"
                style={{ fontFamily: 'Tajawal, sans-serif' }}
              >
                {fullNewsText}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom orange line (4px) */}
      <div className="h-[4px] bg-orange-500" />
      
      {/* Bottom dark gray line (1px) */}
      <div className="h-[1px] bg-gray-900" />

      <style jsx>{`
        .breaking-news-scroll {
          display: inline-block;
          animation: scroll-rtl 60s linear infinite;
          padding-right: 100%;
        }

        @keyframes scroll-rtl {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .breaking-news-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

