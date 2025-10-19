import { Link } from "@/components/intl-link";
import Image from "next/image";
import { footerSocialItems } from "./footer-items";

export function Footer() {
  return (
    <footer className="bg-background text-foreground border-t border-border/30">
      <div className="max-w-6xl mx-auto py-8 px-6 lg:px-6 xl:px-0">
        {/* Desktop Layout: Logo (Right) - Copyright (Center) - Social (Left) */}
        {/* Mobile Layout: Logo - Social - Copyright (stacked) */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
          
          {/* Logo - يمين في Desktop، أعلى في Mobile */}
          <div className="flex justify-center lg:justify-start lg:order-1">
            <Link href="/">
              {/* Light Mode: لوجو أخضر */}
              <Image
                src="/images/logo-naebak-green.png"
                alt="نائبك"
                width={128}
                height={128}
                className="object-contain dark:hidden"
              />
              {/* Dark Mode: لوجو أبيض */}
              <Image
                src="/images/logo-naebak-white.png"
                alt="نائبك"
                width={128}
                height={128}
                className="object-contain hidden dark:block"
              />
            </Link>
          </div>

          {/* Copyright - وسط في Desktop، أسفل في Mobile */}
          <div className="flex justify-center lg:order-2 order-3">
            <p className="text-muted-foreground dark:text-slate-400 text-sm text-center">
              © 2025
              <a
                href="https://naebak.com/"
                className="mx-2 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                نائبك.
              </a>
              جميع الحقوق محفوظة
            </p>
          </div>

          {/* Social Icons - يسار في Desktop، وسط في Mobile */}
          <div className="flex justify-center lg:justify-end gap-6 lg:order-3 order-2">
            {footerSocialItems.map((item) => (
              <Link
                key={item.name}
                href={item.url}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <item.icon />
                <span className="sr-only">{item.name}</span>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </footer>
  );
}

