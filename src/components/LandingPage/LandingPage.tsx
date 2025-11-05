import { Suspense } from "react";
import HeroSection from "./HeroSection";
import BannerWithNews from "./BannerWithNews";
import PlatformOverview from "./PlatformOverview";
import StatsSection from "./StatsSection";
import StatsSkeleton from "./StatsSkeleton";
import { getPublicStats } from "@/data/public/stats";

async function StatsWrapper() {
  const stats = await getPublicStats();
  return <StatsSection {...stats} />;
}

export const LandingPage = () => {
  return (
    <div className="flex flex-col gap-0">
      <BannerWithNews />
      <HeroSection />
      <Suspense fallback={<StatsSkeleton />}>
        <StatsWrapper />
      </Suspense>
      <PlatformOverview />
    </div>
  );
};
