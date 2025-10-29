"use client";
import Marquee from "react-fast-marquee";
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

  return (
    <div className="breaking-news-container w-full">
      {/* Top orange line */}
      <div className="h-[2px] lg:h-[2px] bg-[#F87B1B]" />
      
      {/* Main ticker area */}
      <div className="relative bg-gray-800 overflow-hidden">
        <div className="flex items-center h-6 lg:h-10">
          {/* "أخبار عاجلة" label */}
          <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center">
            <div className="relative bg-gradient-to-l from-[#F87B1B] to-[#F87B1B] px-2 h-full flex items-center shadow-xl">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 animate-pulse" />
              <span className="text-white text-xs lg:text-xl mr-0.5 lg:mr-1 animate-pulse">⚡</span>
              <span className="text-white font-semibold text-[10px] lg:text-base tracking-normal whitespace-nowrap" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                أخبار عاجلة
              </span>
              <div className="absolute -left-2 top-0 bottom-0 w-4 bg-gradient-to-r from-[#F87B1B] to-transparent transform -skew-x-12" />
            </div>
          </div>

          {/* Scrolling news text using react-fast-marquee */}
          <div className="flex-1 pr-20 lg:pr-40">
            <Marquee
              speed={50}
              gradient={false}
              direction="left"
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

      {/* Bottom orange line */}
      <div className="h-[4px] lg:h-[4px] bg-[#F87B1B]" />
      
      {/* Bottom dark gray line */}
      <div className="h-[1px] bg-gray-900" />
    </div>
  );
}
