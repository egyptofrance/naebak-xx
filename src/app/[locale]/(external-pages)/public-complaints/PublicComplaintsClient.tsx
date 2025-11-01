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
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";

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
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
        <div>
          <label className="text-sm font-medium mb-2 block">الحالة</label>
          <Select value={selectedStatus} onValueChange={handleFilterChange(setSelectedStatus)}>
            <SelectTrigger>
              <SelectValue placeholder="جميع الحالات" />
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
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">الفئة</label>
          <Select value={selectedCategory} onValueChange={handleFilterChange(setSelectedCategory)}>
            <SelectTrigger>
              <SelectValue placeholder="جميع الفئات" />
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
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">المحافظة</label>
          <Select value={selectedGovernorate} onValueChange={handleFilterChange(setSelectedGovernorate)}>
            <SelectTrigger>
              <SelectValue placeholder="جميع المحافظات" />
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
      <div className="text-sm text-muted-foreground">
        عرض {startIndex + 1} - {Math.min(endIndex, filteredComplaints.length)} من {filteredComplaints.length} شكوى
      </div>

      {/* Complaints list */}
      <div className="grid gap-4">
        {currentComplaints.map((complaint) => (
          <div 
            key={complaint.id} 
            className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{complaint.title}</h3>
              <Link href={`/ar/public-complaints/${complaint.id}`}>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 ml-2" />
                  عرض التفاصيل
                </Button>
              </Link>
            </div>
            
            <p className="text-gray-700 mb-4 line-clamp-3">
              {complaint.description}
            </p>
            
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                📂 {categoryLabels[complaint.category] || complaint.category}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                🔄 {statusLabels[complaint.status] || complaint.status}
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                📍 {complaint.governorate || "عامة (كل المحافظات)"}
              </span>
              {complaint.district && (
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full">
                  🏘️ {complaint.district}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* No results */}
      {currentComplaints.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>لا توجد شكاوى تطابق الفلاتر المحددة</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronRight className="w-4 h-4" />
            السابق
          </Button>
          
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="min-w-[40px]"
              >
                {page}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            التالي
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
