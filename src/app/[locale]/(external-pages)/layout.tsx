import { ExternalNavigation } from "@/components/NavigationMenu/ExternalNavbar/ExternalNavigation";
import { Footer } from "@/components/LandingPage/Footer";
import { BreakingNewsTicker } from "@/components/BreakingNewsTicker";
import { getBreakingNews } from "@/app/actions/breaking-news/getBreakingNews";
import { routing } from "@/i18n/routing";
import { unstable_setRequestLocale } from "next-intl/server";
import "./layout.css";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;

  const { locale } = params;

  const { children } = props;

  unstable_setRequestLocale(locale);
  
  // Fetch breaking news
  const breakingNews = await getBreakingNews();
  console.log('[Layout] Breaking news count:', breakingNews.length);
  
  return (
    <div className="flex flex-col min-h-screen">
      <ExternalNavigation />
      <BreakingNewsTicker newsItems={breakingNews} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
