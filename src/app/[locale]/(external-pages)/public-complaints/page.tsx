import { getPublicComplaints } from "@/data/complaints/complaints";
import { PublicComplaintsClient } from "./PublicComplaintsClient";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AddComplaintButton } from "@/components/complaints/AddComplaintButton";
import { getAllVisibleGovernorates } from "@/app/actions/governorate/getAllVisibleGovernorates";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PublicComplaintsPage() {
  let complaints: any[] = [];
  let error: string | null = null;
  let visibleGovernorates: any[] = [];
  
  try {
    const result = await getPublicComplaints();
    complaints = result.data || [];
    error = result.error || null;
    
    // Get visible governorates for filters
    try {
      visibleGovernorates = await getAllVisibleGovernorates();
    } catch (govError) {
      console.error("Error fetching governorates:", govError);
      // Continue without governorates filter
    }
  } catch (e: any) {
    console.error("Error in PublicComplaintsPage:", e);
    error = e?.message || "حدث خطأ غير متوقع";
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl" dir="rtl">
      <Breadcrumbs />
      
      {/* Compact Header */}
      <div className="flex justify-between items-center mb-6 mt-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">الشكاوى العامة</h1>
          <p className="text-sm text-gray-600 mt-1">
            شكاوى المواطنين المعتمدة للنشر
          </p>
        </div>
        <AddComplaintButton />
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          <p className="font-medium">حدث خطأ</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {!error && complaints.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-xl font-semibold text-gray-700 mb-2">لا توجد شكاوى عامة حالياً</p>
          <p className="text-sm text-gray-500">
            الشكاوى التي يوافق عليها المواطن والإدارة للنشر ستظهر هنا
          </p>
        </div>
      )}
      
      {!error && complaints.length > 0 && (
        <PublicComplaintsClient 
          complaints={complaints} 
          visibleGovernorates={visibleGovernorates}
        />
      )}
    </div>
  );
}
