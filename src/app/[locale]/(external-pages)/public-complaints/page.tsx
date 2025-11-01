import { getPublicComplaints } from "@/data/complaints/complaints";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AddComplaintButton } from "@/components/complaints/AddComplaintButton";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PublicComplaintsPage() {
  let complaints = null;
  let error = null;
  
  try {
    const result = await getPublicComplaints();
    complaints = result.data;
    error = result.error;
  } catch (e: any) {
    console.error("Error:", e);
    error = e?.message || "حدث خطأ";
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
      
      {!error && complaints && (
        <div className="bg-green-100 text-green-800 p-4 rounded-md mb-4">
          ✅ تم جلب الشكاوى بنجاح! عدد الشكاوى: {complaints?.length || 0}
        </div>
      )}
      
      {complaints && complaints.length > 0 && (
        <div className="grid gap-4">
          {complaints.map((c: any) => (
            <div key={c.id} className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-2">{c.title}</h3>
              <p className="text-gray-700 mb-4">{c.description?.substring(0, 200)}...</p>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>📂 {c.category}</span>
                <span>📍 {c.governorate || "عامة"}</span>
                <span>🔄 {c.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {complaints && complaints.length === 0 && (
        <p className="text-center text-gray-600 py-8">لا توجد شكاوى عامة حالياً</p>
      )}
    </div>
  );
}
