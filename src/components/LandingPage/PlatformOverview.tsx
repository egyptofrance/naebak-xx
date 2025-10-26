"use client";
import { Users, Building2, MessageSquare, ArrowRight } from "lucide-react";

export default function PlatformOverview() {
  return (
    <section className="py-16 px-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            كيف تعمل المنصة؟
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            منصة تربط المواطن المصري بممثليه في المجالس النيابية والمحلية
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 items-center">
          {/* Citizens Side */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border-2 border-blue-500 hover:shadow-xl transition-shadow">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mb-6">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">المواطنون</h3>
              <p className="text-muted-foreground mb-6">
                مشاركة فعالة في تقديم الشكاوى وتقييم أداء النواب
              </p>
              <ul className="text-right w-full space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">✓</span>
                  <span>تقديم الشكاوى للنواب</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">✓</span>
                  <span>متابعة حالة الشكوى بشفافية</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">✓</span>
                  <span>تقييم أداء النواب</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">✓</span>
                  <span>مشاركة فعالة في العملية النيابية</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Connection Arrow */}
          <div className="hidden lg:flex flex-col items-center justify-center">
            <div className="relative">
              <MessageSquare className="w-16 h-16 text-[#F87B1B] mb-4" />
              <div className="flex items-center gap-2 text-[#F87B1B] font-bold">
                <ArrowRight className="w-6 h-6" />
                <span>تواصل مباشر</span>
                <ArrowRight className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Deputies Side */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border-2 border-green-500 hover:shadow-xl transition-shadow">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">النواب</h3>
              <p className="text-muted-foreground mb-6">
                التواصل مع أبناء الدائرة وحل مشاكلهم عن قرب ونقل صوتهم للمجلس
              </p>
              <ul className="text-right w-full space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span className="font-semibold">مجلس النواب</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span className="font-semibold">مجلس الشيوخ</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span className="font-semibold">المجالس المحلية</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span className="font-semibold">مجالس أخرى</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Stats or CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#F87B1B] text-white rounded-full font-bold text-lg hover:bg-[#E06A0A] transition-colors cursor-pointer">
            <span>ابدأ الآن في تقديم شكواك</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    </section>
  );
}
