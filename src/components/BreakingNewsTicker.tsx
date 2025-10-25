"use client";

import { useEffect, useState } from "react";
import type { BreakingNewsItem } from "@/app/actions/breaking-news/getBreakingNews";

interface BreakingNewsTickerProps {
  newsItems: BreakingNewsItem[];
}

export function BreakingNewsTicker({ newsItems }: BreakingNewsTickerProps) {
  if (!newsItems || newsItems.length === 0) {
    return null;
  }

  // Create a continuous string of news items separated by bullets
  const newsText = newsItems.map(item => item.content).join(" • ");
  // Duplicate for seamless loop
  const fullNewsText = `${newsText} • ${newsText}`;

  return (
    <div className="breaking-news-container w-full">
      {/* Top orange line (2px) */}
      <div className="h-[2px] bg-orange-500" />
      
      {/* Main ticker area - reduced height to h-8 */}
      <div className="relative bg-gray-800 overflow-hidden">
        <div className="flex items-center h-8">
          {/* Enhanced "أخبار عاجلة" label on the right */}
          <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center">
            <div className="relative bg-gradient-to-l from-orange-600 to-orange-500 px-4 h-full flex items-center shadow-xl">
              {/* Decorative pulse line */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 animate-pulse" />
              
              {/* Breaking news icon */}
              <span className="text-white text-base mr-1.5 animate-pulse">⚡</span>
              
              <span className="text-white font-bold text-sm tracking-wide whitespace-nowrap" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                أخبار عاجلة
              </span>
              
              {/* Diagonal stripe effect */}
              <div className="absolute -left-2 top-0 bottom-0 w-4 bg-gradient-to-r from-orange-600 to-transparent transform -skew-x-12" />
            </div>
          </div>

          {/* Scrolling news text - TRUE RTL: moving from LEFT to RIGHT */}
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
          animation: scroll-left-to-right 60s linear infinite;
          padding-left: 100%;
        }

        /* TRUE RTL animation: text moves from LEFT to RIGHT */
        @keyframes scroll-left-to-right {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .breaking-news-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

