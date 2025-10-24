import HeroSection from "./HeroSection";
import CTA from "./cta";

export const LandingPage = () => {
  return (
    <div className="flex flex-col gap-16">
      <HeroSection />
      <CTA />
    </div>
  );
};

