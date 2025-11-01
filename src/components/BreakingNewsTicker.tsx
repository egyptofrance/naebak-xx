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
        <div className="flex items-center h-8 lg:h-12">
          {/* Modern curved two-tone "أخبار عاجلة" label */}
          <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center">
            <div className="relative h-full flex items-center">
              {/* Curved container with shadow */}
              <div className="relative flex items-center h-full shadow-2xl">
                {/* First section: "أخبار" - Light green background */}
                <div 
                  className="relative h-full flex items-center px-3 lg:px-4 bg-gradient-to-b from-[#22c55e] to-[#16a34a]"
                  style={{
                    borderTopLeftRadius: '0',
                    borderTopRightRadius: '50px',
                    borderBottomRightRadius: '0',
                    borderBottomLeftRadius: '0',
                  }}
                >
                  <span className="text-white font-bold text-xs lg:text-base tracking-wide whitespace-nowrap" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                    أخبار
                  </span>
                  {/* Divider line */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-3/5 w-[2px] bg-white/30" />
                </div>

                {/* Second section: "عاجلة" - Dark green background (logo color) */}
                <div 
                  className="relative h-full flex items-center px-3 lg:px-4 bg-gradient-to-b from-[#0a5c0a] to-[#064a06]"
                  style={{
                    borderTopLeftRadius: '0',
                    borderTopRightRadius: '0',
                    borderBottomRightRadius: '0',
                    borderBottomLeftRadius: '0',
                  }}
                >
                  <span className="text-white text-base lg:text-2xl mr-1 lg:mr-2 animate-pulse">⚡</span>
                  <span className="text-white font-bold text-xs lg:text-base tracking-wide whitespace-nowrap" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                    عاجلة
                  </span>
                </div>

                {/* Smooth fade effect on the left */}
                <div className="absolute -left-3 top-0 bottom-0 w-6 bg-gradient-to-r from-[#064a06] to-transparent" />
              </div>
            </div>
          </div>

          {/* Scrolling news text using react-fast-marquee */}
          <div className="flex-1 pr-32 lg:pr-48">
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
