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
    <div className="container mx-auto p-6 max-w-6xl" dir="rtl">
      <Breadcrumbs />
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">الشكاوى العامة</h1>
          <p className="text-muted-foreground">
            شكاوى المواطنين التي تم الموافقة على نشرها للعامة من قبل الإدارة
          </p>
        </div>
        <AddComplaintButton />
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4">
          خطأ: {error}
        </div>
      )}
      
      {!error && complaints.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">لا توجد شكاوى عامة حالياً</p>
          <p className="text-sm mt-2">
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
