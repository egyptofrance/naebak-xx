import { Link } from "@/components/intl-link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

export default function HeroSection() {
  const t = useTranslations("HomePage");
  return (
    <>
      <section className="py-10 lg:py-20 text-center px-6 max-w-5xl mx-auto" dir="rtl">
      <div className="flex flex-col gap-10 w-full">
        <div className="space-y-4 flex flex-col items-center flex-1">

          <h1 className="font-semibold text-3xl lg:text-5xl">{t("title")}</h1>
          <p className="text-muted-foreground leading-loose lg:text-lg lg:leading-relaxed max-w-4xl">
            {t("description")}
          </p>

        </div>

      </div>
    </section>
    </>
  );
}
