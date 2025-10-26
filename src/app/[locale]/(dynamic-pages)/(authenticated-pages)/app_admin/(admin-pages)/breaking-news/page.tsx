import { getBreakingNewsAdminAction } from "@/data/admin/breaking-news";
import { BreakingNewsList } from "./BreakingNewsList";

export default async function BreakingNewsPage() {
  const newsData = await getBreakingNewsAdminAction({});
  const news = newsData?.data || [];

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">إدارة الأخبار العاجلة</h1>
        <p className="text-muted-foreground mt-2">
          إدارة الأخبار التي تظهر في الشريط الإخباري أعلى الصفحة الرئيسية
        </p>
      </div>
      
      <BreakingNewsList initialNews={news} />
    </div>
  );
}
