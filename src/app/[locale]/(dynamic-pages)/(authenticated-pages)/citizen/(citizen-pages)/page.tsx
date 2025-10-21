import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Heart, MessageSquare, Settings, Users, MapPin } from "lucide-react";
import { Link } from "@/components/intl-link";
import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";

export default async function CitizenDashboard() {
  const supabase = await createSupabaseUserServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get user profile
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  const dashboardCards = [
    {
      title: "الملف الشخصي",
      description: "عرض وتحديث معلوماتك الشخصية",
      icon: <User className="h-8 w-8 text-blue-500" />,
      href: "/citizen/profile",
      color: "bg-blue-50",
    },
    {
      title: "النواب المفضلون",
      description: "متابعة النواب المفضلين لديك",
      icon: <Heart className="h-8 w-8 text-red-500" />,
      href: "/citizen/favorites",
      color: "bg-red-50",
    },
    {
      title: "الرسائل",
      description: "التواصل مع النواب والمديرين",
      icon: <MessageSquare className="h-8 w-8 text-green-500" />,
      href: "/citizen/messages",
      color: "bg-green-50",
    },
    {
      title: "نواب دائرتي",
      description: "عرض نواب دائرتك الانتخابية",
      icon: <MapPin className="h-8 w-8 text-purple-500" />,
      href: "/citizen/my-deputies",
      color: "bg-purple-50",
    },
    {
      title: "جميع النواب",
      description: "تصفح جميع النواب في مصر",
      icon: <Users className="h-8 w-8 text-yellow-500" />,
      href: "/citizen/all-deputies",
      color: "bg-yellow-50",
    },
    {
      title: "الإعدادات",
      description: "إدارة إعدادات حسابك",
      icon: <Settings className="h-8 w-8 text-gray-500" />,
      href: "/citizen/settings",
      color: "bg-gray-50",
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            مرحباً، {userProfile?.full_name || "المواطن"}
          </h1>
          <p className="text-muted-foreground mt-2">
            لوحة التحكم الخاصة بك لمتابعة النواب والتواصل معهم
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dashboardCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className={`w-16 h-16 rounded-lg ${card.color} flex items-center justify-center mb-4`}>
                  {card.icon}
                </div>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>معلوماتك</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">المحافظة</p>
              <p className="text-lg font-semibold">
                {userProfile?.governorate_id || "لم يتم تحديد"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">المدينة</p>
              <p className="text-lg font-semibold">
                {userProfile?.city || "لم يتم تحديد"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">الدائرة الانتخابية</p>
              <p className="text-lg font-semibold">
                {userProfile?.electoral_district || "لم يتم تحديد"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

