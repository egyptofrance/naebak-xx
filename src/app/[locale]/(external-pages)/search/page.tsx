import { Suspense } from "react";
import { SearchResultsClient } from "./SearchResultsClient";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata = {
  title: "نتائج البحث - نائبك",
  description: "نتائج البحث عن النواب والشكاوى",
};

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs />
        
        <div className="mt-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6" id="main-content">
            نتائج البحث
          </h1>

          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            }
          >
            <SearchResultsClient />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
