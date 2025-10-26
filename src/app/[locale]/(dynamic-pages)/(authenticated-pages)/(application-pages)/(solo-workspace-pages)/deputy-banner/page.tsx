import { getDeputyBannerAction } from "@/data/deputy/banner";
import { DeputyBannerUpload } from "./DeputyBannerUpload";
import { redirect } from "next/navigation";

export default async function DeputyBannerManagementPage() {
  const bannerData = await getDeputyBannerAction({});
  
  if (!bannerData?.data) {
    redirect("/home");
  }

  const { bannerImage, deputyId, slug } = bannerData.data;
  const defaultBanner = "/images/sisi-banner.jpg";

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">إدارة بانر الصفحة الشخصية</h1>
        <p className="text-muted-foreground mt-2">
          تغيير صورة البانر التي تظهر أعلى صفحتك الشخصية العامة
        </p>
        {slug && (
          <p className="text-sm text-muted-foreground mt-1">
            رابط صفحتك: <a href={`/deputy/${slug}`} target="_blank" className="text-primary hover:underline">/deputy/{slug}</a>
          </p>
        )}
      </div>
      
      <DeputyBannerUpload currentImageUrl={bannerImage || defaultBanner} />
    </div>
  );
}

