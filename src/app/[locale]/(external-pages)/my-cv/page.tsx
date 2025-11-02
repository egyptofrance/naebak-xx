import { redirect } from 'next/navigation';
import { serverGetLoggedInUser } from '@/utils/server/serverGetLoggedInUser';
import { getEmploymentProfile } from '@/data/employment/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function MyCVPage() {
  const user = await serverGetLoggedInUser();

  if (!user) {
    redirect('/sign-in');
  }

  const profile = await getEmploymentProfile();

  if (!profile) {
    redirect('/complete-employment-profile');
  }

  return (
    <div className="min-h-screen bg-background py-12" dir="rtl">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">سيرتي الذاتية</h1>
          <Button asChild>
            <Link href="/complete-employment-profile">تعديل البيانات</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>البيانات الشخصية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">الاسم الكامل</p>
                <p className="font-medium">{profile.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                <p className="font-medium">{profile.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                <p className="font-medium">{profile.phone}</p>
              </div>
              {profile.national_id && (
                <div>
                  <p className="text-sm text-muted-foreground">الرقم القومي</p>
                  <p className="font-medium">{profile.national_id}</p>
                </div>
              )}
              {profile.date_of_birth && (
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ الميلاد</p>
                  <p className="font-medium">
                    {new Date(profile.date_of_birth).toLocaleDateString('ar-EG')}
                  </p>
                </div>
              )}
              {profile.governorate && (
                <div>
                  <p className="text-sm text-muted-foreground">المحافظة</p>
                  <p className="font-medium">{profile.governorate}</p>
                </div>
              )}
              {profile.city && (
                <div>
                  <p className="text-sm text-muted-foreground">المدينة</p>
                  <p className="font-medium">{profile.city}</p>
                </div>
              )}
              {profile.address && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">العنوان</p>
                  <p className="font-medium">{profile.address}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>المؤهلات والخبرات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.education_level && (
                <div>
                  <p className="text-sm text-muted-foreground">المستوى التعليمي</p>
                  <p className="font-medium">{profile.education_level}</p>
                </div>
              )}
              {profile.years_of_experience !== null && (
                <div>
                  <p className="text-sm text-muted-foreground">سنوات الخبرة</p>
                  <p className="font-medium">{profile.years_of_experience} سنة</p>
                </div>
              )}
              {profile.education_details && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">تفاصيل التعليم</p>
                  <p className="font-medium whitespace-pre-wrap">{profile.education_details}</p>
                </div>
              )}
              {profile.previous_experience && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">الخبرات السابقة</p>
                  <p className="font-medium whitespace-pre-wrap">{profile.previous_experience}</p>
                </div>
              )}
              {profile.skills && profile.skills.length > 0 && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground mb-2">المهارات</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-center">
          <Button asChild variant="outline">
            <Link href="/jobs">تصفح الوظائف المتاحة</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
