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
  
  // Duplicate multiple times for seamless infinite loop
  const fullNewsText = `${newsText} • ${newsText} • ${newsText}`;

  return (
    <div className="breaking-news-container w-full">
      {/* Top orange line - thinner */}
      <div className="h-[2px] lg:h-[2px] bg-[#F87B1B]" />
      
      {/* Main ticker area - responsive height: h-6 (mobile) to h-10 (desktop = 40px) */}
      <div className="relative bg-gray-800 overflow-hidden">
        <div className="flex items-center h-6 lg:h-10">
          {/* Enhanced "أخبار عاجلة" label on the right - keep same width */}
          <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center">
            <div className="relative bg-gradient-to-l from-[#F87B1B] to-[#F87B1B] px-2 h-full flex items-center shadow-xl">
              {/* Decorative pulse line */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 animate-pulse" />
              
              {/* Breaking news icon - responsive size */}
              <span className="text-white text-xs lg:text-xl mr-0.5 lg:mr-1 animate-pulse">⚡</span>
              
              <span className="text-white font-semibold text-[10px] lg:text-base tracking-normal whitespace-nowrap" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                أخبار عاجلة
              </span>
              
              {/* Diagonal stripe effect */}
              <div className="absolute -left-2 top-0 bottom-0 w-4 bg-gradient-to-r from-[#F87B1B] to-transparent transform -skew-x-12" />
            </div>
          </div>

          {/* Scrolling news text - TRUE RTL: moving from LEFT to RIGHT */}
          <div className="flex-1 overflow-hidden pr-20 lg:pr-40">
            <div className="breaking-news-scroll">
              <span 
                className="inline-block text-white text-xs lg:text-base whitespace-nowrap"
                style={{ fontFamily: 'Tajawal, sans-serif' }}
              >
                {fullNewsText}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom orange line - thinner */}
      <div className="h-[4px] lg:h-[4px] bg-[#F87B1B]" />
      
      {/* Bottom dark gray line */}
      <div className="h-[1px] bg-gray-900" />

      <style jsx>{`
        .breaking-news-scroll {
          display: inline-block;
          animation: scroll-left-to-right 90s linear infinite;
          padding-left: 100%;
        }

        /* TRUE RTL animation: text moves from LEFT to RIGHT seamlessly */
        @keyframes scroll-left-to-right {
          0% {
            transform: translateX(-33.33%);
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
