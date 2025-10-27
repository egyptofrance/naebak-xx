"use client";

import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export function LanguageSwitcher() {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    // Remove the current locale from the pathname
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "");
    
    // Build the new path with the new locale
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    
    // Set cookie and navigate
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    router.push(newPath);
    router.refresh();
  };

  // Show opposite language flag
  const targetLocale = currentLocale === "ar" ? "en" : "ar";
  const flagEmoji = targetLocale === "en" ? "🇺🇸" : "🇪🇬";
  const ariaLabel = targetLocale === "en" ? "Switch to English" : "التحويل للعربية";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => switchLocale(targetLocale)}
      aria-label={ariaLabel}
      className="text-2xl hover:bg-accent"
    >
      {flagEmoji}
    </Button>
  );
}

