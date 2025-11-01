"use client";

import { Menu, X } from "lucide-react";
import { useContext } from "react";
import { MobileMenuContext } from "./MobileMenuContext";

export function MobileMenuOpen() {
  const { setMobileMenuOpen, mobileMenuOpen } = useContext(MobileMenuContext);
  return (
    <button
      onClick={() => setMobileMenuOpen((prev) => !prev)}
      className="lg:hidden p-2 text-white hover:text-white/80 transition-colors"
      aria-label={mobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
    >
      {mobileMenuOpen ? (
        <X className="h-7 w-7" strokeWidth={2.5} />
      ) : (
        <Menu className="h-7 w-7" strokeWidth={2.5} />
      )}
    </button>
  );
}
