"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/components/intl-link";
import { ChevronLeft, Home } from "lucide-react";
import { Fragment } from "react";

interface BreadcrumbItem {
  label: string;
  href: string;
}

const pathLabels: Record<string, string> = {
  "": "الرئيسية",
  "deputies": "النواب",
  "deputy": "النائب",
  "public-complaints": "الشكاوى العامة",
  "complaints": "الشكاوى",
  "about": "عن المنصة",
  "contact": "اتصل بنا",
  "privacy": "سياسة الخصوصية",
  "terms": "الشروط والأحكام",
  "app_admin": "لوحة التحكم",
  "users": "المستخدمين",
  "settings": "الإعدادات",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  
  // Remove locale from pathname (e.g., /ar/deputies -> /deputies)
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/');
  
  // Split path into segments
  const segments = pathWithoutLocale.split('/').filter(Boolean);
  
  // Build breadcrumb items
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "الرئيسية", href: "/" }
  ];
  
  let currentPath = "";
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Skip dynamic segments (like IDs or slugs) unless it's the last segment
    if (segment.match(/^[0-9a-f-]{36}$/i) || segment.match(/^\d+$/)) {
      // Skip UUIDs and numeric IDs in the middle of the path
      if (index < segments.length - 1) {
        return;
      }
    }
    
    const label = pathLabels[segment] || segment;
    breadcrumbs.push({
      label,
      href: currentPath
    });
  });
  
  // Don't show breadcrumbs on homepage
  if (breadcrumbs.length <= 1) {
    return null;
  }
  
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <Fragment key={crumb.href}>
              <li className="flex items-center gap-2">
                {index === 0 && <Home className="h-4 w-4" />}
                {isLast ? (
                  <span className="font-medium text-foreground">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="hover:text-primary transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </li>
              {!isLast && (
                <ChevronLeft className="h-4 w-4 text-muted-foreground/50 rotate-180" />
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
