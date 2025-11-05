"use client";
import { Users, FileText, Clock, CheckCircle, Eye, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { VisitorCounter } from "@/components/VisitorCounter";

interface StatsProps {
  deputiesCount: number;
  newComplaintsCount: number;
  underReviewComplaintsCount: number;
  inProgressComplaintsCount: number;
  resolvedComplaintsCount: number;
}

export default function StatsSection({
  deputiesCount,
  newComplaintsCount,
  underReviewComplaintsCount,
  inProgressComplaintsCount,
  resolvedComplaintsCount,
}: StatsProps) {
  const [counts, setCounts] = useState({
    deputies: 0,
    newComplaints: 0,
    underReview: 0,
    inProgress: 0,
    resolved: 0,
  });

  // Animation effect (count up)
  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;

      setCounts({
        deputies: Math.round(deputiesCount * progress),
        newComplaints: Math.round(newComplaintsCount * progress),
        underReview: Math.round(underReviewComplaintsCount * progress),
        inProgress: Math.round(inProgressComplaintsCount * progress),
        resolved: Math.round(resolvedComplaintsCount * progress),
      });

      if (step >= steps) {
        clearInterval(timer);
        setCounts({
          deputies: deputiesCount,
          newComplaints: newComplaintsCount,
          underReview: underReviewComplaintsCount,
          inProgress: inProgressComplaintsCount,
          resolved: resolvedComplaintsCount,
        });
      }
    }, interval);

    return () => clearInterval(timer);
  }, [deputiesCount, newComplaintsCount, underReviewComplaintsCount, inProgressComplaintsCount, resolvedComplaintsCount]);

  const stats = [
    {
      title: "النواب المسجلون",
      value: counts.deputies,
      icon: Users,
      color: "text-brand-green-dark",
      bgColor: "bg-brand-green-dark/10",
    },
    {
      title: "الشكاوى الجديدة",
      value: counts.newComplaints,
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-600/10",
    },
    {
      title: "قيد المراجعة",
      value: counts.underReview,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-600/10",
    },
    {
      title: "قيد التنفيذ",
      value: counts.inProgress,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-600/10",
    },
    {
      title: "الشكاوى المحلولة",
      value: counts.resolved,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-600/10",
    },
    {
      title: "الزوار المتواجدون",
      value: "visitor",
      icon: Eye,
      color: "text-purple-600",
      bgColor: "bg-purple-600/10",
      isVisitorCounter: true,
    },
  ];

  return (
    <section className="py-16 px-6 bg-white dark:bg-gray-950" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            إحصائيات المنصة
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            أرقام حقيقية تعكس نشاط المنصة وتفاعل المواطنين مع نوابهم
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-lg ${stat.bgColor} flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  {stat.isVisitorCounter ? (
                    <div className="text-3xl font-bold">
                      <VisitorCounter />
                    </div>
                  ) : (
                    <div className="text-3xl font-bold">{stat.value}</div>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">{stat.title}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
