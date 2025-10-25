import HeroSection from "./HeroSection";
import BannerWithNews from "./BannerWithNews";

export const LandingPage = () => {
  return (
    <div className="flex flex-col gap-16">
      <BannerWithNews />
      <HeroSection />
    </div>
  );
};

