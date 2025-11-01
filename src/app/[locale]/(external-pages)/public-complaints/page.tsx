import { getPublicComplaints } from "@/data/complaints/complaints";
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
    console.error("Error:", e);
    error = e?.message || "حدث خطأ";
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl" dir="rtl">
      <h1 className="text-3xl font-bold mb-2">الشكاوى العامة</h1>
      
      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4">
          خطأ: {error}
        </div>
      )}
      
      {!error && (
        <div className="bg-green-100 text-green-800 p-4 rounded-md mb-4">
          ✅ تم جلب البيانات بنجاح!
          <br />
          عدد الشكاوى: {complaints?.length || 0}
          <br />
          عدد المحافظات: {visibleGovernorates?.length || 0}
        </div>
      )}
      
      {complaints && complaints.length > 0 && (
        <div className="space-y-4">
          {complaints.map((c: any) => (
            <div key={c.id} className="border p-4 rounded">
              <h3 className="font-bold">{c.title}</h3>
              <p className="text-sm text-gray-600">{c.description?.substring(0, 100)}...</p>
              <p className="text-xs text-gray-500 mt-2">
                المحافظة: {c.governorate || "عامة (كل المحافظات)"}
              </p>
            </div>
          ))}
        </div>
      )}
      
      {complaints && complaints.length === 0 && (
        <p className="text-gray-600">لا توجد شكاوى حالياً</p>
      )}
    </div>
  );
}
