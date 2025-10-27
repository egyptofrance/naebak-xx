"use client";

import { Button } from "@/components/ui/button";
import { Locale, usePathname, useRouter } from "@/i18n/routing";
import { Globe } from "lucide-react";
import { useTransition } from "react";

interface LocaleSwitcherSelectProps {
  defaultLocale: Locale;
  options: { value: Locale; label: string }[];
}

export function LocaleSwitcherSelect({
  defaultLocale,
}: LocaleSwitcherSelectProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  function switchLocale() {
    // Toggle between ar and en
    const nextLocale: Locale = defaultLocale === "ar" ? "en" : "ar";
    
    startTransition(() => {
      router.push(pathname, { locale: nextLocale });
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={switchLocale}
      aria-label="تغيير اللغة"
      title="تغيير اللغة"
      disabled={isPending}
      className="hover:bg-accent"
    >
      <Globe className="h-5 w-5" />
    </Button>
  );
}

