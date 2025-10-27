"use client";

import { Link } from "@/components/intl-link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { DocsMobileNavigation } from "./DocsMobileNavigation";
import { navbarLinks } from "./constants";

export function LeftNav() {
  const pathname = usePathname();
  const t = useTranslations("Navigation");

  const isBlogPage = pathname?.startsWith("/blog");
  const isDocsPage = pathname?.startsWith("/docs");

  return (
    <div className="flex items-center gap-8">
      <DocsMobileNavigation />
      <ul className="hidden lg:flex gap-8 font-medium items-center">
        {navbarLinks.map(({ key, href }) => (
          <li
            key={key}
            className="text-white/80 font-regular text-sm hover:text-white"
          >
            <Link href={href}>{t(key)}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

