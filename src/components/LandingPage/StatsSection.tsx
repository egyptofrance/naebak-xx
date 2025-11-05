"use client";
import { Users, MessageSquare, CheckCircle, TrendingUp, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { VisitorCounter } from "@/components/VisitorCounter";

interface StatsProps {
  deputiesCount: number;
  activeComplaintsCount: number;
  resolvedComplaintsCount: number;
  resolutionRate: number;
}

export default function StatsSection({
  deputiesCount,
  activeComplaintsCount,
  resolvedComplaintsCount,
  resolutionRate,
}: StatsProps) {
  const [counts, setCounts] = useState({
    deputies: 0,
    active: 0,
    resolved: 0,
    rate: 0,
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
        active: Math.round(activeComplaintsCount * progress),
        resolved: Math.round(resolvedComplaintsCount * progress),
        rate: Math.round(resolutionRate * progress),
      });

      if (step >= steps) {
        clearInterval(timer);
        setCounts({
          deputies: deputiesCount,
          active: activeComplaintsCount,
          resolved: resolvedComplaintsCount,
          rate: resolutionRate,
        });
      }
    }, interval);

    return () => clearInterval(timer);
  }, [deputiesCount, activeComplaintsCount, resolvedComplaintsCount, resolutionRate]);

  const stats = [
    {
      title: "النواب المسجلون",
      value: counts.deputies,
      icon: Users,
      color: "text-brand-green-dark",
      bgColor: "bg-brand-green-dark/10",
    },
    {
      title: "الشكاوى النشطة",
      value: counts.active,
      icon: MessageSquare,
      color: "text-brand-green",
      bgColor: "bg-brand-green/10",
    },
    {
      title: "الزوار المتواجدون",
      value: "visitor",
      icon: Eye,
      color: "text-blue-600",
      bgColor: "bg-blue-600/10",
      isVisitorCounter: true,
    },
    {
      title: "الشكاوى المحلولة",
      value: counts.resolved,
      icon: CheckCircle,
      color: "text-brand-green-dark",
      bgColor: "bg-brand-green-dark/10",
    },
    {
      title: "معدل الحل",
      value: `${counts.rate}%`,
      icon: TrendingUp,
      color: "text-brand-green",
      bgColor: "bg-brand-green/10",
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
