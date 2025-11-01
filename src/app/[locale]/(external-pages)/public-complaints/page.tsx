import { getPublicComplaints } from "@/data/complaints/complaints";
import { PublicComplaintsClient } from "./PublicComplaintsClient";
import { AddComplaintButton } from "@/components/complaints/AddComplaintButton";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getAllVisibleGovernorates } from "@/app/actions/governorate/getAllVisibleGovernorates";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PublicComplaintsPage() {
  let complaints = null;
  let error = null;
  let visibleGovernorates: any[] = [];
  
  try {
    const result = await getPublicComplaints();
    complaints = result.data;
    error = result.error;
    visibleGovernorates = await getAllVisibleGovernorates();
  } catch (e: any) {
    console.error("Error in PublicComplaintsPage:", e);
    error = e.message || "حدث خطأ غير متوقع";
  }

  return (
    <div id="main-content" tabIndex={-1} className="container mx-auto p-6 max-w-6xl" dir="rtl">
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
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {complaints && complaints.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">لا توجد شكاوى عامة حالياً</p>
          <p className="text-sm mt-2">
            الشكاوى التي يوافق عليها المواطن والإدارة للنشر ستظهر هنا
          </p>
        </div>
      )}

      {complaints && complaints.length > 0 && (
        <PublicComplaintsClient 
          complaints={complaints} 
          visibleGovernorates={visibleGovernorates}
        />
      )}
    </div>
  );
}

