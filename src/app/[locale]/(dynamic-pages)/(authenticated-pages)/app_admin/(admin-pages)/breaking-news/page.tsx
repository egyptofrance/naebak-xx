import { getBreakingNewsAdminAction } from "@/data/admin/breaking-news";
import { getTickerSettings } from "@/app/actions/breaking-news/getTickerSettings";
import { BreakingNewsList } from "./BreakingNewsList";
import { TickerSettingsCard } from "./TickerSettingsCard";

export default async function BreakingNewsPage() {
  const newsData = await getBreakingNewsAdminAction({});
  const news = newsData?.data || [];
  
  const tickerSettings = await getTickerSettings();
  const scrollSpeed = tickerSettings?.scroll_speed || 50;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">إدارة الأخبار العاجلة</h1>
        <p className="text-muted-foreground mt-2">
          إدارة الأخبار التي تظهر في الشريط الإخباري أعلى الصفحة الرئيسية
        </p>
      </div>
      
      <TickerSettingsCard initialSpeed={scrollSpeed} />
      
      <BreakingNewsList initialNews={news} />
    </div>
  );
}
