"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { SearchDialog } from "./SearchDialog";

export function SearchButton() {
  const t = useTranslations("Search");
  const [isOpen, setIsOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  // Detect if user is on Mac
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  // Handle keyboard shortcut (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* Desktop Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors"
        aria-label={t("placeholder")}
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        <span className="text-sm">{t("shortcut")}</span>
        <kbd className="hidden xl:inline-block px-2 py-0.5 text-xs bg-white/20 rounded">
          {isMac ? "⌘" : "Ctrl"} K
        </kbd>
      </button>

      {/* Mobile Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2 hover:bg-white/10 text-white rounded-md transition-colors"
        aria-label={t("placeholder")}
      >
        <Search className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Search Dialog */}
      <SearchDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
