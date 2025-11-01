"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Eye, Filter } from "lucide-react";

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  governorate: string | null;
  district: string | null;
  created_at: string;
  resolved_at: string | null;
  votes_count: number;
}

interface Governorate {
  id: string;
  name_ar: string;
  name_en: string | null;
}

interface PublicComplaintsClientProps {
  complaints: Complaint[];
  visibleGovernorates: Governorate[];
}

const categoryLabels: Record<string, string> = {
  infrastructure: "البنية التحتية",
  education: "التعليم",
  health: "الصحة",
  security: "الأمن",
  environment: "البيئة",
  transportation: "النقل",
  utilities: "المرافق",
  housing: "الإسكان",
  employment: "التوظيف",
  social_services: "الخدمات الاجتماعية",
  legal: "قانونية",
  corruption: "فساد",
  other: "أخرى",
};

const statusLabels: Record<string, string> = {
  new: "جديدة",
  under_review: "قيد المراجعة",
  in_progress: "قيد المعالجة",
  resolved: "محلولة",
  rejected: "مرفوضة",
  closed: "مغلقة",
};

const ITEMS_PER_PAGE = 10;

export function PublicComplaintsClient({ 
  complaints, 
  visibleGovernorates 
}: PublicComplaintsClientProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter(complaint => {
      const statusMatch = selectedStatus === "all" || complaint.status === selectedStatus;
      const categoryMatch = selectedCategory === "all" || complaint.category === selectedCategory;
      const governorateMatch = 
        selectedGovernorate === "all" || 
        complaint.governorate === selectedGovernorate ||
        (!complaint.governorate && selectedGovernorate === "all");
      
      return statusMatch && categoryMatch && governorateMatch;
    });
  }, [complaints, selectedStatus, selectedCategory, selectedGovernorate]);

  // Pagination
  const totalPages = Math.ceil(filteredComplaints.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentComplaints = filteredComplaints.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFilterChange = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  // Get unique categories and statuses from complaints
  const categories = useMemo(() => {
    const cats = new Set(complaints.map(c => c.category));
    return Array.from(cats);
  }, [complaints]);

  const statuses = useMemo(() => {
    const stats = new Set(complaints.map(c => c.status));
    return Array.from(stats);
  }, [complaints]);

  return (
    <div className="space-y-4">
      {/* Compact Filters */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">تصفية النتائج</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select value={selectedStatus} onValueChange={handleFilterChange(setSelectedStatus)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              {statuses.map(status => (
                <SelectItem key={status} value={status}>
                  {statusLabels[status] || status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={handleFilterChange(setSelectedCategory)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="الفئة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفئات</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {categoryLabels[category] || category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedGovernorate} onValueChange={handleFilterChange(setSelectedGovernorate)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="المحافظة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المحافظات</SelectItem>
              {visibleGovernorates.map(gov => (
                <SelectItem key={gov.id} value={gov.name_ar}>
                  {gov.name_ar}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="flex justify-between items-center text-sm text-gray-600 px-1">
        <span>
          عرض <span className="font-semibold text-gray-900">{startIndex + 1} - {Math.min(endIndex, filteredComplaints.length)}</span> من <span className="font-semibold text-gray-900">{filteredComplaints.length}</span> شكوى
        </span>
      </div>

      {/* Complaints list */}
      <div className="space-y-3">
        {currentComplaints.map((complaint) => (
          <div 
            key={complaint.id} 
            className="bg-white border rounded-lg p-5 hover:shadow-md transition-all duration-200 hover:border-primary/50"
          >
            <div className="flex justify-between items-start gap-4 mb-3">
              <h3 className="text-lg font-bold text-gray-900 flex-1 leading-tight">
                {complaint.title}
              </h3>
              <Link href={`/ar/public-complaints/${complaint.id}`}>
                <Button variant="outline" size="sm" className="shrink-0 h-8">
                  <Eye className="w-3.5 h-3.5 ml-1.5" />
                  <span className="text-xs">التفاصيل</span>
                </Button>
              </Link>
            </div>
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
              {complaint.description}
            </p>
            
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                {categoryLabels[complaint.category] || complaint.category}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                {statusLabels[complaint.status] || complaint.status}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                📍 {complaint.governorate || "عامة"}
              </span>
              {complaint.district && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                  {complaint.district}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* No results */}
      {currentComplaints.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-lg font-medium text-gray-700 mb-1">لا توجد نتائج</p>
          <p className="text-sm text-gray-500">جرب تغيير الفلاتر للحصول على نتائج مختلفة</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="h-9"
          >
            <ChevronRight className="w-4 h-4" />
            <span className="mr-1">السابق</span>
          </Button>
          
          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              // Show first 3, current, and last 3 pages
              let page;
              if (totalPages <= 7) {
                page = i + 1;
              } else if (currentPage <= 4) {
                page = i + 1;
              } else if (currentPage >= totalPages - 3) {
                page = totalPages - 6 + i;
              } else {
                page = currentPage - 3 + i;
              }
              
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="min-w-[36px] h-9 px-2"
                >
                  {page}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="h-9"
          >
            <span className="ml-1">التالي</span>
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
