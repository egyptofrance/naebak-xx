import HeroSection from "./HeroSection";
import BannerWithNews from "./BannerWithNews";
import PlatformOverview from "./PlatformOverview";
import StatsSection from "./StatsSection";
import { getPublicStats } from "@/data/public/stats";

export const LandingPage = async () => {
  const stats = await getPublicStats();

  return (
    <div className="flex flex-col gap-0">
      <BannerWithNews />
      <HeroSection />
      <StatsSection {...stats} />
      <PlatformOverview />
    </div>
  );
};
