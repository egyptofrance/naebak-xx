"use client";
import Marquee from "react-fast-marquee";
import type { BreakingNewsItem } from "@/app/actions/breaking-news/getBreakingNews";

interface BreakingNewsTickerProps {
  newsItems: BreakingNewsItem[];
  scrollSpeed?: number;
}

export function BreakingNewsTicker({ newsItems, scrollSpeed = 50 }: BreakingNewsTickerProps) {
  if (!newsItems || newsItems.length === 0) {
    return null;
  }

  // Create a continuous string of news items separated by bullets
  const newsText = newsItems.map(item => item.content).join(" • ");

  return (
    <div className="breaking-news-container w-full">
      {/* Top green line */}
      <div className="h-[2px] lg:h-[2px] bg-[#0a5c0a]" />
      
      {/* Main ticker area */}
      <div className="relative bg-gray-800 overflow-hidden">
        <div className="flex items-center h-8 lg:h-10">
          {/* Simple red indicator dot */}
          <div className="absolute right-3 lg:right-4 top-1/2 -translate-y-1/2 z-10">
            <div className="w-2 h-2 lg:w-3 lg:h-3 bg-red-600 rounded-full animate-pulse" />
          </div>

          {/* Scrolling news text using react-fast-marquee */}
          <div className="flex-1 pr-8 lg:pr-10">
            <Marquee
              speed={scrollSpeed}
              gradient={false}
              direction="right"
              pauseOnHover={true}
            >
              <span 
                className="text-white text-xs lg:text-base whitespace-nowrap"
                style={{ fontFamily: 'Tajawal, sans-serif' }}
              >
                {newsText} &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
              </span>
            </Marquee>
          </div>
        </div>
      </div>

      {/* Bottom green line */}
      <div className="h-[3px] lg:h-[3px] bg-[#0a5c0a]" />
      
      {/* Bottom dark gray line */}
      <div className="h-[1px] bg-gray-900" />
    </div>
  );
}
