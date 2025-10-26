import { getCurrentBannerAction } from "@/data/admin/banner";
import { BannerUpload } from "./BannerUpload";

export default async function BannerManagementPage() {
  const bannerData = await getCurrentBannerAction({});
  const currentBanner = bannerData?.data || { image_url: "/images/sisi-banner.jpg" };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">إدارة البانر الرئيسي</h1>
        <p className="text-muted-foreground mt-2">
          تغيير صورة البانر الرئيسي التي تظهر أعلى الصفحة الرئيسية
        </p>
      </div>
      
      <BannerUpload currentImageUrl={currentBanner.image_url} />
    </div>
  );
}
