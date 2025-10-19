import { Footer } from "./Footer";
import HeroSection from "./HeroSection";
import CTA from "./cta";
import Integration from "./integration";

export const LandingPage = () => {
  return (
    <div>
      <div className="flex flex-col gap-16">
        <HeroSection />
        <Integration />
        <CTA />
      </div>
      <Footer />
    </div>
  );
};
