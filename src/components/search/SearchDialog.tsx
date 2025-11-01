"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Search, X, Loader2, User, FileText, ArrowRight } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { globalSearch } from "@/app/actions/search/globalSearch";
import { Link } from "@/components/intl-link";

interface SearchResult {
  deputies: any[];
  complaints: any[];
  totalDeputies: number;
  totalComplaints: number;
}

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const t = useTranslations("Search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      handleSearch(debouncedQuery);
    } else {
      setResults(null);
    }
  }, [debouncedQuery]);

  // Handle Escape key to close dialog
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const handleSearch = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const data = await globalSearch(searchQuery);
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = () => {
    onClose();
    setQuery("");
    setResults(null);
  };

  if (!isOpen) return null;

  const hasResults =
    results &&
    (results.deputies.length > 0 || results.complaints.length > 0);
  const showNoResults =
    !isLoading && debouncedQuery.length >= 2 && !hasResults;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className="fixed inset-x-4 top-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-50"
        role="dialog"
        aria-modal="true"
        aria-label={t("placeholder")}
      >
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b">
            <Search className="h-5 w-5 text-gray-400 flex-shrink-0" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("placeholder")}
              className="flex-1 outline-none text-lg"
              aria-label={t("placeholder")}
              aria-autocomplete="list"
              aria-controls="search-results"
              role="combobox"
              aria-expanded={hasResults}
            />
            {isLoading && (
              <Loader2 className="h-5 w-5 text-primary animate-spin" aria-hidden="true" />
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
              aria-label="إغلاق البحث"
            >
              <X className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </button>
          </div>

          {/* Search Results */}
          <div
            id="search-results"
            className="max-h-[60vh] overflow-y-auto"
            role="listbox"
          >
            {/* Loading State */}
            {isLoading && (
              <div className="p-8 text-center text-gray-500">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" aria-hidden="true" />
                <p>{t("searching")}</p>
              </div>
            )}

            {/* No Results */}
            {showNoResults && (
              <div className="p-8 text-center text-gray-500">
                <p>{t("noResults")}</p>
              </div>
            )}

            {/* Deputies Results */}
            {results && results.deputies.length > 0 && (
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" aria-hidden="true" />
                  {t("deputies")} ({results.totalDeputies})
                </h3>
                <ul className="space-y-2" role="group" aria-label={t("deputies")}>
                  {results.deputies.map((deputy) => (
                    <li key={deputy.id} role="option">
                      <Link
                        href={`/deputies/${deputy.slug}`}
                        onClick={handleResultClick}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        {deputy.avatar_url ? (
                          <img
                            src={deputy.avatar_url}
                            alt={`صورة ${deputy.name}`}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" aria-hidden="true" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {deputy.name}
                          </p>
                          {deputy.governorate && (
                            <p className="text-sm text-gray-500 truncate">
                              {deputy.governorate.name_ar}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Complaints Results */}
            {results && results.complaints.length > 0 && (
              <div className="p-4 border-t">
                <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  {t("complaints")} ({results.totalComplaints})
                </h3>
                <ul className="space-y-2" role="group" aria-label={t("complaints")}>
                  {results.complaints.map((complaint) => (
                    <li key={complaint.id} role="option">
                      <Link
                        href={`/public-complaints/${complaint.id}`}
                        onClick={handleResultClick}
                        className="block p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 line-clamp-1">
                              {complaint.title}
                            </p>
                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                              {complaint.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              {complaint.is_general ? (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                  🌍 شكوى عامة
                                </span>
                              ) : (
                                complaint.governorate && (
                                  <span className="text-xs text-gray-500">
                                    {complaint.governorate.name_ar}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" aria-hidden="true" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* View All Results Link */}
            {hasResults && (results.totalDeputies > 5 || results.totalComplaints > 5) && (
              <div className="p-4 border-t">
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={handleResultClick}
                  className="flex items-center justify-center gap-2 text-primary hover:text-primary/80 font-medium"
                >
                  {t("viewAll")} ({results.totalDeputies + results.totalComplaints})
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
