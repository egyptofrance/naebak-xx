import HeroSection from "./HeroSection";
import BannerWithNews from "./BannerWithNews";
import PlatformOverview from "./PlatformOverview";

export const LandingPage = () => {
  return (
    <div className="flex flex-col gap-0">
      <BannerWithNews />
      <HeroSection />
      <PlatformOverview />
    </div>
  );
};

