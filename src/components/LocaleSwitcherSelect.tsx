"use client";

import { Button } from "@/components/ui/button";
import { Locale, usePathname, useRouter } from "@/i18n/routing";
import { useTransition } from "react";

interface LocaleSwitcherSelectProps {
  defaultLocale: Locale;
  options: { value: Locale; label: string }[];
}

export function LocaleSwitcherSelect({
  defaultLocale,
  options,
}: LocaleSwitcherSelectProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  function onLocaleSelect(nextLocale: Locale) {
    startTransition(() => {
      router.push(pathname, { locale: nextLocale });
    });
  }

  // Show opposite language flag
  const targetLocale = defaultLocale === "ar" ? "en" : "ar";
  const flagEmoji = targetLocale === "en" ? "🇺🇸" : "🇪🇬";
  const ariaLabel = targetLocale === "en" ? "Switch to English" : "التحويل للعربية";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => onLocaleSelect(targetLocale)}
      aria-label={ariaLabel}
      disabled={isPending}
      className="text-2xl hover:bg-accent"
    >
      {flagEmoji}
    </Button>
  );
}

