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
        <div className="flex items-center h-10 lg:h-14">
          {/* Curved two-tone "أخبار عاجلة" label using SVG */}
          <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center">
            <svg 
              className="h-full w-auto" 
              viewBox="0 0 200 56" 
              preserveAspectRatio="none"
              style={{ filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.5))' }}
            >
              {/* Light green section (أخبار) - curved top right */}
              <path
                d="M 0 0 L 90 0 Q 100 0 100 10 L 100 56 L 0 56 Z"
                fill="url(#lightGreen)"
              />
              
              {/* Dark green section (عاجلة) */}
              <rect
                x="100"
                y="0"
                width="100"
                height="56"
                fill="url(#darkGreen)"
              />
              
              {/* White divider line */}
              <line
                x1="100"
                y1="14"
                x2="100"
                y2="42"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="2"
              />
              
              {/* Gradients */}
              <defs>
                <linearGradient id="lightGreen" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#16a34a" />
                </linearGradient>
                <linearGradient id="darkGreen" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0a5c0a" />
                  <stop offset="100%" stopColor="#064a06" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Text overlay */}
            <div className="absolute inset-0 flex items-center">
              {/* "أخبار" text */}
              <div className="flex-1 flex items-center justify-center pr-2 lg:pr-3">
                <span className="text-white font-bold text-xs lg:text-base whitespace-nowrap" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                  أخبار
                </span>
              </div>
              
              {/* "عاجلة" text with lightning */}
              <div className="flex-1 flex items-center justify-center pl-2 lg:pl-3">
                <span className="text-white text-sm lg:text-xl mr-1 animate-pulse">⚡</span>
                <span className="text-white font-bold text-xs lg:text-base whitespace-nowrap" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                  عاجلة
                </span>
              </div>
            </div>
          </div>

          {/* Scrolling news text using react-fast-marquee */}
          <div className="flex-1 pr-44 lg:pr-52">
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
