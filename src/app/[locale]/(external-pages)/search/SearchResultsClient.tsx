"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, User, FileText, Filter } from "lucide-react";
import { searchDeputies } from "@/app/actions/search/searchDeputies";
import { searchComplaints } from "@/app/actions/search/searchComplaints";
import { Link } from "@/components/intl-link";

type FilterType = "all" | "deputies" | "complaints";

export function SearchResultsClient() {
  const searchParams = useSearchParams();
  const t = useTranslations("Search");
  const query = searchParams.get("q") || "";

  const [deputies, setDeputies] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    if (query.trim().length >= 2) {
      handleSearch(query);
    } else {
      setIsLoading(false);
    }
  }, [query]);

  const handleSearch = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const [deputiesData, complaintsData] = await Promise.all([
        searchDeputies(searchQuery),
        searchComplaints(searchQuery),
      ]);
      setDeputies(deputiesData);
      setComplaints(complaintsData);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDeputies = filter === "complaints" ? [] : deputies;
  const filteredComplaints = filter === "deputies" ? [] : complaints;
  const totalResults = filteredDeputies.length + filteredComplaints.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">{t("searching")}</p>
        </div>
      </div>
    );
  }

  if (!query || query.trim().length < 2) {
    return (
      <div className="text-center py-12">
        <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">
          الرجاء إدخال كلمة بحث (حرفين على الأقل)
        </p>
      </div>
    );
  }

  if (totalResults === 0) {
    return (
      <div className="text-center py-12">
        <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 text-lg mb-2">{t("noResults")}</p>
        <p className="text-gray-500">
          جرب كلمات بحث مختلفة أو تحقق من الإملاء
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Search Query & Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">نتائج البحث عن:</p>
            <p className="text-xl font-semibold text-gray-900">"{query}"</p>
            <p className="text-sm text-gray-500 mt-1">
              {totalResults} نتيجة
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" aria-hidden="true" />
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              الكل ({deputies.length + complaints.length})
            </button>
            <button
              onClick={() => setFilter("deputies")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === "deputies"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t("deputies")} ({deputies.length})
            </button>
            <button
              onClick={() => setFilter("complaints")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === "complaints"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t("complaints")} ({complaints.length})
            </button>
          </div>
        </div>
      </div>

      {/* Deputies Results */}
      {filteredDeputies.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" aria-hidden="true" />
            {t("deputies")} ({filteredDeputies.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDeputies.map((deputy) => (
              <Link
                key={deputy.id}
                href={`/deputies/${deputy.slug}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
              >
                <div className="flex items-center gap-3">
                  {deputy.avatar_url ? (
                    <img
                      src={deputy.avatar_url}
                      alt={`صورة ${deputy.name}`}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" aria-hidden="true" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {deputy.name}
                    </p>
                    {deputy.governorate && (
                      <p className="text-sm text-gray-500 truncate">
                        {deputy.governorate.name_ar}
                      </p>
                    )}
                    {deputy.party && (
                      <p className="text-xs text-gray-400 truncate">
                        {deputy.party.name_ar}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Complaints Results */}
      {filteredComplaints.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
            {t("complaints")} ({filteredComplaints.length})
          </h2>
          <div className="space-y-4">
            {filteredComplaints.map((complaint) => (
              <Link
                key={complaint.id}
                href={`/public-complaints/${complaint.id}`}
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
              >
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-1" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {complaint.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {complaint.description}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {complaint.is_general ? (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          🌍 شكوى عامة
                        </span>
                      ) : (
                        complaint.governorate && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {complaint.governorate.name_ar}
                          </span>
                        )
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(complaint.created_at).toLocaleDateString("ar-EG")}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
