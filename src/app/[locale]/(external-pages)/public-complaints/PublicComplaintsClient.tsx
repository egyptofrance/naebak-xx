"use client";

import { useState, useMemo } from "react";
import { PublicComplaintCard } from "@/components/complaints/PublicComplaintCard";

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
}

interface PublicComplaintsClientProps {
  complaints: Complaint[];
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
  closed: "مغلقة",
};

const governorates = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحيرة", "الفيوم",
  "الغربية", "الإسماعيلية", "المنوفية", "المنيا", "القليوبية", "الوادي الجديد",
  "الشرقية", "سوهاج", "أسوان", "أسيوط", "بني سويف", "بورسعيد",
  "دمياط", "السويس", "الأقصر", "قنا", "البحر الأحمر", "شمال سيناء",
  "جنوب سيناء", "كفر الشيخ", "مطروح"
];

export function PublicComplaintsClient({ complaints }: PublicComplaintsClientProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>("all");

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      if (selectedStatus !== "all" && complaint.status !== selectedStatus) {
        return false;
      }
      if (selectedCategory !== "all" && complaint.category !== selectedCategory) {
        return false;
      }
      if (selectedGovernorate !== "all" && complaint.governorate !== selectedGovernorate) {
        return false;
      }
      return true;
    });
  }, [complaints, selectedStatus, selectedCategory, selectedGovernorate]);

  const statusCounts = useMemo(() => {
    return filteredComplaints.reduce((acc: any, complaint: any) => {
      acc[complaint.status] = (acc[complaint.status] || 0) + 1;
      return acc;
    }, {});
  }, [filteredComplaints]);

  const resetFilters = () => {
    setSelectedStatus("all");
    setSelectedCategory("all");
    setSelectedGovernorate("all");
  };

  const hasActiveFilters = selectedStatus !== "all" || selectedCategory !== "all" || selectedGovernorate !== "all";

  return (
    <>
      {/* Filters */}
      <div className="bg-card border rounded-lg p-6 mb-6" dir="rtl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">تصفية النتائج</h2>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-sm text-primary hover:underline"
            >
              إعادة تعيين الفلاتر
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">الحالة</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background text-center appearance-none"
              style={{ backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", backgroundPosition: "left 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
            >
              <option value="all">جميع الحالات</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">الفئة</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background text-center appearance-none"
              style={{ backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", backgroundPosition: "left 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
            >
              <option value="all">جميع الفئات</option>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Governorate Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">المحافظة</label>
            <select
              value={selectedGovernorate}
              onChange={(e) => setSelectedGovernorate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background text-center appearance-none"
              style={{ backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", backgroundPosition: "left 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
            >
              <option value="all">جميع المحافظات</option>
              {governorates.map((gov) => (
                <option key={gov} value={gov}>
                  {gov}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          عرض {filteredComplaints.length} من {complaints.length} شكوى
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8" dir="rtl">
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">إجمالي النتائج</p>
          <p className="text-2xl font-bold">{filteredComplaints.length}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">جديدة</p>
          <p className="text-2xl font-bold text-blue-600">{statusCounts.new || 0}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">قيد المراجعة</p>
          <p className="text-2xl font-bold text-yellow-600">{statusCounts.under_review || 0}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">قيد المعالجة</p>
          <p className="text-2xl font-bold text-orange-600">{statusCounts.in_progress || 0}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">محلولة</p>
          <p className="text-2xl font-bold text-green-600">{statusCounts.resolved || 0}</p>
        </div>
      </div>

      {/* Complaints List */}
      {filteredComplaints.length === 0 && (
        <div className="text-center py-16 text-muted-foreground" dir="rtl">
          <p className="text-lg">لا توجد شكاوى تطابق الفلاتر المحددة</p>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="mt-4 text-primary hover:underline"
            >
              إعادة تعيين الفلاتر
            </button>
          )}
        </div>
      )}

      <div className="grid gap-4" dir="rtl">
        {filteredComplaints.map((complaint) => (
          <PublicComplaintCard key={complaint.id} complaint={complaint} />
        ))}
      </div>
    </>
  );
}
