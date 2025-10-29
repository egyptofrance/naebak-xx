import { getCurrentOGImageAction } from "@/data/admin/og-image";
import { OGImageUpload } from "./OGImageUpload";

export default async function OGImageManagementPage() {
  const ogImageData = await getCurrentOGImageAction({});
  const currentOGImage = ogImageData?.data || { image_url: "https://naebak.com/og-image.png" };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">إدارة صورة المشاركة</h1>
        <p className="text-muted-foreground mt-2">
          تغيير الصورة التي تظهر عند مشاركة الموقع على واتساب، فيسبوك، تويتر، وغيرها من منصات التواصل الاجتماعي
        </p>
      </div>
      
      <OGImageUpload currentImageUrl={currentOGImage.image_url} />
    </div>
  );
}
