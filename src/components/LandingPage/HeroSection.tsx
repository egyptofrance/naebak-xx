import { Link } from "@/components/intl-link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";


export default function HeroSection() {
  const t = useTranslations("HomePage");
  return (
    <>
      {/* بانر السيسي الرئيسي */}
      <div className="w-full">
        <Image
          alt="بانر نائبك"
          src="/images/sisi-banner.jpg"
          width={1920}
          height={400}
          className="w-full h-auto object-cover"
          priority
        />
      </div>
      <section className="py-10 lg:py-20 text-left px-6 lg:text-center max-w-5xl mx-auto">
      <div className="flex flex-col gap-10 w-full">
        <div className="space-y-4 flex flex-col  lg:items-center  flex-1">
          <Link href={"#"}>
            <div className="flex items-center  gap-2 py-1 px-3 w-fit rounded-full border border-border dark:border-none bg-secondary">
              <Sparkles size={16} />
              <span className="text-md font-medium lg:text-base">
                Introducing
              </span>
              <ArrowRight size={16} />
            </div>
          </Link>
          <h1 className="font-semibold text-3xl lg:text-5xl">{t("title")}</h1>
          <p className="text-muted-foreground leading-loose lg:text-lg lg:leading-relaxed max-w-4xl">
            {t("description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:justify-center pt-4">
            <Button className="w-full sm:w-auto sm:min-w-32" asChild>
              <Link href={"/login"}>
                Log In
                <ArrowRight size={16} className="ml-2" />
              </Link>
            </Button>
            <Button
              className="w-full sm:w-auto sm:min-w-32"
              variant={"secondary"}
            >
              Learn More
              <ChevronRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>

      </div>
    </section>
    </>
  );
}
