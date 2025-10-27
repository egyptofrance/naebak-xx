"use client";

import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = () => {
    // Toggle between ar and en
    const newLocale = currentLocale === "ar" ? "en" : "ar";
    
    // Remove the current locale from the pathname
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "");
    
    // Build the new path with the new locale
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    
    // Set cookie and navigate
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    router.push(newPath);
    router.refresh();
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={switchLocale}
      aria-label="تغيير اللغة"
      title="تغيير اللغة"
      className="hover:bg-accent"
    >
      <Globe className="h-5 w-5" />
    </Button>
  );
}

