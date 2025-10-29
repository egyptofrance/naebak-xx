import Image from "next/image";
import { BreakingNewsTicker } from "@/components/BreakingNewsTicker";
import { getBreakingNews } from "@/app/actions/breaking-news/getBreakingNews";
import { getTickerSettings } from "@/app/actions/breaking-news/getTickerSettings";
import { getCurrentBanner } from "@/app/actions/banner/getCurrentBanner";

export default async function BannerWithNews() {
  const breakingNews = await getBreakingNews();
  const tickerSettings = await getTickerSettings();
  const scrollSpeed = tickerSettings?.scroll_speed || 50;
  const bannerUrl = await getCurrentBanner();
  
  return (
    <div className="w-full">
      {/* بانر السيسي الرئيسي */}
      <Image
        alt="بانر نائبك"
        src={bannerUrl}
        width={1920}
        height={400}
        className="w-full h-auto object-cover block"
        priority
      />
      
      {/* Breaking News Ticker - Below Banner (no gap) */}
      <BreakingNewsTicker newsItems={breakingNews} scrollSpeed={scrollSpeed} />
    </div>
  );
}
