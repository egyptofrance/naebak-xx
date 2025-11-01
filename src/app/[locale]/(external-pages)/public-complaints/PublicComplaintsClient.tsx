"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Filter,
  MapPin,
  Tag
} from "lucide-react";

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

// All possible statuses from database enum
const ALL_STATUSES = [
  "new",
  "under_review",
  "assigned_to_deputy",
  "accepted",
  "in_progress",
  "on_hold",
  "rejected",
  "resolved",
  "closed",
  "archived"
] as const;

// All possible categories from database enum
const ALL_CATEGORIES = [
  "infrastructure",
  "education",
  "health",
  "security",
  "environment",
  "transportation",
  "utilities",
  "housing",
  "employment",
  "social_services",
  "legal",
  "corruption",
  "other"
] as const;

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
  assigned_to_deputy: "محالة للنائب",
  accepted: "مقبولة",
  in_progress: "قيد المعالجة",
  on_hold: "معلقة",
  rejected: "مرفوضة",
  resolved: "محلولة",
  closed: "مغلقة",
  archived: "مؤرشفة",
};

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 border-blue-300",
  under_review: "bg-yellow-100 text-yellow-700 border-yellow-300",
  assigned_to_deputy: "bg-purple-100 text-purple-700 border-purple-300",
  accepted: "bg-cyan-100 text-cyan-700 border-cyan-300",
  in_progress: "bg-orange-100 text-orange-700 border-orange-300",
  on_hold: "bg-amber-100 text-amber-700 border-amber-300",
  rejected: "bg-red-100 text-red-700 border-red-300",
  resolved: "bg-green-100 text-green-700 border-green-300",
  closed: "bg-gray-100 text-gray-700 border-gray-300",
  archived: "bg-slate-100 text-slate-700 border-slate-300",
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

  return (
    <div className="space-y-6">
      {/* Compact Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="text-sm text-muted-foreground">إجمالي:</span>
                <span className="text-lg font-bold">{complaints.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-muted-foreground">محلولة:</span>
                <span className="text-lg font-bold text-green-600">
                  {complaints.filter(c => c.status === "resolved").length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span className="text-sm text-muted-foreground">قيد المعالجة:</span>
                <span className="text-lg font-bold text-orange-600">
                  {complaints.filter(c => c.status === "in_progress").length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-sm text-muted-foreground">جديدة:</span>
                <span className="text-lg font-bold text-blue-600">
                  {complaints.filter(c => c.status === "new").length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">تصفية النتائج</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  الحالة
                </label>
                <Select value={selectedStatus} onValueChange={handleFilterChange(setSelectedStatus)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="جميع الحالات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    {ALL_STATUSES.map(status => (
                      <SelectItem key={status} value={status}>
                        {statusLabels[status] || status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  الفئة
                </label>
                <Select value={selectedCategory} onValueChange={handleFilterChange(setSelectedCategory)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="جميع الفئات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الفئات</SelectItem>
                    {ALL_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>
                        {categoryLabels[category] || category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  المحافظة
                </label>
                <Select value={selectedGovernorate} onValueChange={handleFilterChange(setSelectedGovernorate)}>
                  <SelectTrigger className="w-full">
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
          </CardContent>
        </Card>
      </motion.div>

      {/* Results count */}
      <div className="flex justify-between items-center px-1">
        <p className="text-sm text-muted-foreground">
          عرض <span className="font-bold text-foreground">{startIndex + 1}-{Math.min(endIndex, filteredComplaints.length)}</span> من <span className="font-bold text-foreground">{filteredComplaints.length}</span> شكوى
        </p>
      </div>

      {/* Complaints list */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {currentComplaints.map((complaint, index) => (
            <motion.div
              key={complaint.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-r-4 border-r-primary/20 hover:border-r-primary">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-2 leading-tight">
                        {complaint.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {complaint.description}
                      </p>
                    </div>
                    <Link href={`/ar/public-complaints/${complaint.id}`}>
                      <Button size="sm" className="shrink-0 gap-2">
                        <Eye className="w-4 h-4" />
                        عرض التفاصيل
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={statusColors[complaint.status] || "bg-gray-100"}>
                      {statusLabels[complaint.status] || complaint.status}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {categoryLabels[complaint.category] || complaint.category}
                    </Badge>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      <MapPin className="w-3 h-3 ml-1" />
                      {complaint.governorate || "عامة"}
                    </Badge>
                    {complaint.district && (
                      <Badge variant="outline" className="bg-gray-50 text-gray-700">
                        {complaint.district}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* No results */}
      {currentComplaints.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">لا توجد نتائج</h3>
          <p className="text-muted-foreground">جرب تغيير الفلاتر للحصول على نتائج مختلفة</p>
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronRight className="w-4 h-4 ml-1" />
            السابق
          </Button>
          
          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
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
                  className="min-w-[40px]"
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
          >
            التالي
            <ChevronLeft className="w-4 h-4 mr-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
