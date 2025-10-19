import { Footer } from "./Footer";
import HeroSection from "./HeroSection";
import CTA from "./cta";

export const LandingPage = () => {
  return (
    <div>
      <div className="flex flex-col gap-16">
        <HeroSection />
        <CTA />
      </div>
      <Footer />
    </div>
  );
};
