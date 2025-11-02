import { getAllJobCategories } from '@/data/jobs/lookups';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'إدارة تصنيفات الوظائف - لوحة التحكم',
  description: 'إدارة تصنيفات الوظائف المتاحة في المنصة',
};

export default async function JobCategoriesPage() {
  const categories = await getAllJobCategories();

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">إدارة تصنيفات الوظائف</h1>
            <p className="text-muted-foreground mt-2">
              إدارة التصنيفات المتاحة للوظائف في المنصة
            </p>
          </div>
          <Button asChild>
            <Link href="/app_admin/job-categories/new">
              <Plus className="h-4 w-4 ml-2" />
              إضافة تصنيف جديد
            </Link>
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">إجمالي التصنيفات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">التصنيفات النشطة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {categories.filter(c => c.is_active).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">التصنيفات غير النشطة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {categories.filter(c => !c.is_active).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories Table */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة التصنيفات</CardTitle>
            <CardDescription>
              جميع تصنيفات الوظائف المتاحة في النظام
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">لا توجد تصنيفات حالياً</p>
                <Button asChild className="mt-4">
                  <Link href="/app_admin/job-categories/new">
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة أول تصنيف
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right p-4 font-medium">الترتيب</th>
                      <th className="text-right p-4 font-medium">الاسم بالعربية</th>
                      <th className="text-right p-4 font-medium">الاسم بالإنجليزية</th>
                      <th className="text-right p-4 font-medium">المعرف (Slug)</th>
                      <th className="text-right p-4 font-medium">الحالة</th>
                      <th className="text-right p-4 font-medium">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <Badge variant="outline">{category.display_order}</Badge>
                        </td>
                        <td className="p-4 font-medium">{category.name_ar}</td>
                        <td className="p-4 text-muted-foreground">
                          {category.name_en || '-'}
                        </td>
                        <td className="p-4">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {category.slug}
                          </code>
                        </td>
                        <td className="p-4">
                          {category.is_active ? (
                            <Badge variant="default" className="flex items-center gap-1 w-fit">
                              <Eye className="h-3 w-3" />
                              نشط
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                              <EyeOff className="h-3 w-3" />
                              غير نشط
                            </Badge>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <Link href={`/app_admin/job-categories/${category.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">ملاحظات مهمة</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• التصنيفات النشطة فقط تظهر للمستخدمين في صفحة الوظائف</p>
            <p>• يمكن ترتيب التصنيفات باستخدام حقل "الترتيب"</p>
            <p>• المعرف (Slug) يجب أن يكون فريداً ويستخدم في URLs</p>
            <p>• لا يمكن حذف تصنيف مرتبط بوظائف موجودة</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
