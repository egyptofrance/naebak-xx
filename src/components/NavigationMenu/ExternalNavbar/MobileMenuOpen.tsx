"use client";

import { useContext } from "react";
import { MobileMenuContext } from "./MobileMenuContext";

export function MobileMenuOpen() {
  const { setMobileMenuOpen, mobileMenuOpen } = useContext(MobileMenuContext);
  return (
    <button
      onClick={() => setMobileMenuOpen((prev) => !prev)}
      className="lg:hidden size-10 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-md flex items-center justify-center transition-colors"
      aria-label="فتح القائمة"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`transition-transform ${mobileMenuOpen ? "rotate-180" : ""}`}
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  );
}
