"use client";

import { RefreshCw } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { revalidateCurrentPage } from "@/app/actions/revalidate";
import { useTranslations } from "next-intl";

/**
 * زر التحديث الفوري للصفحة
 * يظهر في الهيدر ويسمح بتحديث البيانات دون انتظار انتهاء مدة الـ cache
 */
export function RefreshButton() {
  const pathname = usePathname();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const t = useTranslations();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      await revalidateCurrentPage(pathname);
      // إعادة تحميل الصفحة لعرض البيانات الجديدة
      window.location.reload();
    } catch (error) {
      console.error("Error refreshing page:", error);
      setIsRefreshing(false);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      title={isRefreshing ? "جاري التحديث..." : "تحديث الصفحة"}
      aria-label="تحديث الصفحة"
    >
      <RefreshCw 
        className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
      />
      <span className="hidden md:inline text-sm font-medium">
        {isRefreshing ? "جاري التحديث..." : "تحديث"}
      </span>
    </button>
  );
}
