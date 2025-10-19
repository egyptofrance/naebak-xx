import { Footer } from "./Footer";
import HeroSection from "./HeroSection";
import CTA from "./cta";
import FAQ from "./faq";
import Integration from "./integration";

export const LandingPage = () => {
  return (
    <div>
      <div className="flex flex-col gap-16">
        <HeroSection />
        <Integration />
        <FAQ />
        <CTA />
      </div>
      <Footer />
    </div>
  );
};
