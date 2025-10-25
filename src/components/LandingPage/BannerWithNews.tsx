import Image from "next/image";
import { BreakingNewsTicker } from "@/components/BreakingNewsTicker";
import { getBreakingNews } from "@/app/actions/breaking-news/getBreakingNews";

export default async function BannerWithNews() {
  const breakingNews = await getBreakingNews();
  
  return (
    <div className="w-full">
      {/* بانر السيسي الرئيسي */}
      <Image
        alt="بانر نائبك"
        src="/images/sisi-banner.jpg"
        width={1920}
        height={400}
        className="w-full h-auto object-cover block"
        priority
      />
      
      {/* Breaking News Ticker - Below Banner (no gap) */}
      <BreakingNewsTicker newsItems={breakingNews} />
    </div>
  );
}

